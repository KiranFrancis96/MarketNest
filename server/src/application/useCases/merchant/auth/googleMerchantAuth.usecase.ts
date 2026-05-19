import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IMerchantGoogleAuthUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantLoginOutputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import { verifyGoogleToken } from "@/utils/google.ts";
import { generateAccessToken, generateRefreshToken } from "@/infrastructure/services/jwt.service.ts";
import { ApiError } from "@/utils/apiError.ts";
import bcrypt from "bcrypt";
import {
  MSG_MERCHANT_CREATE_FAILED,
  MSG_MERCHANT_ACCOUNT_BLOCKED,
  MSG_MERCHANT_VERIFICATION_UPDATE_FAILED,
} from "./messages.constants.ts";

export class GoogleMerchantAuthUseCase implements IMerchantGoogleAuthUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(credential: string): Promise<MerchantLoginOutputDTO & { isProfileComplete: boolean }> {
    const payload = await verifyGoogleToken(credential);
    const email = payload.email;

    let merchant = await this._merchantRepository.findByEmail(email);
    let isProfileComplete = true;

    if (!merchant) {
      isProfileComplete = false;
      const ownerName = payload.given_name || payload.name || "Google Merchant";
      const randomPassword = Math.random().toString(36).slice(-10) + Date.now().toString();
      const hashed = await bcrypt.hash(randomPassword, 10);

      // Create merchant with placeholder fields to satisfy Mongoose schema constraints
      merchant = await this._merchantRepository.create({
        email,
        password: hashed,
        businessName: "Google Store",
        phone: "Pending",
        gstNumber: `PENDING-${email}`,
        houseName: "Pending",
        street: "Pending",
        locality: "Pending",
        city: "Pending",
        state: "Pending",
        zipCode: "Pending",
        country: "Pending",
        ownerName,
        isEmailVerified: true,
        isProfileComplete: false,
        isAdminVerified: false,
        isBlocked: false,
        status: "pending",
      });

      if (!merchant) {
        throw new ApiError(500, MSG_MERCHANT_CREATE_FAILED);
      }
    } else {
      if (merchant.isBlocked) {
        throw new ApiError(403, MSG_MERCHANT_ACCOUNT_BLOCKED);
      }

      if (!merchant.isEmailVerified) {
        // Since Google verified the email, set it to true
        const updated = await this._merchantRepository.updateById(merchant._id as string, { isEmailVerified: true });
        if (!updated) {
          throw new ApiError(500, MSG_MERCHANT_VERIFICATION_UPDATE_FAILED);
        }
        merchant = updated;
      }

      // Check if profile was complete (if the flag is false, or if it still has pending/placeholder values)
      if (merchant.isProfileComplete === false || merchant.gstNumber.startsWith("PENDING-")) {
        isProfileComplete = false;
      }
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
      isProfileComplete,
    };
  }
}
