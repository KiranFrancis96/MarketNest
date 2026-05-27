import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IMerchantResetPasswordUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantResetPasswordInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import bcrypt from "bcrypt";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_MERCHANT_NOT_FOUND, MSG_MERCHANT_INVALID_OTP, MSG_MERCHANT_PASSWORD_REQUIRED, MSG_MERCHANT_OTP_EXPIRED } from "./messages.constants.ts";

export class ResetMerchantPasswordUseCase implements IMerchantResetPasswordUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ email, otp, password }: MerchantResetPasswordInputDTO): Promise<void> {
    if (!password) {
      throw new ApiError(400, MSG_MERCHANT_PASSWORD_REQUIRED);
    }

    const merchant = await this._merchantRepository.findByEmail(email);
    if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

    if (!merchant.otp || !merchant.otpExpiresAt) {
      throw new ApiError(400, MSG_MERCHANT_INVALID_OTP);
    }

    if (merchant.otpExpiresAt < new Date()) {
      throw new ApiError(400, MSG_MERCHANT_OTP_EXPIRED);
    }

    if (merchant.otp !== otp) {
      throw new ApiError(400, MSG_MERCHANT_INVALID_OTP);
    }

    const hashed = await bcrypt.hash(password, 10);

    await this._merchantRepository.update(
      {
        password: hashed,
        otp: undefined,
        otpExpiresAt: undefined,
      },
      email
    );
  }
}
