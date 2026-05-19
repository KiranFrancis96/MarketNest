import type { User } from "@/domain/entities/user.entity.ts";

export interface UserRegisterInputDTO {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface UserVerifyOtpInputDTO {
  email: string;
  otp: string;
}

export interface UserVerifyOtpOutputDTO {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserLoginInputDTO {
  email: string;
  password?: string;
}

export interface UserLoginOutputDTO {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface UserForgotPasswordInputDTO {
  email: string;
}

export interface UserResetPasswordInputDTO {
  email: string;
  otp: string;
  password?: string;
}

export interface UserResendOtpInputDTO {
  email: string;
}
