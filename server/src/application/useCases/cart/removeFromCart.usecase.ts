import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { Cart } from "@/domain/entities/cart.entity.ts";
import type { IRemoveFromCartUseCase } from "@/application/IUseCases/cart/ICartUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_CART_NOT_FOUND, MSG_CART_INIT_FAILED } from "@/presentation/http/controllers/messages.constants.ts";

export class RemoveFromCartUseCase implements IRemoveFromCartUseCase {
  constructor(private _cartRepository: ICartRepository) {}

  async execute(userId: string, productId: string): Promise<Cart> {
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
}
