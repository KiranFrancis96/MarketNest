import type { Request, Response } from "express";
import { registerMerchant as registerUseCase } from "@/useCases/merchant/auth/registerMerchant.usecase.ts";
import { verifyMerchantOtp as verifyOtpUseCase } from "@/useCases/merchant/auth/verifyMerchantOtp.usecase.ts";
import { loginMerchant as loginUseCase } from "@/useCases/merchant/auth/loginMerchant.usecase.ts";
import { forgotMerchantPassword as forgotPasswordUseCase } from "@/useCases/merchant/auth/forgotMerchantPassword.usecase.ts";
import { resetMerchantPassword as resetPasswordUseCase } from "@/useCases/merchant/auth/resetMerchantPassword.usecase.ts";
import { getMerchantProfile as getProfileUseCase } from "@/useCases/merchant/auth/getMerchantProfile.usecase.ts";
import { resendMerchantOtp as resendOtpUseCase } from "@/useCases/merchant/auth/resendMerchantOtp.usecase.ts";

export const register = async (req: Request, res: Response) => {
  await registerUseCase(req.body);
  res.status(201).json({ message: "Registration successful. Please verify your OTP." });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    res.status(400).json({ message: "Email and OTP are required" });
    return;
  }
  
  const { merchant, accessToken, refreshToken } = await verifyOtpUseCase(email, otp);
  
  res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
  res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  
  res.json({ message: "OTP verified successfully", merchant });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const { merchant, accessToken, refreshToken } = await loginUseCase(email, password);
  
  res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
  res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });
  
  res.json({ message: "Login successful", merchant });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  await forgotPasswordUseCase(email);
  res.json({ message: "If an account exists, a password reset OTP was sent" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    res.status(400).json({ message: "Email, OTP, and new password are required" });
    return;
  }
  await resetPasswordUseCase(email, otp, password);
  res.json({ message: "Password reset successfully. You can now log in." });
};

export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore - Assuming a middleware attaches `user` to req
  const merchantId = req.user?.id;
  
  if (!merchantId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  
  const profile = await getProfileUseCase(merchantId);
  res.json(profile);
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie("merchantAccessToken");
  res.clearCookie("merchantRefreshToken");
  res.json({ message: "Logged out successfully" });
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  await resendOtpUseCase(email);
  res.json({ message: "OTP resent successfully" });
};
