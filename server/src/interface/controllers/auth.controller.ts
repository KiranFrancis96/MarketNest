import type { Request, Response } from "express";
import { registerUser } from "@/useCases/auth/register.usecase.ts";
import { verifyOtp } from "@/useCases/auth/verifyOtp.usecase.ts";
import { refreshTokenUseCase } from "@/useCases/auth/refreshToken.usecase.ts";
import { loginUser } from "@/useCases/auth/login.usecase.ts";
import { forgotPassword as forgotPasswordUseCase } from "@/useCases/auth/forgotPassword.usecase.ts";
import { resetPassword as resetPasswordUseCase } from "@/useCases/auth/resetPassword.usecase.ts";
import { resendOtp as resendOtpUseCase } from "@/useCases/auth/resendOtp.usecase.ts";
import { UserModel } from "@/infrastructure/database/user.model.ts";

export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
     res.status(400).json({ message: "All fields are required" });
     return;
  }

  await registerUser(firstName, lastName, email, password);

  res.status(200).json({ message: "OTP sent" });
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
    .json({ message: "Verified", user: result.user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
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
    .json({ message: "Logged in successfully", user: result.user });
};

export const refresh = (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const accessToken = refreshTokenUseCase(token);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ message: "refreshed" });
};

export const logout = (_: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({ message: "logged out" });
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

export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }
  await resendOtpUseCase(email);
  res.json({ message: "OTP resent successfully" });
};

export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;
  const user = await UserModel.findById(userId).select("-password -otp -otpExpires");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};