import { BaseRepository } from "./BaseRepository.ts";
import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { Cart } from "@/domain/entities/cart.entity.ts";
import { CartModel } from "../models/cart.model.ts";
import { CartMapper } from "../mappers/CartMapper.ts";

export class CartRepository extends BaseRepository<Cart> implements ICartRepository {
  constructor() {
    super(CartModel, CartMapper);
  }

  async findByUser(userId: string): Promise<Cart | null> {
    const doc = await this.model
      .findOne({ userId })
      .populate("items.productId")
      .lean();
    return doc ? (this.mapper.toEntity(doc) as Cart) : null;
  }
}
