import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IGetMerchantProfileUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_MERCHANT_NOT_FOUND } from "./messages.constants.ts";

export class GetMerchantProfileUseCase implements IGetMerchantProfileUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(id: string): Promise<Partial<Merchant>> {
    const merchant = await this._merchantRepository.findById(id);

    if (!merchant) {
      throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);
    }

    return {
      email: merchant.email,
      businessName: merchant.businessName,
      houseName: merchant.houseName,
      street: merchant.street,
      locality: merchant.locality,
      city: merchant.city,
      state: merchant.state,
      zipCode: merchant.zipCode,
      country: merchant.country,
      status: merchant.status,
      isAdminVerified: merchant.isAdminVerified,
      rejectionReason: merchant.rejectionReason,
    };
  }
}
