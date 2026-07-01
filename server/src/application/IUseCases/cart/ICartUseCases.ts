import type { Cart } from "@/domain/entities/cart.entity.ts";

export interface IGetCartUseCase {
  execute(userId: string): Promise<Cart>;
}

export interface IAddToCartUseCase {
  execute(userId: string, productId: string, quantity: number): Promise<Cart>;
}

export interface IUpdateCartQuantityUseCase {
  execute(userId: string, productId: string, quantity: number): Promise<Cart>;
}

export interface IRemoveFromCartUseCase {
  execute(userId: string, productId: string): Promise<Cart>;
}

export interface IClearCartUseCase {
  execute(userId: string): Promise<Cart>;
}
