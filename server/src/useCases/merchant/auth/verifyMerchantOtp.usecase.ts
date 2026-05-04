import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new MerchantRepository();

export const verifyMerchantOtp = async (email: string, otp: string) => {
  const merchant = await repo.findByEmail(email);

  if (!merchant) {
    throw new ApiError(404, "Merchant not found");
  }

  if (merchant.isEmailVerified) {
    throw new ApiError(400, "Merchant already verified");
  }

  if (!merchant.otp || merchant.otp !== otp || !merchant.otpExpires || new Date() > merchant.otpExpires) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await repo.update(
    { 
      isEmailVerified: true, 
      otp: null as any, 
      otpExpires: null as any 
    },
    email
  );

  // We fetch the updated merchant to ensure we have the latest state before generating tokens
  const updatedMerchant = await repo.findByEmail(email);

  const accessToken = generateAccessToken({ 
    id: updatedMerchant!._id as string, 
    email: updatedMerchant!.email, 
    role: "merchant" 
  });
  const refreshToken = generateRefreshToken({ 
    id: updatedMerchant!._id as string, 
    email: updatedMerchant!.email, 
    role: "merchant" 
  });

  return { 
    merchant: {
      id: updatedMerchant!._id,
      email: updatedMerchant!.email,
      businessName: updatedMerchant!.businessName,
      status: updatedMerchant!.status,
      isAdminVerified: updatedMerchant!.isAdminVerified,
    }, 
    accessToken, 
    refreshToken 
  };
};
