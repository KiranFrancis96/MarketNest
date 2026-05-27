import type { Product } from "./product.entity.ts";

export interface CartItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product?: Product;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
