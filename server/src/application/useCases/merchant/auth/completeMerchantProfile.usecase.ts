import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { ICompleteMerchantProfileUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import type { MerchantCompleteProfileInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_ONBOARDING_FIELDS_REQUIRED,
  MSG_MERCHANT_OWNER_NAME_INVALID,
  MSG_MERCHANT_PHONE_INVALID,
  MSG_MERCHANT_GST_INVALID,
  MSG_MERCHANT_ZIP_INVALID,
  MSG_MERCHANT_GST_ALREADY_REGISTERED,
  MSG_MERCHANT_PROFILE_UPDATE_FAILED,
} from "./messages.constants.ts";

export class CompleteMerchantProfileUseCase implements ICompleteMerchantProfileUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(id: string, input: MerchantCompleteProfileInputDTO): Promise<Merchant> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) {
      throw new ApiError(HttpStatus.NOT_FOUND, MSG_MERCHANT_NOT_FOUND);
    }

    const {
      businessName,
      phone,
      gstNumber,
      houseName,
      street,
      locality,
      city,
      state,
      zipCode,
      country,
      ownerName,
    } = input;

    if (
      !businessName ||
      !phone ||
      !gstNumber ||
      !houseName ||
      !street ||
      !locality ||
      !city ||
      !state ||
      !zipCode ||
      !country ||
      !ownerName
    ) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_ONBOARDING_FIELDS_REQUIRED);
    }

    const trimmedOwnerName = ownerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedGstNumber = gstNumber.trim();
    const trimmedZip = zipCode.trim();

    if (!/^[a-zA-Z\s]*$/.test(trimmedOwnerName)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_OWNER_NAME_INVALID);
    }

    if (!/^[0-9]{10}$/.test(trimmedPhone)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_PHONE_INVALID);
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(trimmedGstNumber)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_GST_INVALID);
    }

    if (!/^[0-9]{6}$/.test(trimmedZip)) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_ZIP_INVALID);
    }

    const existingGst = await this._merchantRepository.findOne({ gstNumber: trimmedGstNumber });
    if (existingGst && existingGst._id?.toString() !== id) {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_GST_ALREADY_REGISTERED);
    }

    const updatedMerchant = await this._merchantRepository.updateById(id, {
      businessName: businessName.trim(),
      phone: trimmedPhone,
      gstNumber: trimmedGstNumber,
      houseName: houseName.trim(),
      street: street.trim(),
      locality: locality.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: trimmedZip,
      country: country.trim(),
      ownerName: trimmedOwnerName,
      isProfileComplete: true,
      status: "pending",
    });

    if (!updatedMerchant) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_MERCHANT_PROFILE_UPDATE_FAILED);
    }

    return updatedMerchant;
  }
}
