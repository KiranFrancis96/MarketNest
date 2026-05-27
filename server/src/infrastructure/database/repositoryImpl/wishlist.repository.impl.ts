import { BaseRepository } from "./BaseRepository.ts";
import type { IWishlistRepository } from "@/domain/interface/wishlist.repository.ts";
import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";
import { WishlistModel } from "../models/wishlist.model.ts";
import { WishlistMapper } from "../mappers/WishlistMapper.ts";

export class WishlistRepository extends BaseRepository<Wishlist, any> implements IWishlistRepository {
  constructor() {
    super(WishlistModel, WishlistMapper);
  }

  async findByUser(userId: string): Promise<Wishlist[]> {
    const docs = await this.model
      .find({ userId })
      .populate("productId")
      .lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as Wishlist);
  }
}
