import type { IVerifyPaymentUseCase } from "@/application/IUseCases/order/IOrderUseCases.ts";
import type { VerifyPaymentInputDTO } from "@/application/dtos/order/OrderDtos.ts";
import type { ICartRepository } from "@/domain/interface/cart.repository.ts";
import type { IOrderRepository } from "@/domain/interface/order.repository.ts";
import type { IProductRepository } from "@/domain/interface/product.repository.ts";
import type { Order } from "@/domain/entities/order.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import { MSG_RAZORPAY_CONFIG_MISSING, MSG_ORDER_NOT_FOUND, MSG_UNAUTHORIZED_ORDER_VERIFY, MSG_PAYMENT_VERIFY_FAILED, MSG_ORDER_STATUS_PAID_FAILED } from "@/presentation/http/controllers/messages.constants.ts";
import crypto from "crypto";
import { UserModel } from "@/infrastructure/database/models/user.model.ts";
import { recordWalletTransaction } from "@/application/services/walletTransaction.service.ts";

export class VerifyPaymentUseCase implements IVerifyPaymentUseCase {
  constructor(
    private _cartRepository: ICartRepository,
    private _orderRepository: IOrderRepository,
    private _productRepository: IProductRepository
  ) { }

  async execute(input: VerifyPaymentInputDTO): Promise<Order> {
    const { userId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_RAZORPAY_CONFIG_MISSING);
    }

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest("hex");

    const isSignatureValid = generatedSignature === razorpaySignature;

    const order = await this._orderRepository.findByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_ORDER_NOT_FOUND);
    }

    if (order.userId.toString() !== userId) {
      throw new ApiError(HttpStatus.FORBIDDEN, MSG_UNAUTHORIZED_ORDER_VERIFY);
    }

    if (!isSignatureValid) {
      const user = await UserModel.findById(userId);
      if (user) {
        const newBalance = (user.walletBalance || 0) + order.totalAmount;
        user.walletBalance = newBalance;
        await user.save();

        await recordWalletTransaction({
          userId,
          type: "credit",
          amount: order.totalAmount,
          description: `Refund for Failed Payment (Order #${order.orderNumber || order._id})`,
          balanceAfter: newBalance,
          orderId: order._id,
        });
      }
      order.status = "failed";
      await this._orderRepository.updateById(order._id!, { status: "failed" });
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_PAYMENT_VERIFY_FAILED);
    }

    order.status = "paid";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;

    const updatedOrder = await this._orderRepository.updateById(order._id!, {
      status: "paid",
      razorpayPaymentId,
      razorpaySignature
    });

    if (!updatedOrder) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_ORDER_STATUS_PAID_FAILED);
    }

    const paidCount = await this._orderRepository.getCount({ status: "paid" } as any);
    const finalOrderNumber = order.orderNumber && order.orderNumber.startsWith("ORD-")
      ? order.orderNumber
      : `ORD-${10000 + paidCount}`;
    await this._orderRepository.updateById(order._id!, { orderNumber: finalOrderNumber } as any);

    // Deduct stock for each product in order
    for (const item of order.items) {
      const product = await this._productRepository.findById(item.productId);
      if (product) {
        const updatedStock = Math.max(0, product.stock - item.quantity);
        await this._productRepository.updateById(product._id!, { stock: updatedStock });
      }
    }

    // Clear cart
    const cart = await this._cartRepository.findByUserId(userId);
    if (cart) {
      await this._cartRepository.updateByUserId(userId, { items: [] });
    }

    return updatedOrder;
  }
}
