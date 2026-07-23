import type { Request, Response } from "express";
import type {
  IGetWishlistUseCase,
  IAddToWishlistUseCase,
  IRemoveFromWishlistUseCase,
} from "@/application/IUseCases/wishlist/IWishlistUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_PRODUCT_ID_REQUIRED,
  MSG_PRODUCT_ID_STRING,
  MSG_WISHLIST_ADDED_SUCCESS,
  MSG_WISHLIST_REMOVED_SUCCESS,
} from "@/presentation/http/controllers/messages.constants.ts";

export class WishlistController {
  constructor(
    private _getWishlistUseCase: IGetWishlistUseCase,
    private _addToWishlistUseCase: IAddToWishlistUseCase,
    private _removeFromWishlistUseCase: IRemoveFromWishlistUseCase
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const wishlist = await this._getWishlistUseCase.execute(userId);
    res.json(wishlist);
  };

  add = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const { productId } = req.body;
    if (!productId) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_REQUIRED);
    }

    const wishlist = await this._addToWishlistUseCase.execute(userId, productId);
    res.status(HttpStatus.CREATED).json({ message: MSG_WISHLIST_ADDED_SUCCESS, wishlist });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const productId = req.params.productId;
    if (typeof productId !== "string") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_STRING);
    }

    await this._removeFromWishlistUseCase.execute(userId, productId);
    res.json({ message: MSG_WISHLIST_REMOVED_SUCCESS });
  };
}
