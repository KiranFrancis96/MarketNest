import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import { OTP_CONFIG } from "@/config/otp.config.ts";
import type { IMerchantForgotPasswordUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantForgotPasswordInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import logger from "@/utils/logger.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_OTP_EMAIL_FAILED_RESET,
  LOG_OTP_EMAIL_FAILED_RESET,
} from "./messages.constants.ts";

export class ForgotMerchantPasswordUseCase implements IMerchantForgotPasswordUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ email }: MerchantForgotPasswordInputDTO): Promise<void> {
    const merchant = await this._merchantRepository.findByEmail(email);
    if (!merchant) {
      throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);
    }

    const otp = generateOtp();
    logger.info(`Merchant Forgot password OTP for ${email}: ${otp}`);

    await this._merchantRepository.update(
      {
        otp,
        otpExpiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS), // 10 minutes
      },
      email
    );

    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      logger.error(error, LOG_OTP_EMAIL_FAILED_RESET);
      throw new ApiError(502, MSG_OTP_EMAIL_FAILED_RESET);
    }
  }
}
