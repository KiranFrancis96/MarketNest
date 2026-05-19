import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_MERCHANT_NOT_FOUND, MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY } from "./messages.constants.ts";

const repo = new MerchantRepository();

export const reapplyMerchant = async (id: string, updateData: Record<string, unknown>) => {
  const merchant = await repo.findById(id);
  if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

  if (merchant.status !== "rejected") {
    throw new ApiError(400, MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY);
  }

  const updated = await repo.updateById(id, {
    ...updateData,
    status: "pending",
    rejectionReason: undefined,
    isAdminVerified: false,
  });

  return updated;
};
