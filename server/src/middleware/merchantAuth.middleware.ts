import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";
import { MerchantModel } from "@/infrastructure/database/models/merchant.model.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";
import {
  MSG_MERCHANT_TOKEN_MISSING,
  MSG_MERCHANT_TOKEN_INVALID,
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_BLOCKED,
} from "./messages.constants.ts";

export const authenticateMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    next(new ApiError(401, MSG_MERCHANT_TOKEN_MISSING));
    return;
  }

  const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    next(new ApiError(401, MSG_MERCHANT_TOKEN_INVALID));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;

    const merchant = await MerchantModel.findById(decoded.id);
    if (!merchant) {
      next(new ApiError(404, MSG_MERCHANT_NOT_FOUND));
      return;
    }

    if (merchant.isBlocked) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      next(new ApiError(403, MSG_MERCHANT_BLOCKED));
      return;
    }

    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err: unknown) {
    next(new ApiError(401, MSG_MERCHANT_TOKEN_INVALID));
  }
};
