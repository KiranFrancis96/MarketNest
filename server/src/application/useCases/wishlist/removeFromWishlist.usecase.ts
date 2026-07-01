import type { IWishlistRepository } from "@/domain/interface/wishlist.repository.ts";
import type { IRemoveFromWishlistUseCase } from "@/application/IUseCases/wishlist/IWishlistUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_WISHLIST_REQ_FIELDS } from "@/presentation/http/controllers/messages.constants.ts";

export class RemoveFromWishlistUseCase implements IRemoveFromWishlistUseCase {
  constructor(private _wishlistRepository: IWishlistRepository) {}

  async execute(userId: string, productId: string): Promise<boolean> {
    if (!userId || !productId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_WISHLIST_REQ_FIELDS);
    }

    const item = await this._wishlistRepository.findOne({ userId, productId });
    if (!item) {
      return true;
    }

    return await this._wishlistRepository.deleteById(item._id!);
  }
}
