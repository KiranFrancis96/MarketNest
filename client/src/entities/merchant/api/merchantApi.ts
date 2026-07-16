import { baseApi } from "@/shared/api/baseApi";
import type { Merchant } from "../model/types";
import {
  MERCHANT_REGISTER,
  MERCHANT_LOGIN,
  MERCHANT_LOGOUT,
  MERCHANT_VERIFY_OTP,
  MERCHANT_RESEND_OTP,
  MERCHANT_FORGOT_PASSWORD,
  MERCHANT_RESET_PASSWORD,
  MERCHANT_PROFILE,
  MERCHANT_REAPPLY,
  MERCHANT_GOOGLE,
  MERCHANT_COMPLETE_PROFILE,
  MERCHANT_UPDATE_PROFILE,
} from "@/shared/api/apiRoutes";

export const merchantApi = {
  register: (data: Record<string, unknown>) => baseApi.post(MERCHANT_REGISTER, data),

  verifyOtp: (data: { email: string; otp: string }) =>
    baseApi.post(MERCHANT_VERIFY_OTP, data),

  login: (data: Record<string, unknown>) => baseApi.post(MERCHANT_LOGIN, data),

  forgotPassword: (data: { email: string }) =>
    baseApi.post(MERCHANT_FORGOT_PASSWORD, data),

  resetPassword: (data: { email: string; otp: string; password: string }) =>
    baseApi.post(MERCHANT_RESET_PASSWORD, data),

  getProfile: () => baseApi.get<Merchant>(MERCHANT_PROFILE),

  resendOtp: (email: string) => baseApi.post(MERCHANT_RESEND_OTP, { email }),

  logout: () => baseApi.post(MERCHANT_LOGOUT),

  reapply: (data: Record<string, unknown>) => baseApi.patch(MERCHANT_REAPPLY, data),

  googleLogin: (credential: string) => baseApi.post(MERCHANT_GOOGLE, { credential }),

  completeProfile: (data: Record<string, unknown>) => baseApi.post(MERCHANT_COMPLETE_PROFILE, data),

  updateProfile: (data: Partial<Merchant>) => baseApi.patch<Merchant>(MERCHANT_UPDATE_PROFILE, data),
};
