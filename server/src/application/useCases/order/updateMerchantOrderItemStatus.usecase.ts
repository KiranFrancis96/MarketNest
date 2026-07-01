import type { IUpdateMerchantOrderItemStatusUseCase } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { Order } from "@/domain/entities/order.entity.ts";
import type { UpdateMerchantOrderItemStatusInputDTO } from "@/application/dtos/order/OrderDtos.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { NotificationService } from "@/application/services/NotificationService.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_PRODUCT_NOT_FOUND,
  MSG_ORDER_ITEM_MANAGE_DENIED,
  MSG_ORDER_NOT_FOUND,
  MSG_ORDER_ITEM_NOT_FOUND,
  MSG_ORDER_STATUS_UPDATE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";
import logger from "@/utils/logger.ts";

export class UpdateMerchantOrderItemStatusUseCase implements IUpdateMerchantOrderItemStatusUseCase {
  constructor(
    private _orderRepository: IOrderRepository,
    private _productRepository: IProductRepository,
    private _notificationService: NotificationService
  ) { }

  async execute({
    merchantId,
    orderId,
    productId,
    status
  }: UpdateMerchantOrderItemStatusInputDTO): Promise<Order> {

    const product = await this._productRepository.findById(productId);
    if (!product) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_PRODUCT_NOT_FOUND);
    }

    if (product.merchantId.toString() !== merchantId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_ORDER_ITEM_MANAGE_DENIED);
    }


    const order = await this._orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
    }


    const itemIndex = order.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_ITEM_NOT_FOUND);
    }

    const oldStatus = order.items[itemIndex].status || "pending";
    order.items[itemIndex].status = status;


    const updatedOrder = await this._orderRepository.updateById(orderId, order);
    if (!updatedOrder) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ORDER_STATUS_UPDATE_FAILED);
    }

    logger.info(
      `[UpdateMerchantOrderItemStatus] Merchant ${merchantId} updated Product ${productId} in Order ${orderId} from ${oldStatus} to ${status}`
    );


    try {
      const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const title = `Order Update: ${displayStatus}`;
      const message = `The status of your item "${product.name}" has been updated to "${displayStatus}".`;

      await this._notificationService.send(
        order.userId,
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
    } catch (notifErr: unknown) {
      const err = notifErr instanceof Error ? notifErr : new Error(String(notifErr));
      logger.error(err, `Failed to send order update notification to buyer: ${order.userId}`);
    }

    return updatedOrder;
  }
}
