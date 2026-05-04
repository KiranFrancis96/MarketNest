import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.adminAccessToken;
  if (!token) {
    next(new ApiError(401, "Admin authentication token missing"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    
    if (!decoded.isAdmin) {
      next(new ApiError(403, "Access denied. Admin only."));
      return;
    }

    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired admin token"));
  }
};
