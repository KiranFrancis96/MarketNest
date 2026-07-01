import { BaseRepository } from "./BaseRepository.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { Order } from "@/domain/entities/order.entity.ts";
import { OrderModel } from "../models/order.model.ts";
import { OrderMapper } from "../mappers/OrderMapper.ts";

export class OrderRepository extends BaseRepository<Order> implements IOrderRepository {
  constructor() {
    super(OrderModel, OrderMapper);
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await this.model
      .find({ userId })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as Order);
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    const doc = await this.model
      .findOne({ razorpayOrderId })
      .populate("items.productId")
      .lean();
    return doc ? (this.mapper.toEntity(doc) as Order) : null;
  }

  override async findById(id: string): Promise<Order | null> {
    const doc = await this.model
      .findById(id)
      .populate("items.productId")
      .lean();
    return doc ? (this.mapper.toEntity(doc) as Order) : null;
  }
}
