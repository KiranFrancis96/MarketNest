import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";

export interface IGetWishlistUseCase {
  execute(userId: string): Promise<Wishlist[]>;
}

export interface IAddToWishlistUseCase {
  execute(userId: string, productId: string): Promise<Wishlist>;
}

export interface IRemoveFromWishlistUseCase {
  execute(userId: string, productId: string): Promise<boolean>;
}
