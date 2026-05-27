import type { Request, Response } from "express";
import { WishlistUseCase } from "@/application/useCases/wishlist/wishlist.usecase.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_PRODUCT_ID_REQUIRED,
  MSG_PRODUCT_ID_STRING,
} from "@/presentation/http/controllers/messages.constants.ts";

export class WishlistController {
  constructor(private _wishlistUseCase: WishlistUseCase) {}

  get = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const wishlist = await this._wishlistUseCase.getWishlist(userId);
    res.json(wishlist);
  };

  add = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const { productId } = req.body;
    if (!productId) {
      throw new ApiError(400, MSG_PRODUCT_ID_REQUIRED);
    }

    const wishlist = await this._wishlistUseCase.addToWishlist(userId, productId);
    res.status(201).json({ message: "Product added to wishlist", wishlist });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const productId = req.params.productId;
    if (typeof productId !== "string") {
      throw new ApiError(400, MSG_PRODUCT_ID_STRING);
    }

    await this._wishlistUseCase.removeFromWishlist(userId, productId);
    res.json({ message: "Product removed from wishlist" });
  };
}
