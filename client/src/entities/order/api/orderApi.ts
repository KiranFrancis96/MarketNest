import { baseApi } from "@/shared/api/baseApi";

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
  create: (shippingAddress: Record<string, unknown>) => baseApi.post("/orders", { shippingAddress }),
  verify: (paymentDetails: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    baseApi.post("/orders/verify", paymentDetails),
  getById: (id: string) => baseApi.get(`/orders/${id}`),
  getUserHistory: () => baseApi.get<ClientOrder[]>("/orders"),
  getMerchantSales: () => baseApi.get<unknown[]>("/orders/merchant/sales"),
  updateMerchantItemStatus: (orderId: string, productId: string, status: string) =>
    baseApi.patch("/orders/merchant/items/status", { orderId, productId, status }),
  getAdminUserHistory: (userId: string) => baseApi.get<ClientOrder[]>(`/orders/admin/user/${userId}`),
  getAdminMerchantHistory: (merchantId: string) => baseApi.get<unknown[]>(`/orders/admin/merchant/${merchantId}`),
  updateUserItemStatus: (orderId: string, productId: string, status: string) =>
    baseApi.patch("/orders/user/items/status", { orderId, productId, status }),
};
