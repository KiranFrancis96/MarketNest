import { wishlistRepository } from "./repositories.ts";
import { GetWishlistUseCase } from "@/application/useCases/wishlist/getWishlist.usecase.ts";
import { AddToWishlistUseCase } from "@/application/useCases/wishlist/addToWishlist.usecase.ts";
import { RemoveFromWishlistUseCase } from "@/application/useCases/wishlist/removeFromWishlist.usecase.ts";

export const getWishlistUseCase = new GetWishlistUseCase(wishlistRepository);
export const addToWishlistUseCase = new AddToWishlistUseCase(wishlistRepository);
export const removeFromWishlistUseCase = new RemoveFromWishlistUseCase(wishlistRepository);
