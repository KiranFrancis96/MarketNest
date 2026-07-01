import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Cart } from "@/domain/entities/cart.entity.ts";
import type { IAddToCartUseCase } from "@/application/IUseCases/cart/ICartUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_CART_INIT_FAILED,
  MSG_PRODUCT_UNAVAILABLE,
  MSG_QTY_MINIMUM,
  MSG_CART_ITEM_ACCESS_FAILED,
  MSG_PRODUCT_UPDATE_FAILED,
  MSG_INSUFFICIENT_STOCK,
  MSG_STOCK_LIMIT_EXCEEDED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class AddToCartUseCase implements IAddToCartUseCase {
  constructor(
    private _cartRepository: ICartRepository,
    private _productRepository: IProductRepository
  ) {}

  async execute(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this._productRepository.findById(productId);
    if (!product || product.isBlocked) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_PRODUCT_UNAVAILABLE);
    }

    if (quantity <= 0) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_QTY_MINIMUM);
    }

    if (product.stock < quantity) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_INSUFFICIENT_STOCK.replace("{stock}", product.stock.toString()));
    }

    let cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      cart = await this._cartRepository.create({ userId, items: [] });
      if (!cart) throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CART_INIT_FAILED);
    }

    const priceSnapshot = product.offerPrice !== undefined && product.offerPrice !== null
      ? product.offerPrice
      : product.price;

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      const existingItem = cart.items[existingItemIndex];
      if (!existingItem) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CART_ITEM_ACCESS_FAILED);
      }
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new ApiError(HttpStatus.BAD_REQUEST, MSG_STOCK_LIMIT_EXCEEDED.replace("{stock}", product.stock.toString()));
      }
      existingItem.quantity = newQuantity;
      existingItem.priceSnapshot = priceSnapshot;
    } else {
      cart.items.push({
        productId,
        quantity,
        priceSnapshot
      });
    }

    const updated = await this._cartRepository.updateById(cart._id!, cart);
    if (!updated) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_PRODUCT_UPDATE_FAILED);
    }

    let updatedCart = await this._cartRepository.findByUser(userId);
    if (!updatedCart) {
      updatedCart = await this._cartRepository.create({ userId, items: [] });
      if (!updatedCart) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CART_INIT_FAILED);
      }
    }
    return updatedCart;
  }
}
