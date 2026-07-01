import { WishlistController } from "@/presentation/http/controllers/wishlist.controller.ts";
import * as useCases from "./useCases.ts";

export const wishlistController = new WishlistController(
  useCases.getWishlistUseCase,
  useCases.addToWishlistUseCase,
  useCases.removeFromWishlistUseCase
);
