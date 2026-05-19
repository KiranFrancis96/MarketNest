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
import {
  MSG_ADMIN_LOGIN_SUCCESS,
  MSG_ADMIN_LOGOUT,
  MSG_ADMIN_OTP_SENT,
  MSG_ADMIN_OTP_RESENT,
  MSG_ADMIN_PASSWORD_RESET,
  MSG_ADMIN_REJECTION_REQUIRED,
  MSG_MERCHANT_APPROVED,
  MSG_MERCHANT_REJECTED,
  MSG_USER_BLOCKED,
  MSG_USER_UNBLOCKED,
  MSG_MERCHANT_BLOCKED,
  MSG_MERCHANT_UNBLOCKED,
} from "./messages.constants.ts";

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

  res.json({ message: MSG_ADMIN_LOGIN_SUCCESS, user: result.user });
};

export const logout = (req: Request, res: Response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  res.clearCookie("adminAccessToken", cookieOptions);
  res.clearCookie("adminRefreshToken", cookieOptions);

  res.status(200).json({ message: MSG_ADMIN_LOGOUT });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  await forgotUseCase(email);
  res.json({ message: MSG_ADMIN_OTP_SENT });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  await resetUseCase(email, otp, password);
  res.json({ message: MSG_ADMIN_PASSWORD_RESET });
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
  res.json({ message: MSG_MERCHANT_APPROVED, merchant });
};

export const rejectMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  if (!rejectionReason) {
    res.status(400).json({ message: MSG_ADMIN_REJECTION_REQUIRED });
    return;
  }
  const merchant = await rejectUseCase(id as string, rejectionReason);
  res.json({ message: MSG_MERCHANT_REJECTED, merchant });
};

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: MSG_ADMIN_OTP_SENT });
    return;
  }
  await resendAdminOtpUseCase(email);
  res.json({ message: MSG_ADMIN_OTP_RESENT });
};

export const blockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await blockUseCase(id as string);
  res.json({ message: MSG_USER_BLOCKED });
};

export const unblockUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await unblockUseCase(id as string);
  res.json({ message: MSG_USER_UNBLOCKED });
};

export const blockMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  await blockMerchantUseCase(id as string);
  res.json({ message: MSG_MERCHANT_BLOCKED });
};

export const unblockMerchant = async (req: Request, res: Response) => {
  const { id } = req.params;
  await unblockMerchantUseCase(id as string);
  res.json({ message: MSG_MERCHANT_UNBLOCKED });
};
