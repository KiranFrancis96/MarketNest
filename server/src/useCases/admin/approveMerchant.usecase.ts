import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";

const repo = new MerchantRepository();

export const approveMerchant = async (id: string) => {
  const merchant = await repo.findById(id);
  if (!merchant) throw new ApiError(404, "Merchant not found");

  if (merchant.status === "approved") {
    throw new ApiError(400, "Merchant is already approved");
  }

  const updated = await repo.updateById(id, {
    status: "approved",
    isAdminVerified: true,
    rejectionReason: null as any
  });

  return updated;
};
