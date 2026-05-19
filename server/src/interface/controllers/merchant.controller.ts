import type { Request, Response } from "express";
import { registerMerchant as registerUseCase } from "@/useCases/merchant/auth/registerMerchant.usecase.ts";
import { verifyMerchantOtp as verifyOtpUseCase } from "@/useCases/merchant/auth/verifyMerchantOtp.usecase.ts";
import { loginMerchant as loginUseCase } from "@/useCases/merchant/auth/loginMerchant.usecase.ts";
import { forgotMerchantPassword as forgotPasswordUseCase } from "@/useCases/merchant/auth/forgotMerchantPassword.usecase.ts";
import { resetMerchantPassword as resetPasswordUseCase } from "@/useCases/merchant/auth/resetMerchantPassword.usecase.ts";
import { getMerchantProfile as getProfileUseCase } from "@/useCases/merchant/auth/getMerchantProfile.usecase.ts";
import { resendMerchantOtp as resendOtpUseCase } from "@/useCases/merchant/auth/resendMerchantOtp.usecase.ts";
import { reapplyMerchant as reapplyUseCase } from "@/useCases/merchant/auth/reapplyMerchant.usecase.ts";
import {
  MSG_EMAIL_REQUIRED,
  MSG_EMAIL_PASSWORD_REQUIRED,
  MSG_EMAIL_OTP_REQUIRED,
  MSG_EMAIL_OTP_PW_REQUIRED,
  MSG_OTP_RESENT,
  MSG_OTP_VERIFIED,
  MSG_UNAUTHORIZED,
  MSG_MERCHANT_REGISTER_SUCCESS,
  MSG_MERCHANT_LOGIN_SUCCESS,
  MSG_MERCHANT_LOGOUT,
  MSG_MERCHANT_FORGOT_PW_SENT,
  MSG_MERCHANT_PASSWORD_RESET,
} from "./messages.constants.ts";

export const register = async (req: Request, res: Response) => {
  await registerUseCase(req.body);
  res.status(201).json({ message: MSG_MERCHANT_REGISTER_SUCCESS });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ message: MSG_EMAIL_OTP_REQUIRED });
    return;
  }

  const { merchant, accessToken, refreshToken } = await verifyOtpUseCase(email, otp);

  res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
  res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({ message: MSG_OTP_VERIFIED, merchant });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: MSG_EMAIL_PASSWORD_REQUIRED });
    return;
  }

  const { merchant, accessToken, refreshToken } = await loginUseCase(email, password);

  res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
  res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({ message: MSG_MERCHANT_LOGIN_SUCCESS, merchant });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: MSG_EMAIL_REQUIRED });
    return;
  }
  await forgotPasswordUseCase(email);
  res.json({ message: MSG_MERCHANT_FORGOT_PW_SENT });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    res.status(400).json({ message: MSG_EMAIL_OTP_PW_REQUIRED });
    return;
  }
  await resetPasswordUseCase(email, otp, password);
  res.json({ message: MSG_MERCHANT_PASSWORD_RESET });
};

export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore - Assuming a middleware attaches `user` to req
  const merchantId = req.user?.id;

  if (!merchantId) {
    res.status(401).json({ message: MSG_UNAUTHORIZED });
    return;
  }

  const profile = await getProfileUseCase(merchantId);
  res.json(profile);
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("merchantAccessToken");
  res.clearCookie("merchantRefreshToken");
  res.json({ message: MSG_MERCHANT_LOGOUT });
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: MSG_EMAIL_REQUIRED });
    return;
  }
  await resendOtpUseCase(email);
  res.json({ message: MSG_OTP_RESENT });
};

export const reapply = async (req: Request, res: Response) => {
  // @ts-ignore
  const merchantId = req.user?.id;
  if (!merchantId) {
    res.status(401).json({ message: MSG_UNAUTHORIZED });
    return;
  }
  const updated = await reapplyUseCase(merchantId, req.body);
  res.json({ message: "Reapplication submitted successfully", merchant: updated });
};
