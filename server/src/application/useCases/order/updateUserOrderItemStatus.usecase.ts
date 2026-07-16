import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";
import type { Order } from "@/domain/entities/order.entity.ts";
import type { UpdateUserOrderItemStatusInputDTO } from "@/application/dtos/order/OrderDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_ORDER_NOT_FOUND,
  MSG_ORDER_ACCESS_DENIED,
  MSG_ORDER_ITEM_NOT_FOUND,
  MSG_CANCEL_ALREADY,
  MSG_RETURN_ALREADY,
  MSG_INVALID_STATUS_CHANGE,
  MSG_ITEM_STATUS_UPDATE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";
import logger from "@/utils/logger.ts";

export class UpdateUserOrderItemStatusUseCase {
  constructor(
    private _orderRepository: IOrderRepository,
    private _productRepository: IProductRepository,
    private _notificationService: NotificationService
  ) {}

  async execute({
    userId,
    orderId,
    productId,
    status
  }: UpdateUserOrderItemStatusInputDTO): Promise<Order> {
    const order = await this._orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
    }

    if (order.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_ORDER_ACCESS_DENIED);
    }

    const itemIndex = order.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_ITEM_NOT_FOUND);
    }

    const currentItem = order.items[itemIndex];
    const oldStatus = currentItem.status || "pending";

    if (status === "cancelled") {
      if (oldStatus !== "pending" && oldStatus !== "processing") {
        throw new ApiError(HttpStatus.BAD_REQUEST, MSG_CANCEL_ALREADY + oldStatus);
      }
    } else if (status === "returned") {
      if (oldStatus !== "completed" && oldStatus !== "shipped") {
        throw new ApiError(HttpStatus.BAD_REQUEST, MSG_RETURN_ALREADY + oldStatus);
      }
    } else {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_INVALID_STATUS_CHANGE);
    }

    order.items[itemIndex].status = status;

    const updatedOrder = await this._orderRepository.updateById(orderId, order);
    if (!updatedOrder) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ITEM_STATUS_UPDATE_FAILED);
    }

    logger.info(
      `[UpdateUserOrderItemStatus] User ${userId} updated Product ${productId} in Order ${orderId} from ${oldStatus} to ${status}`
    );

    try {
      const product = await this._productRepository.findById(productId);
      if (product) {
        const actionLabel = status === "cancelled" ? "Cancelled" : "Return Request";
        const title = `Item ${actionLabel}: Order #${orderId.slice(-6)}`;
        const message = `A customer has ${status === "cancelled" ? "cancelled" : "requested a return for"} "${product.name}" (Qty: ${currentItem.quantity}) in Order #${orderId.slice(-6)}.`;

        await this._notificationService.send(
          product.merchantId.toString(),
          title,
          message,
          "ORDER_UPDATE",
          {
            orderId,
            productId,
            status,
            productName: product.name
          }
        );
      }
    } catch (notifErr) {
      logger.error(notifErr, `Failed to send status update notification to merchant for product: ${productId}`);
    }

    return updatedOrder;
  }
}
