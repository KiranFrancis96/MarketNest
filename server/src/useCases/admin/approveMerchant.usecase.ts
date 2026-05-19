import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_ALREADY_APPROVED,
} from "./messages.constants.ts";

const repo = new MerchantRepository();

export const approveMerchant = async (id: string) => {
  const merchant = await repo.findById(id);
  if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

  if (merchant.status === "approved") {
    throw new ApiError(400, MSG_MERCHANT_ALREADY_APPROVED);
  }

  const updated = await repo.updateById(id, {
    status: "approved",
    isAdminVerified: true,
    rejectionReason: null as any,
  });

  return updated;
};
