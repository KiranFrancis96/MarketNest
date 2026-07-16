import type { CreateOrderInputDTO, CreateOrderOutputDTO, VerifyPaymentInputDTO } from "@/application/dtos/order/OrderDtos.ts";
import type { Order } from "@/domain/entities/order.entity.ts";

export interface ICreateOrderUseCase {
  execute(input: CreateOrderInputDTO): Promise<CreateOrderOutputDTO>;
}

export interface IVerifyPaymentUseCase {
  execute(input: VerifyPaymentInputDTO): Promise<Order>;
}

export interface IGetOrderByIdUseCase {
  execute(orderId: string, userId: string): Promise<Order>;
}

export interface IGetUserOrdersUseCase {
  execute(userId: string): Promise<Order[]>;
}

import type { Product } from "@/domain/entities/product.entity.ts";

export interface MerchantSaleItem {
  productId: string;
  quantity: number;
  priceSnapshot: number;
  product?: Product;
}

export interface MerchantSale {
  orderId?: string;
  orderNumber?: string;
  date?: Date;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: MerchantSaleItem[];
  subtotal: number;
}

export interface IGetMerchantSalesUseCase {
  execute(merchantId: string): Promise<MerchantSale[]>;
}

export interface IGetAdminUserOrdersUseCase {
  execute(userId: string): Promise<Order[]>;
}

export interface IGetAdminMerchantSalesUseCase {
  execute(merchantId: string): Promise<MerchantSale[]>;
}

import type { UpdateMerchantOrderItemStatusInputDTO, UpdateUserOrderItemStatusInputDTO } from "@/application/dtos/order/OrderDtos.ts";

export interface IUpdateMerchantOrderItemStatusUseCase {
  execute(input: UpdateMerchantOrderItemStatusInputDTO): Promise<Order>;
}

export interface IUpdateUserOrderItemStatusUseCase {
  execute(input: UpdateUserOrderItemStatusInputDTO): Promise<Order>;
}
