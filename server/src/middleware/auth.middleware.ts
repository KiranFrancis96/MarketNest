import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";
import { UserModel } from "@/infrastructure/database/user.model.ts";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    next(new ApiError(401, "Authentication token missing"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    
    
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      next(new ApiError(404, "User not found"));
      return;
    }

    if (user.isBlocked) {
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      next(new ApiError(403, "Your account has been blocked. Please contact support."));
      return;
    }

    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
