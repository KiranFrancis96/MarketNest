import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";
import { MerchantModel } from "@/infrastructure/database/models/merchant.model.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";
import {
  MSG_MERCHANT_TOKEN_INVALID,
  MSG_MERCHANT_BLOCKED,
} from "./messages.constants.ts";

export const adminOrMerchantAuth = async (req: Request, res: Response, next: NextFunction) => {
  const adminToken = req.cookies.AccessToken;
  const merchantToken = req.cookies.accessToken;

  if (!adminToken && !merchantToken) {
    next(new ApiError(401, "Access token missing"));
    return;
  }

  if (adminToken) {
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(adminToken);
    if (!isBlacklisted) {
      try {
        const decoded = jwt.verify(adminToken, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;
        if (decoded.isAdmin) {
          req.admin = decoded;
          req.user = decoded;
          next();
          return;
        }
      } catch (err: unknown) {
      }
    }
  }

  if (merchantToken) {
    const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(merchantToken);
    if (isBlacklisted) {
      next(new ApiError(401, MSG_MERCHANT_TOKEN_INVALID));
      return;
    }

    try {
      const decoded = jwt.verify(merchantToken, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload;
      const merchant = await MerchantModel.findById(decoded.id);
      if (!merchant) {
        next(new ApiError(401, MSG_MERCHANT_TOKEN_INVALID));
        return;
      }

      if (merchant.isBlocked) {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        next(new ApiError(403, MSG_MERCHANT_BLOCKED));
        return;
      }

      req.merchant = decoded;
      req.user = decoded;
      next();
      return;
     } catch (err: unknown) {
      next(new ApiError(401, MSG_MERCHANT_TOKEN_INVALID));
      return;
    }
  }

  next(new ApiError(401, "Invalid authentication credentials"));
};
