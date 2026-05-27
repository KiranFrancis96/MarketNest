import type { IWishlistRepository } from "@/domain/interface/wishlist.repository.ts";
import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_WISHLIST_REQ_FIELDS, MSG_WISHLIST_ADD_FAILED } from "@/presentation/http/controllers/messages.constants.ts";

export class WishlistUseCase {
  constructor(private _wishlistRepository: IWishlistRepository) {}

  async getWishlist(userId: string): Promise<Wishlist[]> {
    return await this._wishlistRepository.findByUser(userId);
  }

  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    if (!userId || !productId) {
      throw new ApiError(400, MSG_WISHLIST_REQ_FIELDS);
    }

    const existing = await this._wishlistRepository.findOne({ userId, productId } as any);
    if (existing) {
      return existing; // Return early, duplicate prevented
    }

    const created = await this._wishlistRepository.create({ userId, productId });
    if (!created) {
      throw new ApiError(500, MSG_WISHLIST_ADD_FAILED);
    }
    return created;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<boolean> {
    if (!userId || !productId) {
      throw new ApiError(400, MSG_WISHLIST_REQ_FIELDS);
    }

    const item = await this._wishlistRepository.findOne({ userId, productId } as any);
    if (!item) {
      return true; // Already deleted
    }

    return await this._wishlistRepository.deleteById(item._id!);
  }
}
