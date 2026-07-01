import type { IWishlistRepository } from "@/domain/interface/wishlist.repository.ts";
import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";
import type { IGetWishlistUseCase } from "@/application/IUseCases/wishlist/IWishlistUseCases.ts";

export class GetWishlistUseCase implements IGetWishlistUseCase {
  constructor(private _wishlistRepository: IWishlistRepository) {}

  async execute(userId: string): Promise<Wishlist[]> {
    return await this._wishlistRepository.findByUser(userId);
  }
}
