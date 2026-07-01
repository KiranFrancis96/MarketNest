import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Order } from "../entities/order.entity.ts";

export interface IOrderRepository extends IBaseRepository<Order> {
  findByUserId(userId: string): Promise<Order[]>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null>;
}
