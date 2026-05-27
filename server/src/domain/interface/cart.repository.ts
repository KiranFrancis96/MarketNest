import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Cart } from "../entities/cart.entity.ts";

export interface ICartRepository extends IBaseRepository<Cart> {
  findByUser(userId: string): Promise<Cart | null>;
}
