import { cartRepository } from "./repositories.ts";
import { productRepository } from "../product/repositories.ts";
import { GetCartUseCase } from "@/application/useCases/cart/getCart.usecase.ts";
import { AddToCartUseCase } from "@/application/useCases/cart/addToCart.usecase.ts";
import { UpdateCartQuantityUseCase } from "@/application/useCases/cart/updateCartQuantity.usecase.ts";
import { RemoveFromCartUseCase } from "@/application/useCases/cart/removeFromCart.usecase.ts";
import { ClearCartUseCase } from "@/application/useCases/cart/clearCart.usecase.ts";

export const getCartUseCase = new GetCartUseCase(cartRepository);
export const addToCartUseCase = new AddToCartUseCase(cartRepository, productRepository);
export const updateCartQuantityUseCase = new UpdateCartQuantityUseCase(cartRepository, productRepository);
export const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository);
export const clearCartUseCase = new ClearCartUseCase(cartRepository);
