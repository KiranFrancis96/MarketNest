import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import logger from "@/utils/logger.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_OTP_EMAIL_FAILED_RESET,
  LOG_OTP_EMAIL_FAILED_RESET,
} from "./messages.constants.ts";

const repo = new MerchantRepository();

export const forgotMerchantPassword = async (email: string) => {
  const merchant = await repo.findByEmail(email);
  if (!merchant) {
    throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);
  }

  const otp = generateOtp();
  logger.info(`Merchant Forgot password OTP for ${email}: ${otp}`);

  await repo.update(
    {
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    email
  );

  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    logger.error(error, LOG_OTP_EMAIL_FAILED_RESET);
    throw new ApiError(502, MSG_OTP_EMAIL_FAILED_RESET);
  }
};
