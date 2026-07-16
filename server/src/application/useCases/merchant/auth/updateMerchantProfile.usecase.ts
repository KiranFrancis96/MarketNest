import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_OWNER_NAME_INVALID,
  MSG_MERCHANT_PHONE_INVALID,
  MSG_MERCHANT_ZIP_INVALID,
  MSG_MERCHANT_PROFILE_UPDATE_FAILED,
} from "./messages.constants.ts";

export class UpdateMerchantProfileUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(id: string, input: Partial<Merchant>): Promise<Merchant> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_MERCHANT_NOT_FOUND);
    }

    const updateData: Partial<Merchant> = {};

    if (input.ownerName !== undefined) {
      const trimmed = input.ownerName.trim();
      if (trimmed && !/^[a-zA-Z\s]*$/.test(trimmed)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_OWNER_NAME_INVALID);
      }
      updateData.ownerName = trimmed;
    }

    if (input.phone !== undefined) {
      const trimmed = input.phone.trim();
      if (trimmed && !/^[0-9]{10}$/.test(trimmed)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_PHONE_INVALID);
      }
      updateData.phone = trimmed;
    }

    if (input.zipCode !== undefined) {
      const trimmed = input.zipCode.trim();
      if (trimmed && !/^[0-9]{6}$/.test(trimmed)) {
        throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_ZIP_INVALID);
      }
      updateData.zipCode = trimmed;
    }

    if (input.businessName !== undefined) updateData.businessName = input.businessName.trim();
    if (input.houseName !== undefined) updateData.houseName = input.houseName.trim();
    if (input.street !== undefined) updateData.street = input.street.trim();
    if (input.locality !== undefined) updateData.locality = input.locality.trim();
    if (input.city !== undefined) updateData.city = input.city.trim();
    if (input.state !== undefined) updateData.state = input.state.trim();
    if (input.country !== undefined) updateData.country = input.country.trim();
    if (input.profilePic !== undefined) updateData.profilePic = input.profilePic.trim();

    const updatedMerchant = await this._merchantRepository.updateById(id, updateData);
    if (!updatedMerchant) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_MERCHANT_PROFILE_UPDATE_FAILED);
    }

    return updatedMerchant;
  }
}
