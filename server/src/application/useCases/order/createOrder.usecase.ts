import type { ICreateOrderUseCase } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { CreateOrderInputDTO, CreateOrderOutputDTO } from "@/application/dtos/order/OrderDtos.ts";
import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_CART_EMPTY,
  MSG_PRODUCT_UNAVAILABLE,
  MSG_PRODUCT_STOCK_SHORT,
  MSG_INVALID_ORDER_TOTAL,
  MSG_RAZORPAY_CONFIG_MISSING,
  MSG_RAZORPAY_ORDER_CREATE_FAILED,
  MSG_ORDER_CREATE_FAILED,
} from "@/presentation/http/controllers/messages.constants.ts";
import Razorpay from "razorpay";

export class CreateOrderUseCase implements ICreateOrderUseCase {
  constructor(
    private _cartRepository: ICartRepository,
    private _orderRepository: IOrderRepository,
    private _productRepository: IProductRepository
  ) { }

  async execute(input: CreateOrderInputDTO): Promise<CreateOrderOutputDTO> {
    const { userId, shippingAddress } = input;

    const cart = await this._cartRepository.findByUser(userId);
    if (!cart || cart.items.length === 0) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_CART_EMPTY);
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await this._productRepository.findById(item.productId);
      if (!product || product.isBlocked) {
        throw new ApiError(HttpStatus.NOT_FOUND, MSG_PRODUCT_UNAVAILABLE);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `${MSG_PRODUCT_STOCK_SHORT}'${product.name}' (Available: ${product.stock})`
        );
      }

      const price = product.offerPrice !== undefined && product.offerPrice !== null
        ? product.offerPrice
        : product.price;

      totalAmount += price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: price
      });
    }

    if (totalAmount <= 0) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_INVALID_ORDER_TOTAL);
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_RAZORPAY_CONFIG_MISSING);
    }


    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    });

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.substring(0, 5)}`
    };

    let rzOrder;
    try {
      rzOrder = await razorpay.orders.create(options);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_RAZORPAY_ORDER_CREATE_FAILED + message);
    }

    const order = await this._orderRepository.create({
      userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      razorpayOrderId: rzOrder.id,
      status: "pending",
    });

    if (!order) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ORDER_CREATE_FAILED);
    }

    return {
      order,
      keyId: razorpayKeyId,
      razorpayOrder: {
        id: rzOrder.id,
        amount: rzOrder.amount,
        currency: rzOrder.currency
      }
    };
  }
}
