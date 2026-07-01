import type { IGetAdminUserOrdersUseCase } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { Order } from "@/domain/entities/order.entity.ts";

export class GetAdminUserOrdersUseCase implements IGetAdminUserOrdersUseCase {
  constructor(private _orderRepository: IOrderRepository) {}

  async execute(userId: string): Promise<Order[]> {
    const orders = await this._orderRepository.findByUserId(userId);
    return orders.filter((order) => order.status === "paid");
  }
}
