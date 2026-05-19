import bcrypt from "bcrypt";
import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_INVALID_CREDENTIALS,
  MSG_MERCHANT_NOT_VERIFIED,
  MSG_MERCHANT_BLOCKED,
} from "./messages.constants.ts";

const repo = new MerchantRepository();

export const loginMerchant = async (email: string, pass: string) => {
  const merchant = await repo.findByEmail(email);

  if (!merchant) {
    throw new ApiError(401, MSG_MERCHANT_INVALID_CREDENTIALS);
  }

  const isValid = await bcrypt.compare(pass, merchant.password);
  if (!isValid) {
    throw new ApiError(401, MSG_MERCHANT_INVALID_CREDENTIALS);
  }

  if (!merchant.isEmailVerified) {
    throw new ApiError(403, MSG_MERCHANT_NOT_VERIFIED);
  }

  if (merchant.isBlocked) {
    throw new ApiError(403, MSG_MERCHANT_BLOCKED);
  }

  const accessToken = generateAccessToken({
    id: merchant._id as string,
    email: merchant.email,
    role: "merchant",
  });
  const refreshToken = generateRefreshToken({
    id: merchant._id as string,
    email: merchant.email,
    role: "merchant",
  });

  return {
    merchant: {
      id: merchant._id,
      email: merchant.email,
      businessName: merchant.businessName,
      status: merchant.status,
      isAdminVerified: merchant.isAdminVerified,
      rejectionReason: merchant.rejectionReason,
    },
    accessToken,
    refreshToken,
  };
};
