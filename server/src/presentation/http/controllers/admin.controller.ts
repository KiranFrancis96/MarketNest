import type { Request, Response } from "express";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";
import { COOKIE_CONFIG } from "@/config/cookie.config.ts";
import { UserModel } from "@/infrastructure/database/models/user.model.ts";
import type {
  IAdminLoginUseCase,
  IApproveMerchantUseCase,
  IBlockMerchantUseCase,
  IBlockUserUseCase,
  IForgotPasswordUseCase,
  IGetMerchantsUseCase,
  IGetPendingMerchantsUseCase,
  IGetUsersUseCase,
  IRejectMerchantUseCase,
  IResendAdminOtpUseCase,
  IResetPasswordUseCase,
  IUnblockMerchantUseCase,
  IUnblockUserUseCase,
} from "@/application/IUseCases/admin/IAdminUseCases.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
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

export class AdminController {
  constructor(
    private _adminLoginUseCase: IAdminLoginUseCase,
    private _approveMerchantUseCase: IApproveMerchantUseCase,
    private _blockMerchantUseCase: IBlockMerchantUseCase,
    private _blockUserUseCase: IBlockUserUseCase,
    private _forgotPasswordUseCase: IForgotPasswordUseCase,
    private _getMerchantsUseCase: IGetMerchantsUseCase,
    private _getPendingMerchantsUseCase: IGetPendingMerchantsUseCase,
    private _getUsersUseCase: IGetUsersUseCase,
    private _rejectMerchantUseCase: IRejectMerchantUseCase,
    private _resendAdminOtpUseCase: IResendAdminOtpUseCase,
    private _resetPasswordUseCase: IResetPasswordUseCase,
    private _unblockMerchantUseCase: IUnblockMerchantUseCase,
    private _unblockUserUseCase: IUnblockUserUseCase
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this._adminLoginUseCase.execute({ email, password });

    res.cookie("AccessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_CONFIG.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie("RefreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_CONFIG.REFRESH_TOKEN_MAX_AGE,
    });

    res.json({
      message: MSG_ADMIN_LOGIN_SUCCESS,
      user: {
        id: result.id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        isAdmin: true,
      },
    });
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const accessToken = req.cookies.AccessToken;
    const refreshToken = req.cookies.RefreshToken;

    if (accessToken) await tokenBlacklistService.blacklistToken(accessToken);
    if (refreshToken) await tokenBlacklistService.blacklistToken(refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    res.clearCookie("AccessToken", cookieOptions);
    res.clearCookie("RefreshToken", cookieOptions);

    res.status(HttpStatus.OK).json({ message: MSG_ADMIN_LOGOUT });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    await this._forgotPasswordUseCase.execute({ email });
    res.json({ message: MSG_ADMIN_OTP_SENT });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, otp, password } = req.body;
    await this._resetPasswordUseCase.execute({ email, otp, password });
    res.json({ message: MSG_ADMIN_PASSWORD_RESET });
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await this._getUsersUseCase.execute();
    res.json(users);
  };

  getMerchants = async (req: Request, res: Response): Promise<void> => {
    const { status } = req.query;
    let merchants;
    if (status === "pending") {
      merchants = await this._getPendingMerchantsUseCase.execute();
    } else {
      merchants = await this._getMerchantsUseCase.execute();
    }
    res.json(merchants);
  };

  approveMerchant = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const merchant = await this._approveMerchantUseCase.execute({ id: id as string });
    res.json({ message: MSG_MERCHANT_APPROVED, merchant });
  };

  rejectMerchant = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    if (!rejectionReason) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_ADMIN_REJECTION_REQUIRED });
      return;
    }
    const merchant = await this._rejectMerchantUseCase.execute({ id: id as string, reason: rejectionReason });
    res.json({ message: MSG_MERCHANT_REJECTED, merchant });
  };

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: MSG_ADMIN_OTP_SENT });
      return;
    }
    await this._resendAdminOtpUseCase.execute({ email });
    res.json({ message: MSG_ADMIN_OTP_RESENT });
  };

  blockUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._blockUserUseCase.execute({ id: id as string });
    res.json({ message: MSG_USER_BLOCKED });
  };

  unblockUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._unblockUserUseCase.execute({ id: id as string });
    res.json({ message: MSG_USER_UNBLOCKED });
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { firstName, lastName, email, profilePic } = req.body;
    const updated = await UserModel.findByIdAndUpdate(
      id,
      { $set: { firstName, lastName, email, profilePic } },
      { new: true }
    );
    res.json(updated);
  };

  blockMerchant = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._blockMerchantUseCase.execute({ id: id as string });
    res.json({ message: MSG_MERCHANT_BLOCKED });
  };

  unblockMerchant = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this._unblockMerchantUseCase.execute({ id: id as string });
    res.json({ message: MSG_MERCHANT_UNBLOCKED });
  };
}
