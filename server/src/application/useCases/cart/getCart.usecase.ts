import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { Cart } from "@/domain/entities/cart.entity.ts";
import type { IGetCartUseCase } from "@/application/IUseCases/cart/ICartUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_CART_INIT_FAILED } from "@/presentation/http/controllers/messages.constants.ts";

export class GetCartUseCase implements IGetCartUseCase {
  constructor(private _cartRepository: ICartRepository) {}

  async execute(userId: string): Promise<Cart> {
    let cart = await this._cartRepository.findByUser(userId);
    if (!cart) {
      cart = await this._cartRepository.create({ userId, items: [] });
      if (!cart) {
        throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_CART_INIT_FAILED);
      }
    }
    return cart;
  }
}
