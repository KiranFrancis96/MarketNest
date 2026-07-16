import type { Request, Response } from "express";
import { COOKIE_CONFIG } from "@/config/cookie.config.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import type {
  IMerchantRegisterUseCase,
  IMerchantVerifyOtpUseCase,
  IMerchantLoginUseCase,
  IMerchantForgotPasswordUseCase,
  IMerchantResetPasswordUseCase,
  IGetMerchantProfileUseCase,
  IMerchantResendOtpUseCase,
  IMerchantReapplyUseCase,
  IMerchantLogoutUseCase,
  IMerchantGoogleAuthUseCase,
  ICompleteMerchantProfileUseCase,
} from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import { UpdateMerchantProfileUseCase } from "@/application/useCases/merchant/auth/updateMerchantProfile.usecase.ts";
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
  MSG_CREDENTIAL_REQUIRED,
  MSG_MERCHANT_ONBOARDING_SUCCESS,
  MSG_REAPPLICATION_SUBMITTED_SUCCESS,
} from "./messages.constants.ts";

export class MerchantController {
  constructor(
    private _registerUseCase: IMerchantRegisterUseCase,
    private _verifyOtpUseCase: IMerchantVerifyOtpUseCase,
    private _loginUseCase: IMerchantLoginUseCase,
    private _forgotPasswordUseCase: IMerchantForgotPasswordUseCase,
    private _resetPasswordUseCase: IMerchantResetPasswordUseCase,
    private _getProfileUseCase: IGetMerchantProfileUseCase,
    private _resendOtpUseCase: IMerchantResendOtpUseCase,
    private _reapplyUseCase: IMerchantReapplyUseCase,
    private _logoutUseCase: IMerchantLogoutUseCase,
    private _googleAuthUseCase: IMerchantGoogleAuthUseCase,
    private _completeProfileUseCase: ICompleteMerchantProfileUseCase,
    private _updateProfileUseCase: UpdateMerchantProfileUseCase
  ) {}

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: MSG_UNAUTHORIZED });
      return;
    }

    const updated = await this._updateProfileUseCase.execute(merchantId, req.body);
    res.json({ message: "Merchant profile updated successfully", merchant: updated });
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;
    if (!credential) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_CREDENTIAL_REQUIRED });
      return;
    }

    const { merchant, accessToken, refreshToken, isProfileComplete } = await this._googleAuthUseCase.execute(credential);

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE });

    res.json({ message: MSG_MERCHANT_LOGIN_SUCCESS, merchant, isProfileComplete });
  };

  completeProfile = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: MSG_UNAUTHORIZED });
      return;
    }

    const updated = await this._completeProfileUseCase.execute(merchantId, req.body);
    res.json({ message: MSG_MERCHANT_ONBOARDING_SUCCESS, merchant: updated });
  };

  register = async (req: Request, res: Response): Promise<void> => {
    await this._registerUseCase.execute(req.body);
    res.status(HttpStatus.CREATED).json({ message: MSG_MERCHANT_REGISTER_SUCCESS });
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_EMAIL_OTP_REQUIRED });
      return;
    }

    const { merchant, accessToken, refreshToken } = await this._verifyOtpUseCase.execute({ email, otp });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE });

    res.json({ message: MSG_OTP_VERIFIED, merchant });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_EMAIL_PASSWORD_REQUIRED });
      return;
    }

    const { merchant, accessToken, refreshToken } = await this._loginUseCase.execute({ email, password });

    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE });

    res.json({ message: MSG_MERCHANT_LOGIN_SUCCESS, merchant });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_EMAIL_REQUIRED });
      return;
    }
    await this._forgotPasswordUseCase.execute({ email });
    res.json({ message: MSG_MERCHANT_FORGOT_PW_SENT });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_EMAIL_OTP_PW_REQUIRED });
      return;
    }
    await this._resetPasswordUseCase.execute({ email, otp, password });
    res.json({ message: MSG_MERCHANT_PASSWORD_RESET });
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;

    if (!merchantId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: MSG_UNAUTHORIZED });
      return;
    }

    const profile = await this._getProfileUseCase.execute(merchantId);
    res.json(profile);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    await this._logoutUseCase.execute({ accessToken, refreshToken });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: MSG_MERCHANT_LOGOUT });
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_EMAIL_REQUIRED });
      return;
    }
    await this._resendOtpUseCase.execute({ email });
    res.json({ message: MSG_OTP_RESENT });
  };

  reapply = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: MSG_UNAUTHORIZED });
      return;
    }
    const updated = await this._reapplyUseCase.execute(merchantId, req.body);
    res.json({ message: MSG_REAPPLICATION_SUBMITTED_SUCCESS, merchant: updated });
  };
}
