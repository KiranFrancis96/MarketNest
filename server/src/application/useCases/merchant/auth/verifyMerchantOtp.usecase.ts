import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IMerchantVerifyOtpUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantVerifyOtpInputDTO, MerchantVerifyOtpOutputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_ALREADY_VERIFIED,
  MSG_MERCHANT_INVALID_OTP,
  MSG_MERCHANT_FETCH_FAILED_AFTER_VERIFY,
} from "./messages.constants.ts";

export class VerifyMerchantOtpUseCase implements IMerchantVerifyOtpUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ email, otp }: MerchantVerifyOtpInputDTO): Promise<MerchantVerifyOtpOutputDTO> {
    const merchant = await this._merchantRepository.findByEmail(email);

    if (!merchant) {
      throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);
    }

    if (merchant.isEmailVerified) {
      throw new ApiError(400, MSG_MERCHANT_ALREADY_VERIFIED);
    }

    if (!merchant.otp || merchant.otp !== otp || !merchant.otpExpires || new Date() > merchant.otpExpires) {
      throw new ApiError(400, MSG_MERCHANT_INVALID_OTP);
    }

    await this._merchantRepository.update(
      {
        isEmailVerified: true,
        otp: undefined,
        otpExpires: undefined,
      },
      email
    );

    
    const updatedMerchant = await this._merchantRepository.findByEmail(email);
    if (!updatedMerchant) {
      throw new ApiError(500, MSG_MERCHANT_FETCH_FAILED_AFTER_VERIFY);
    }

    const accessToken = generateAccessToken({
      id: updatedMerchant._id as string,
      email: updatedMerchant.email,
      role: "merchant",
    });
    const refreshToken = generateRefreshToken({
      id: updatedMerchant._id as string,
      email: updatedMerchant.email,
      role: "merchant",
    });

    return {
      merchant: updatedMerchant,
      accessToken,
      refreshToken,
    };
  }
}
