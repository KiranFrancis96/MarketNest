import type { Merchant } from "@/domain/entities/merchant.entity.ts";

export interface MerchantRegisterInputDTO {
  email: string;
  password?: string;
  businessName: string;
  phone: string;
  gstNumber: string;
  houseName: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  ownerName: string;
}

export interface MerchantVerifyOtpInputDTO {
  email: string;
  otp: string;
}

export interface MerchantVerifyOtpOutputDTO {
  merchant: Merchant;
  accessToken: string;
  refreshToken: string;
}

export interface MerchantLoginInputDTO {
  email: string;
  password?: string;
}

export interface MerchantLoginOutputDTO {
  merchant: Merchant;
  accessToken: string;
  refreshToken: string;
}

export interface MerchantForgotPasswordInputDTO {
  email: string;
}

export interface MerchantResetPasswordInputDTO {
  email: string;
  otp: string;
  password?: string;
}

export interface MerchantResendOtpInputDTO {
  email: string;
}

export interface MerchantReapplyInputDTO {
  businessName?: string;
  phone?: string;
  gstNumber?: string;
  houseName?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  ownerName?: string;
}

export interface MerchantCompleteProfileInputDTO {
  businessName: string;
  phone: string;
  gstNumber: string;
  houseName: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  ownerName: string;
}
