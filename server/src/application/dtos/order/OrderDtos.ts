import type { Order } from "@/domain/entities/order.entity.ts";

export interface CreateOrderInputDTO {
  userId: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface CreateOrderOutputDTO {
  order: Order;
  keyId: string;
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
  };
}

export interface VerifyPaymentInputDTO {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface UpdateMerchantOrderItemStatusInputDTO {
  merchantId: string;
  orderId: string;
  productId: string;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled" | "returned";
}

export interface UpdateUserOrderItemStatusInputDTO {
  userId: string;
  orderId: string;
  productId: string;
  status: "cancelled" | "returned";
}
