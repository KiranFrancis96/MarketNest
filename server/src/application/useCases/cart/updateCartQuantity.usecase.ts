import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Cart } from "@/domain/entities/cart.entity.ts";
import type { IUpdateCartQuantityUseCase } from "@/application/IUseCases/cart/ICartUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_CART_INIT_FAILED,
  MSG_PRODUCT_UNAVAILABLE,
  MSG_CART_NOT_FOUND,
  MSG_CART_ITEM_NOT_FOUND,
  MSG_INSUFFICIENT_STOCK,
} from "@/presentation/http/controllers/messages.constants.ts";

export class UpdateCartQuantityUseCase implements IUpdateCartQuantityUseCase {
  constructor(
    private _cartRepository: ICartRepository,
    private _productRepository: IProductRepository
  ) {}

  async execute(userId: string, productId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) {
      const cart = await this._cartRepository.findByUser(userId);
      if (!cart) {
        throw new ApiError(HttpStatus.NOT_FOUND, MSG_CART_NOT_FOUND);
      }

      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
      await this._cartRepository.updateById(cart._id!, cart);
      
      let updatedCart = await this._cartRepository.findByUser(userId);
      if (!updatedCart) {
        updatedCart = await this._cartRepository.create({ userId, items: [] });
        if (!updatedCart) throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CART_INIT_FAILED);
      }
      return updatedCart;
    }

    const product = await this._productRepository.findById(productId);
    if (!product || product.isBlocked) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_PRODUCT_UNAVAILABLE);
    }

    if (product.stock < quantity) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_INSUFFICIENT_STOCK.replace("{stock}", product.stock.toString()));
    }

    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_CART_NOT_FOUND);
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_CART_ITEM_NOT_FOUND);
    }

    const item = cart.items[itemIndex];
    if (!item) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_CART_ITEM_NOT_FOUND);
    }

    item.quantity = quantity;
    item.priceSnapshot = product.offerPrice !== undefined && product.offerPrice !== null
      ? product.offerPrice
      : product.price;

    await this._cartRepository.updateById(cart._id!, cart);
    
    let updatedCart = await this._cartRepository.findByUser(userId);
    if (!updatedCart) {
      updatedCart = await this._cartRepository.create({ userId, items: [] });
      if (!updatedCart) throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CART_INIT_FAILED);
    }
    return updatedCart;
  }
}
