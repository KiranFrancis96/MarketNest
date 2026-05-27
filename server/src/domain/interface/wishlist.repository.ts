import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Wishlist } from "../entities/wishlist.entity.ts";

export interface IWishlistRepository extends IBaseRepository<Wishlist> {
  findByUser(userId: string): Promise<Wishlist[]>;
}
