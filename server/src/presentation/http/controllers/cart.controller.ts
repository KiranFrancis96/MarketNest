import type { Request, Response } from "express";
import type {
  IGetCartUseCase,
  IAddToCartUseCase,
  IUpdateCartQuantityUseCase,
  IRemoveFromCartUseCase,
  IClearCartUseCase,
} from "@/application/IUseCases/cart/ICartUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_PRODUCT_QTY_REQUIRED,
  MSG_PRODUCT_ID_STRING,
  MSG_PRODUCT_ADDED_CART,
  MSG_CART_UPDATED_SUCCESS,
  MSG_PRODUCT_REMOVED_CART,
  MSG_CART_CLEARED_SUCCESS,
} from "./messages.constants.ts";

export class CartController {
  constructor(
    private _getCartUseCase: IGetCartUseCase,
    private _addToCartUseCase: IAddToCartUseCase,
    private _updateCartQuantityUseCase: IUpdateCartQuantityUseCase,
    private _removeFromCartUseCase: IRemoveFromCartUseCase,
    private _clearCartUseCase: IClearCartUseCase
  ) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const cart = await this._getCartUseCase.execute(userId);
    res.json(cart);
  };

  add = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_QTY_REQUIRED);
    }

    const cart = await this._addToCartUseCase.execute(userId, productId, Number(quantity));
    res.status(HttpStatus.OK).json({ message: MSG_PRODUCT_ADDED_CART, cart });
  };

  updateQuantity = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_QTY_REQUIRED);
    }

    const cart = await this._updateCartQuantityUseCase.execute(userId, productId, Number(quantity));
    res.json({ message: MSG_CART_UPDATED_SUCCESS, cart });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const productId = req.params.productId;
    if (typeof productId !== "string") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PRODUCT_ID_STRING);
    }

    const cart = await this._removeFromCartUseCase.execute(userId, productId);
    res.json({ message: MSG_PRODUCT_REMOVED_CART, cart });
  };

  clear = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) throw new ApiError(HttpStatus.UNAUTHORIZED, MSG_UNAUTHORIZED);

    const cart = await this._clearCartUseCase.execute(userId);
    res.json({ message: MSG_CART_CLEARED_SUCCESS, cart });
  };
}
