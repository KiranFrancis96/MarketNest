import type { Request, Response } from "express";
import { CartUseCase } from "@/application/useCases/cart/cart.usecase.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_UNAUTHORIZED,
  MSG_PRODUCT_QTY_REQUIRED,
  MSG_PRODUCT_ID_STRING,
} from "./messages.constants.ts";

export class CartController {
  constructor(private _cartUseCase: CartUseCase) {}

  get = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const cart = await this._cartUseCase.getCart(userId);
    res.json(cart);
  };

  add = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      throw new ApiError(400, MSG_PRODUCT_QTY_REQUIRED);
    }

    const cart = await this._cartUseCase.addToCart(userId, productId, Number(quantity));
    res.status(200).json({ message: "Product added to cart", cart });
  };

  updateQuantity = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      throw new ApiError(400, MSG_PRODUCT_QTY_REQUIRED);
    }

    const cart = await this._cartUseCase.updateQuantity(userId, productId, Number(quantity));
    res.json({ message: "Cart updated successfully", cart });
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const productId = req.params.productId;
    if (typeof productId !== "string") {
      throw new ApiError(400, MSG_PRODUCT_ID_STRING);
    }

    const cart = await this._cartUseCase.removeFromCart(userId, productId);
    res.json({ message: "Product removed from cart", cart });
  };

  clear = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, MSG_UNAUTHORIZED);

    const cart = await this._cartUseCase.clearCart(userId);
    res.json({ message: "Cart cleared successfully", cart });
  };
}
