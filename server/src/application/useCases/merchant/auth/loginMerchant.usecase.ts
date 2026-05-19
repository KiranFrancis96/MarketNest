import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IMerchantLoginUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantLoginInputDTO, MerchantVerifyOtpOutputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_INVALID_CREDENTIALS,
  MSG_MERCHANT_NOT_VERIFIED,
  MSG_MERCHANT_BLOCKED,
  MSG_MERCHANT_PASSWORD_REQUIRED,
} from "./messages.constants.ts";

export class LoginMerchantUseCase implements IMerchantLoginUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ email, password }: MerchantLoginInputDTO): Promise<MerchantVerifyOtpOutputDTO> {
    if (!password) {
      throw new ApiError(400, MSG_MERCHANT_PASSWORD_REQUIRED);
    }

    const merchant = await this._merchantRepository.findByEmail(email);

    if (!merchant) {
      throw new ApiError(401, MSG_MERCHANT_INVALID_CREDENTIALS);
    }

    const isValid = await bcrypt.compare(password, merchant.password);
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
      merchant,
      accessToken,
      refreshToken,
    };
  }
}
