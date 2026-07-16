import { baseApi } from "@/shared/api/baseApi";
import type { User, Merchant } from "../model/types";
import {
  ADMIN_LOGIN,
  ADMIN_LOGOUT,
  ADMIN_FORGOT_PASSWORD,
  ADMIN_RESET_PASSWORD,
  ADMIN_RESEND_OTP,
  ADMIN_USERS,
  ADMIN_USER_BY_ID,
  ADMIN_USER_BLOCK,
  ADMIN_USER_UNBLOCK,
  ADMIN_MERCHANTS,
  ADMIN_MERCHANT_APPROVE,
  ADMIN_MERCHANT_REJECT,
  ADMIN_MERCHANT_BLOCK,
  ADMIN_MERCHANT_UNBLOCK,
} from "@/shared/api/apiRoutes";

export const adminApi = {
  login: (credentials: Record<string, unknown>) => baseApi.post(ADMIN_LOGIN, credentials),
  logout: () => baseApi.post(ADMIN_LOGOUT),
  forgotPassword: (email: string) => baseApi.post(ADMIN_FORGOT_PASSWORD, { email }),
  resetPassword: (data: Record<string, unknown>) => baseApi.post(ADMIN_RESET_PASSWORD, data),

  getUsers: () => baseApi.get<User[]>(ADMIN_USERS),
  getMerchants: (status?: string) => baseApi.get<Merchant[]>(ADMIN_MERCHANTS, { params: { status } }),

  approveMerchant: (id: string) => baseApi.patch(ADMIN_MERCHANT_APPROVE(id)),
  rejectMerchant: (id: string, reason: string) => baseApi.patch(ADMIN_MERCHANT_REJECT(id), { rejectionReason: reason }),
  blockUser: (id: string) => baseApi.patch(ADMIN_USER_BLOCK(id)),
  unblockUser: (id: string) => baseApi.patch(ADMIN_USER_UNBLOCK(id)),
  updateUser: (id: string, data: Partial<User>) => baseApi.patch<User>(ADMIN_USER_BY_ID(id), data),
  blockMerchant: (id: string) => baseApi.patch(ADMIN_MERCHANT_BLOCK(id)),
  unblockMerchant: (id: string) => baseApi.patch(ADMIN_MERCHANT_UNBLOCK(id)),
  resendOtp: (email: string) => baseApi.post(ADMIN_RESEND_OTP, { email }),
};
