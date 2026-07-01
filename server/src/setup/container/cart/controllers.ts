import { CartController } from "@/presentation/http/controllers/cart.controller.ts";
import * as useCases from "./useCases.ts";

export const cartController = new CartController(
  useCases.getCartUseCase,
  useCases.addToCartUseCase,
  useCases.updateCartQuantityUseCase,
  useCases.removeFromCartUseCase,
  useCases.clearCartUseCase
);
