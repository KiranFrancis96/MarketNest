import type { Request, Response } from "express";
import { adminLogin as loginUseCase } from "@/useCases/admin/adminLogin.usecase.ts";
import { forgotPassword as forgotUseCase } from "@/useCases/admin/forgotPassword.usecase.ts";
import { resetPassword as resetUseCase } from "@/useCases/admin/resetPassword.usecase.ts";
import { getUsers as getUsersUseCase } from "@/useCases/admin/getUsers.usecase.ts";
import { getMerchants as getMerchantsUseCase } from "@/useCases/admin/getMerchants.usecase.ts";
import { approveMerchant as approveUseCase } from "@/useCases/admin/approveMerchant.usecase.ts";
import { rejectMerchant as rejectUseCase } from "@/useCases/admin/rejectMerchant.usecase.ts";
import { resendAdminOtp as resendAdminOtpUseCase } from "@/useCases/admin/resendAdminOtp.usecase.ts";
import { blockUser as blockUseCase } from "@/useCases/admin/blockUser.usecase.ts";
import { unblockUser as unblockUseCase } from "@/useCases/admin/unblockUser.usecase.ts";
import { blockMerchant as blockMerchantUseCase } from "@/useCases/admin/blockMerchant.usecase.ts";
import { unblockMerchant as unblockMerchantUseCase } from "@/useCases/admin/unblockMerchant.usecase.ts";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUseCase(email, password);

  res.cookie("adminAccessToken", result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("adminRefreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({ message: "Login successful", user: result.user });
};

export const logout = (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  res.clearCookie("adminAccessToken", cookieOptions);
  res.clearCookie("adminRefreshToken", cookieOptions);
  
  res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  await forgotUseCase(email);
  res.json({ message: "OTP sent to email" });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  await resetUseCase(email, otp, password);
  res.json({ message: "Password reset successful" });
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await getUsersUseCase();
  res.json(users);
};

export const getMerchants = async (req: Request, res: Response) => {
  const { status } = req.query;
  const merchants = await getMerchantsUseCase(status as string);
  res.json(merchants);
};

export const approveMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const merchant = await approveUseCase(id as string);
  res.json({ message: "Merchant approved successfully", merchant });
};

export const rejectMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  if (!rejectionReason) {
    res.status(400).json({ message: "Rejection reason is required" });
    return;
  }
  const merchant = await rejectUseCase(id as string, rejectionReason);
  res.json({ message: "Merchant rejected successfully", merchant });
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  await resendAdminOtpUseCase(email);
  res.json({ message: "OTP resent successfully" });
};

export const blockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await blockUseCase(id as string);
  res.json({ message: "User blocked successfully" });
};

export const unblockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await unblockUseCase(id as string);
  res.json({ message: "User unblocked successfully" });
};

export const blockMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  await blockMerchantUseCase(id as string);
  res.json({ message: "Merchant blocked successfully" });
};

export const unblockMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  await unblockMerchantUseCase(id as string);
  res.json({ message: "Merchant unblocked successfully" });
};
