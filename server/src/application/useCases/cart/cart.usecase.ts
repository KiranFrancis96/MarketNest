import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Cart, CartItem } from "@/domain/entities/cart.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_CART_INIT_FAILED,
  MSG_PRODUCT_UNAVAILABLE,
  MSG_QTY_MINIMUM,
  MSG_CART_ITEM_ACCESS_FAILED,
  MSG_PRODUCT_UPDATE_FAILED,
  MSG_CART_NOT_FOUND,
  MSG_CART_ITEM_NOT_FOUND,
  MSG_INSUFFICIENT_STOCK,
  MSG_STOCK_LIMIT_EXCEEDED,
} from "@/presentation/http/controllers/messages.constants.ts";

export class CartUseCase {
  constructor(
    private _cartRepository: ICartRepository,
    private _productRepository: IProductRepository
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      cart = await this._cartRepository.create({ userId, items: [] });
      if (!cart) {
        throw new ApiError(500, MSG_CART_INIT_FAILED);
      }
    }
    return cart;
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const product = await this._productRepository.findById(productId);
    if (!product || product.isBlocked) {
      throw new ApiError(404, MSG_PRODUCT_UNAVAILABLE);
    }

    if (quantity <= 0) {
      throw new ApiError(400, MSG_QTY_MINIMUM);
    }

    if (product.stock < quantity) {
      throw new ApiError(400, MSG_INSUFFICIENT_STOCK.replace("{stock}", product.stock.toString()));
    }

    let cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      cart = await this._cartRepository.create({ userId, items: [] });
      if (!cart) throw new ApiError(500, MSG_CART_INIT_FAILED);
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
        throw new ApiError(500, MSG_CART_ITEM_ACCESS_FAILED);
      }
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new ApiError(400, MSG_STOCK_LIMIT_EXCEEDED.replace("{stock}", product.stock.toString()));
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
      throw new ApiError(500, MSG_PRODUCT_UPDATE_FAILED);
    }

    return await this.getCart(userId);
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    const product = await this._productRepository.findById(productId);
    if (!product || product.isBlocked) {
      throw new ApiError(404, MSG_PRODUCT_UNAVAILABLE);
    }

    if (product.stock < quantity) {
      throw new ApiError(400, MSG_INSUFFICIENT_STOCK.replace("{stock}", product.stock.toString()));
    }

    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new ApiError(404, MSG_CART_NOT_FOUND);
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      throw new ApiError(404, MSG_CART_ITEM_NOT_FOUND);
    }

    const item = cart.items[itemIndex];
    if (!item) {
      throw new ApiError(404, MSG_CART_ITEM_NOT_FOUND);
    }

    item.quantity = quantity;
    item.priceSnapshot = product.offerPrice !== undefined && product.offerPrice !== null
      ? product.offerPrice
      : product.price;

    await this._cartRepository.updateById(cart._id!, cart);
    return await this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string): Promise<Cart> {
    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new ApiError(404, MSG_CART_NOT_FOUND);
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    await this._cartRepository.updateById(cart._id!, cart);
    return await this.getCart(userId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      throw new ApiError(404, MSG_CART_NOT_FOUND);
    }

    cart.items = [];
    await this._cartRepository.updateById(cart._id!, cart);
    return await this.getCart(userId);
  }
}
