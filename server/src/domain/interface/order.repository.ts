import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Order } from "../entities/order.entity.ts";
import mongoose from "mongoose"

export interface IOrderRepository extends IBaseRepository<Order> {
  findByUserId(userId: string): Promise<Order[]>;
  findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null>;
  getPurchaseFreq(userId:string):Promise<{
      _id:mongoose.Types.ObjectId,
      count:number,
      lastBought:Date
    } []| null>
}
