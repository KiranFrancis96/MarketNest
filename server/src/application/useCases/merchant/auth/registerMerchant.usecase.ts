import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import { OTP_CONFIG } from "@/config/otp.config.ts";
import type { IMerchantRegisterUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantRegisterInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import bcrypt from "bcrypt";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import logger from "@/utils/logger.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_MERCHANT_EMAIL_ALREADY_EXISTS,
  MSG_MERCHANT_GST_ALREADY_EXISTS,
  MSG_OTP_EMAIL_FAILED,
  LOG_OTP_EMAIL_FAILED,
  MSG_MERCHANT_PASSWORD_REQUIRED,
} from "./messages.constants.ts";

export class RegisterMerchantUseCase implements IMerchantRegisterUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(data: MerchantRegisterInputDTO): Promise<void> {
    if (!data.password) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_PASSWORD_REQUIRED);
    }

    const existingEmail = await this._merchantRepository.findByEmail(data.email);
    if (existingEmail?.isEmailVerified) {
      throw new ApiError(HttpStatus.CONFLICT, MSG_MERCHANT_EMAIL_ALREADY_EXISTS);
    }

    const existingGst = await this._merchantRepository.findByGst(data.gstNumber);
    if (existingGst && existingGst.email !== data.email) {
      throw new ApiError(HttpStatus.CONFLICT, MSG_MERCHANT_GST_ALREADY_EXISTS);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const otp = generateOtp();
    logger.info(`Merchant OTP for ${data.email}: ${otp}`);

    const merchantData = {
      ...data,
      password: hashed,
      isEmailVerified: false,
      isAdminVerified: false,
      isBlocked: false,
      status: "pending" as const,
      otp,
      otpExpiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS), // 10 minutes
    };

    if (existingEmail) {
      await this._merchantRepository.update(merchantData, data.email);
    } else {
      await this._merchantRepository.create(merchantData);
    }

    try {
      await sendOtpEmail(data.email, otp);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(err, LOG_OTP_EMAIL_FAILED);
      throw new ApiError(HttpStatus.BAD_GATEWAY, MSG_OTP_EMAIL_FAILED);
    }
  }
}
