import { baseApi } from "@/shared/api/baseApi";
import {
  AUTH_REGISTER,
  AUTH_LOGIN,
  AUTH_LOGOUT,
  AUTH_VERIFY_OTP,
  AUTH_RESEND_OTP,
  AUTH_FORGOT_PASSWORD,
  AUTH_RESET_PASSWORD,
  AUTH_PROFILE,
  AUTH_GOOGLE,
  AUTH_ADDRESSES,
  AUTH_ADDRESS_BY_ID,
  PROFILE,
} from "@/shared/api/apiRoutes";

export const userApi = {
  register: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    baseApi.post(AUTH_REGISTER, data),

  login: (data: { email: string; password: string }) =>
    baseApi.post(AUTH_LOGIN, data),

  verifyOtp: (data: { email: string; otp: string }) =>
    baseApi.post(AUTH_VERIFY_OTP, data),

  forgotPassword: (data: { email: string }) =>
    baseApi.post(AUTH_FORGOT_PASSWORD, data),

  resetPassword: (data: { email: string; otp: string; password: string }) =>
    baseApi.post(AUTH_RESET_PASSWORD, data),

  resendOtp: (email: string) => baseApi.post(AUTH_RESEND_OTP, { email }),
  getProfile: () => baseApi.get(AUTH_PROFILE),
  logout: () => baseApi.post(AUTH_LOGOUT),
  googleLogin: (credential: string) => baseApi.post(AUTH_GOOGLE, { credential }),
  addAddress: (data: any) => baseApi.post(AUTH_ADDRESSES, data),
  updateAddress: (addressId: string, data: any) => baseApi.put(AUTH_ADDRESS_BY_ID(addressId), data),
  deleteAddress: (addressId: string) => baseApi.delete(AUTH_ADDRESS_BY_ID(addressId)),
  createUserProfile: (data: any) => baseApi.post(PROFILE, data),
  getUserPersonalizationProfile: () => baseApi.get(PROFILE),
};