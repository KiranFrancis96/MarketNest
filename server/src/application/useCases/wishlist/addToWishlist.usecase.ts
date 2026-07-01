import type { IWishlistRepository } from "@/domain/interface/wishlist.repository.ts";
import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";
import type { IAddToWishlistUseCase } from "@/application/IUseCases/wishlist/IWishlistUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_WISHLIST_REQ_FIELDS, MSG_WISHLIST_ADD_FAILED } from "@/presentation/http/controllers/messages.constants.ts";

export class AddToWishlistUseCase implements IAddToWishlistUseCase {
  constructor(private _wishlistRepository: IWishlistRepository) {}

  async execute(userId: string, productId: string): Promise<Wishlist> {
    if (!userId || !productId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_WISHLIST_REQ_FIELDS);
    }

    const existing = await this._wishlistRepository.findOne({ userId, productId });
    if (existing) {
      return existing;
    }

    const created = await this._wishlistRepository.create({ userId, productId });
    if (!created) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_WISHLIST_ADD_FAILED);
    }
    return created;
  }
}
