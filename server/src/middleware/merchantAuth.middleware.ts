import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "@/utils/apiError.ts";
import { MerchantModel } from "@/infrastructure/database/merchant.model.ts";

export const authenticateMerchant = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.merchantAccessToken;

  if (!token) {
    next(new ApiError(401, "Merchant authentication token missing"));
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as any;
    
    
    const merchant = await MerchantModel.findById(decoded.id);
    if (!merchant) {
      next(new ApiError(404, "Merchant not found"));
      return;
    }

    if (merchant.isBlocked) {
      res.clearCookie("merchantAccessToken");
      res.clearCookie("merchantRefreshToken");
      next(new ApiError(403, "Your merchant account has been blocked. Please contact admin."));
      return;
    }

    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired merchant token"));
  }
};
