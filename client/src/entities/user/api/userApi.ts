import { baseApi } from "@/shared/api/baseApi";

export const userApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    baseApi.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    baseApi.post("/auth/login", data),

  verifyOtp: (data: { email: string; otp: string }) =>
    baseApi.post("/auth/verify-otp", data),

  forgotPassword: (data: { email: string }) =>
    baseApi.post("/auth/forgot-password", data),

  resetPassword: (data: { email: string; otp: string; password: string }) =>
    baseApi.post("/auth/reset-password", data),

  resendOtp: (email: string) => baseApi.post("/auth/resend-otp", { email }),
  getProfile: () => baseApi.get("/auth/profile"),
  logout: () => baseApi.post("/auth/logout"),
};