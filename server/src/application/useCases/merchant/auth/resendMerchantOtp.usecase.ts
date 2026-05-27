import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import { OTP_CONFIG } from "@/config/otp.config.ts";
import type { IMerchantResendOtpUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantResendOtpInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { generateOtp } from "@/utils/generateOtp.ts";
import { sendOtpEmail } from "@/infrastructure/services/otp.service.ts";
import { MSG_MERCHANT_NOT_FOUND } from "./messages.constants.ts";

export class ResendMerchantOtpUseCase implements IMerchantResendOtpUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ email }: MerchantResendOtpInputDTO): Promise<void> {
    const merchant = await this._merchantRepository.findByEmail(email);

    if (!merchant) {
      throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);
    }

    const otp = generateOtp();
    await this._merchantRepository.update(
      {
        otp,
        otpExpiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS), // 10 minutes
      },
      email
    );

    await sendOtpEmail(email, otp);
  }
}
