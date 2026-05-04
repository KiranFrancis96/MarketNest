import bcrypt from "bcrypt";
import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import logger from "@/utils/logger.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new MerchantRepository();

export const registerMerchant = async (data: any) => {
  const existingEmail = await repo.findByEmail(data.email);
  if (existingEmail?.isEmailVerified) {
    throw new ApiError(409, "A merchant with this email already exists and is verified");
  }

  const existingGst = await repo.findByGst(data.gstNumber);
  if (existingGst && existingGst.email !== data.email) {
    throw new ApiError(409, "A merchant with this GST number is already registered");
  }

  const hashed = await bcrypt.hash(data.password, 10);
  const otp = generateOtp();
  logger.info(`Merchant OTP for ${data.email}: ${otp}`);

  const merchantData = {
    ...data,
    password: hashed,
    isEmailVerified: false,
    isAdminVerified: false,
    status: "pending",
    otp,
    otpExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
  };

  if (existingEmail) {
    await repo.update(merchantData, data.email);
  } else {
    await repo.create(merchantData);
  }

  try {
    await sendOtpEmail(data.email, otp);
  } catch (error) {
    logger.error(error, "Failed to send OTP email to merchant");
    throw new ApiError(502, "Could not send OTP email. Please try again.");
  }
};
