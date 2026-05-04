import { baseApi } from "@/shared/api/baseApi";
import type { Merchant } from "../model/types";

export const merchantApi = {
  register: (data: any) => baseApi.post("/merchant/register", data),

  verifyOtp: (data: { email: string; otp: string }) =>
    baseApi.post("/merchant/verify-otp", data),

  login: (data: any) => baseApi.post("/merchant/login", data),

  forgotPassword: (data: { email: string }) =>
    baseApi.post("/merchant/forgot-password", data),

  resetPassword: (data: { email: string; otp: string; password: string }) =>
    baseApi.post("/merchant/reset-password", data),

  getProfile: () => baseApi.get<Merchant>("/merchant/me"),

  resendOtp: (email: string) => baseApi.post("/merchant/resend-otp", { email }),

  logout: () => baseApi.post("/merchant/logout"),
};
