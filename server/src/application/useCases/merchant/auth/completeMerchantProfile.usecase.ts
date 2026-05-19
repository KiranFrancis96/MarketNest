import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { ICompleteMerchantProfileUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { ApiError } from "@/utils/apiError.ts";

export class CompleteMerchantProfileUseCase implements ICompleteMerchantProfileUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(id: string, input: any): Promise<Merchant> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) {
      throw new ApiError(404, "Merchant not found");
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
      throw new ApiError(400, "All onboarding fields are required");
    }

    const trimmedOwnerName = ownerName.trim();
    const trimmedPhone = phone.trim();
    const trimmedGstNumber = gstNumber.trim();
    const trimmedZip = zipCode.trim();

    if (!/^[a-zA-Z\s]*$/.test(trimmedOwnerName)) {
      throw new ApiError(400, "Owner name should only contain letters");
    }

    if (!/^[0-9]{10}$/.test(trimmedPhone)) {
      throw new ApiError(400, "Phone number must be 10 digits");
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(trimmedGstNumber)) {
      throw new ApiError(400, "Invalid GST format (e.g. 22AAAAA0000A1Z5)");
    }

    if (!/^[0-9]{6}$/.test(trimmedZip)) {
      throw new ApiError(400, "ZIP code must be 6 digits");
    }

    const existingGst = await this._merchantRepository.findOne({ gstNumber: trimmedGstNumber });
    if (existingGst && existingGst._id?.toString() !== id) {
      throw new ApiError(400, "GST number is already registered by another store");
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
      throw new ApiError(500, "Failed to update merchant profile");
    }

    return updatedMerchant;
  }
}
