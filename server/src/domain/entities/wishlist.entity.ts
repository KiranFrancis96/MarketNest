import type { Product } from "./product.entity.ts";

export interface Wishlist {
  _id?: string;
  userId: string;
  productId: string;
  product?: Product;
}
