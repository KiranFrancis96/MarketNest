import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";
import { UserModel } from "@/infrastructure/database/models/user.model.ts";
import { tokenBlacklistService } from "@/infrastructure/services/tokenBlacklist.service.ts";
import {
  MSG_AUTH_TOKEN_MISSING,
  MSG_AUTH_TOKEN_INVALID,
  MSG_AUTH_USER_NOT_FOUND,
  MSG_AUTH_USER_BLOCKED,
} from "./messages.constants.ts";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    next(new ApiError(401, MSG_AUTH_TOKEN_MISSING));
    return;
  }

  const isBlacklisted = await tokenBlacklistService.isTokenBlacklisted(token);
  if (isBlacklisted) {
    next(new ApiError(401, MSG_AUTH_TOKEN_INVALID));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      next(new ApiError(404, MSG_AUTH_USER_NOT_FOUND));
      return;
    }

    if (user.isBlocked) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      next(new ApiError(403, MSG_AUTH_USER_BLOCKED));
      return;
    }

    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, MSG_AUTH_TOKEN_INVALID));
  }
};
