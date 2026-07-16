import { baseApi } from "@/shared/api/baseApi";
import {
  ORDERS,
  ORDERS_VERIFY,
  ORDERS_BY_ID,
  ORDERS_MERCHANT_SALES,
  ORDERS_MERCHANT_ITEM_STATUS,
  ORDERS_USER_ITEM_STATUS,
  ORDERS_ADMIN_USER,
  ORDERS_ADMIN_MERCHANT,
  ORDERS_WALLET_PAY,
  ORDERS_MARK_FAILED,
  ORDERS_WALLET_ADD,
} from "@/shared/api/apiRoutes";

export interface ClientProduct {
  images?: string[];
  name?: string;
}

export interface ClientOrderItem {
  productId: string;
  product?: ClientProduct;
  priceSnapshot: number;
  quantity: number;
  status: string;
}

export interface ClientOrder {
  _id: string;
  orderNumber?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  items: ClientOrderItem[];
  shippingAddress: {
    fullName: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const orderApi = {
  create: (shippingAddress: Record<string, unknown>) => baseApi.post(ORDERS, { shippingAddress }),
  verify: (paymentDetails: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    baseApi.post(ORDERS_VERIFY, paymentDetails),
  getById: (id: string) => baseApi.get(ORDERS_BY_ID(id)),
  getUserHistory: (page?: number, limit?: number) =>
    baseApi.get<{ orders: ClientOrder[]; total: number; totalPages: number }>(ORDERS, { params: { page, limit } }),
  getMerchantSales: () => baseApi.get<unknown[]>(ORDERS_MERCHANT_SALES),
  updateMerchantItemStatus: (orderId: string, productId: string, status: string) =>
    baseApi.patch(ORDERS_MERCHANT_ITEM_STATUS, { orderId, productId, status }),
  getAdminUserHistory: (userId: string) => baseApi.get<ClientOrder[]>(ORDERS_ADMIN_USER(userId)),
  getAdminMerchantHistory: (merchantId: string) => baseApi.get<unknown[]>(ORDERS_ADMIN_MERCHANT(merchantId)),
  updateUserItemStatus: (orderId: string, productId: string, status: string) =>
    baseApi.patch(ORDERS_USER_ITEM_STATUS, { orderId, productId, status }),
  payWithWallet: (orderId: string) =>
    baseApi.post<{ success: boolean; message: string; order: ClientOrder; walletBalance: number }>(ORDERS_WALLET_PAY(orderId), {}),
  markAsFailed: (orderId: string) =>
    baseApi.post<{ success: boolean; message: string; order: ClientOrder }>(ORDERS_MARK_FAILED(orderId), {}),
  addWalletFunds: (amount: number) =>
    baseApi.post<{ success: boolean; message: string; walletBalance: number }>(ORDERS_WALLET_ADD, { amount }),
};
