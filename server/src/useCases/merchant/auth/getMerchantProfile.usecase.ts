import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new MerchantRepository();

export const getMerchantProfile = async (id: string) => {
  const merchant = await repo.findById(id);
  
  if (!merchant) {
    throw new ApiError(404, "Merchant not found");
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
};
