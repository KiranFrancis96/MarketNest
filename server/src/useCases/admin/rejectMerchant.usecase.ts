import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new MerchantRepository();

export const rejectMerchant = async (id: string, reason: string) => {
  const merchant = await repo.findById(id);
  if (!merchant) throw new ApiError(404, "Merchant not found");

  if (merchant.status === "rejected") {
    throw new ApiError(400, "Merchant is already rejected");
  }

  const updated = await repo.updateById(id, {
    status: "rejected",
    isAdminVerified: false,
    rejectionReason: reason
  });

  return updated;
};
