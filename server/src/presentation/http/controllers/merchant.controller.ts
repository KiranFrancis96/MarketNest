import type { Request, Response } from "express";
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
    private _completeProfileUseCase: ICompleteMerchantProfileUseCase
  ) {}

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ message: "Credential token is required" });
      return;
    }

    const { merchant, accessToken, refreshToken, isProfileComplete } = await this._googleAuthUseCase.execute(credential);

    res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
    res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: MSG_MERCHANT_LOGIN_SUCCESS, merchant, isProfileComplete });
  };

  completeProfile = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      res.status(401).json({ message: MSG_UNAUTHORIZED });
      return;
    }

    const updated = await this._completeProfileUseCase.execute(merchantId, req.body);
    res.json({ message: "Merchant onboarding completed successfully", merchant: updated });
  };

  register = async (req: Request, res: Response): Promise<void> => {
    await this._registerUseCase.execute(req.body);
    res.status(201).json({ message: MSG_MERCHANT_REGISTER_SUCCESS });
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ message: MSG_EMAIL_OTP_REQUIRED });
      return;
    }

    const { merchant, accessToken, refreshToken } = await this._verifyOtpUseCase.execute({ email, otp });

    res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
    res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: MSG_OTP_VERIFIED, merchant });
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: MSG_EMAIL_PASSWORD_REQUIRED });
      return;
    }

    const { merchant, accessToken, refreshToken } = await this._loginUseCase.execute({ email, password });

    res.cookie("merchantAccessToken", accessToken, { httpOnly: true, sameSite: "lax", maxAge: 15 * 60 * 1000 });
    res.cookie("merchantRefreshToken", refreshToken, { httpOnly: true, sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({ message: MSG_MERCHANT_LOGIN_SUCCESS, merchant });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: MSG_EMAIL_REQUIRED });
      return;
    }
    await this._forgotPasswordUseCase.execute({ email });
    res.json({ message: MSG_MERCHANT_FORGOT_PW_SENT });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      res.status(400).json({ message: MSG_EMAIL_OTP_PW_REQUIRED });
      return;
    }
    await this._resetPasswordUseCase.execute({ email, otp, password });
    res.json({ message: MSG_MERCHANT_PASSWORD_RESET });
  };

  getProfile = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;

    if (!merchantId) {
      res.status(401).json({ message: MSG_UNAUTHORIZED });
      return;
    }

    const profile = await this._getProfileUseCase.execute(merchantId);
    res.json(profile);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies.merchantAccessToken;
    const refreshToken = req.cookies.merchantRefreshToken;
    await this._logoutUseCase.execute({ accessToken, refreshToken });
    res.clearCookie("merchantAccessToken");
    res.clearCookie("merchantRefreshToken");
    res.json({ message: MSG_MERCHANT_LOGOUT });
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: MSG_EMAIL_REQUIRED });
      return;
    }
    await this._resendOtpUseCase.execute({ email });
    res.json({ message: MSG_OTP_RESENT });
  };

  reapply = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const merchantId = req.user?.id;
    if (!merchantId) {
      res.status(401).json({ message: MSG_UNAUTHORIZED });
      return;
    }
    const updated = await this._reapplyUseCase.execute(merchantId, req.body);
    res.json({ message: "Reapplication submitted successfully", merchant: updated });
  };
}
