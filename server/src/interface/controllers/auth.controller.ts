import type { Request, Response } from "express";
import { registerUser } from "@/useCases/auth/register.usecase.ts";
import { verifyOtp } from "@/useCases/auth/verifyOtp.usecase.ts";
import { refreshTokenUseCase } from "@/useCases/auth/refreshToken.usecase.ts";
import { loginUser } from "@/useCases/auth/login.usecase.ts";
import { forgotPassword as forgotPasswordUseCase } from "@/useCases/auth/forgotPassword.usecase.ts";
import { resetPassword as resetPasswordUseCase } from "@/useCases/auth/resetPassword.usecase.ts";
import { resendOtp as resendOtpUseCase } from "@/useCases/auth/resendOtp.usecase.ts";
import { UserModel } from "@/infrastructure/database/user.model.ts";
import {
  MSG_ALL_FIELDS_REQUIRED,
  MSG_EMAIL_REQUIRED,
  MSG_EMAIL_PASSWORD_REQUIRED,
  MSG_EMAIL_OTP_PW_REQUIRED,
  MSG_OTP_SENT,
  MSG_OTP_RESENT,
  MSG_VERIFIED,
  MSG_USER_LOGIN_SUCCESS,
  MSG_USER_LOGOUT,
  MSG_TOKEN_REFRESHED,
  MSG_FORGOT_PASSWORD_SENT,
  MSG_PASSWORD_RESET_SUCCESS,
  MSG_USER_NOT_FOUND,
} from "./messages.constants.ts";

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ message: MSG_ALL_FIELDS_REQUIRED });
    return;
  }

  await registerUser(firstName, lastName, email, password);

  res.status(200).json({ message: MSG_OTP_SENT });
};

export const verify = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const result = await verifyOtp(email, otp);

  res
    .cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .json({ message: MSG_VERIFIED, user: result.user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: MSG_EMAIL_PASSWORD_REQUIRED });
    return;
  }

  const result = await loginUser(email, password);

  res
    .cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })
    .json({ message: MSG_USER_LOGIN_SUCCESS, user: result.user });
};

export const refresh = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const accessToken = refreshTokenUseCase(token);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ message: MSG_TOKEN_REFRESHED });
};

export const logout = (_: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ message: MSG_USER_LOGOUT });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: MSG_EMAIL_REQUIRED });
    return;
  }
  await forgotPasswordUseCase(email);
  res.json({ message: MSG_FORGOT_PASSWORD_SENT });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) {
    res.status(400).json({ message: MSG_EMAIL_OTP_PW_REQUIRED });
    return;
  }
  await resetPasswordUseCase(email, otp, password);
  res.json({ message: MSG_PASSWORD_RESET_SUCCESS });
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

export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const user = await UserModel.findById(userId).select("-password -otp -otpExpires");
  if (!user) {
    res.status(404).json({ message: MSG_USER_NOT_FOUND });
    return;
  }
  res.json(user);
};