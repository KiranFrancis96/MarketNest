import type { Request, Response } from "express";
import type {
  IUserRegisterUseCase,
  IUserVerifyOtpUseCase,
  IUserLoginUseCase,
  IUserForgotPasswordUseCase,
  IUserResetPasswordUseCase,
  IUserResendOtpUseCase,
  IUserLogoutUseCase,
  IUserRefreshTokenUseCase,
  IGetUserProfileUseCase,
  IUserGoogleAuthUseCase,
} from "@/application/IUseCases/user/IUserUseCases.ts";
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

export class AuthController {
  constructor(
    private _registerUseCase: IUserRegisterUseCase,
    private _verifyOtpUseCase: IUserVerifyOtpUseCase,
    private _loginUseCase: IUserLoginUseCase,
    private _forgotPasswordUseCase: IUserForgotPasswordUseCase,
    private _resetPasswordUseCase: IUserResetPasswordUseCase,
    private _resendOtpUseCase: IUserResendOtpUseCase,
    private _logoutUseCase: IUserLogoutUseCase,
    private _refreshTokenUseCase: IUserRefreshTokenUseCase,
    private _getUserProfileUseCase: IGetUserProfileUseCase,
    private _googleAuthUseCase: IUserGoogleAuthUseCase
  ) {}

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ message: "Credential token is required" });
      return;
    }

    const result = await this._googleAuthUseCase.execute(credential);

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

  register = async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({ message: MSG_ALL_FIELDS_REQUIRED });
      return;
    }

    await this._registerUseCase.execute({ firstName, lastName, email, password });
    res.status(200).json({ message: MSG_OTP_SENT });
  };

  verify = async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    const result = await this._verifyOtpUseCase.execute({ email, otp });

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

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: MSG_EMAIL_PASSWORD_REQUIRED });
      return;
    }

    const result = await this._loginUseCase.execute({ email, password });

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

  refresh = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies.refreshToken;
    const accessToken = await this._refreshTokenUseCase.execute(token);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({ message: MSG_TOKEN_REFRESHED });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    await this._logoutUseCase.execute({ accessToken, refreshToken });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: MSG_USER_LOGOUT });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: MSG_EMAIL_REQUIRED });
      return;
    }
    await this._forgotPasswordUseCase.execute({ email });
    res.json({ message: MSG_FORGOT_PASSWORD_SENT });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      res.status(400).json({ message: MSG_EMAIL_OTP_PW_REQUIRED });
      return;
    }
    await this._resetPasswordUseCase.execute({ email, otp, password });
    res.json({ message: MSG_PASSWORD_RESET_SUCCESS });
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

  getProfile = async (req: Request, res: Response): Promise<void> => {
    // @ts-ignore
    const userId = req.user.id;
    const user = await this._getUserProfileUseCase.execute(userId);
    res.json(user);
  };
}