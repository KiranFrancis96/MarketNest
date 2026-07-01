import type { IGetOrderByIdUseCase } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { Order } from "@/domain/entities/order.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_ORDER_NOT_FOUND,
  MSG_UNAUTHORIZED_ORDER_VIEW,
} from "@/presentation/http/controllers/messages.constants.ts";

export class GetOrderByIdUseCase implements IGetOrderByIdUseCase {
  constructor(private _orderRepository: IOrderRepository) {}

  async execute(orderId: string, userId: string): Promise<Order> {
    const order = await this._orderRepository.findById(orderId);
    if (!order) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
    }

    if (order.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_UNAUTHORIZED_ORDER_VIEW);
    }

    return order;
  }
}
