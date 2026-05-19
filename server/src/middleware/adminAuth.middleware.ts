import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_ADMIN_TOKEN_MISSING,
  MSG_ADMIN_TOKEN_INVALID,
  MSG_ADMIN_ACCESS_DENIED,
} from "./messages.constants.ts";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.adminAccessToken;
  if (!token) {
    next(new ApiError(401, MSG_ADMIN_TOKEN_MISSING));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;

    if (!decoded.isAdmin) {
      next(new ApiError(403, MSG_ADMIN_ACCESS_DENIED));
      return;
    }

    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, MSG_ADMIN_TOKEN_INVALID));
  }
};
