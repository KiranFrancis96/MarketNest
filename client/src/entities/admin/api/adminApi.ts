import { baseApi } from "@/shared/api/baseApi";
import type { User, Merchant } from "../model/types";

export const adminApi = {
  login: (credentials: any) => baseApi.post("/admin/login", credentials),
  logout: () => baseApi.post("/admin/logout"),
  forgotPassword: (email: string) => baseApi.post("/admin/forgot-password", { email }),
  resetPassword: (data: any) => baseApi.post("/admin/reset-password", data),
  
  getUsers: () => baseApi.get<User[]>("/admin/users"),
  getMerchants: (status?: string) => baseApi.get<Merchant[]>("/admin/merchants", { params: { status } }),
  
  approveMerchant: (id: string) => baseApi.patch(`/admin/merchants/${id}/approve`),
  rejectMerchant: (id: string, reason: string) => baseApi.patch(`/admin/merchants/${id}/reject`, { rejectionReason: reason }),
  blockUser: (id: string) => baseApi.patch(`/admin/users/${id}/block`),
  unblockUser: (id: string) => baseApi.patch(`/admin/users/${id}/unblock`),
  blockMerchant: (id: string) => baseApi.patch(`/admin/merchants/${id}/block`),
  unblockMerchant: (id: string) => baseApi.patch(`/admin/merchants/${id}/unblock`),
  resendOtp: (email: string) => baseApi.post("/admin/resend-otp", { email }),
};
