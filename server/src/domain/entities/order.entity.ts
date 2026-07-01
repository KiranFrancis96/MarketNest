import type { Product } from "@/domain/entities/product.entity.ts";

export interface OrderItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product?: Product;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled" | "returned";
}

export interface Order {
  _id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: "pending" | "paid" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}
