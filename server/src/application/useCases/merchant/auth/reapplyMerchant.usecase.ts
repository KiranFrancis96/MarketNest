import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IMerchantReapplyUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantReapplyInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { MSG_MERCHANT_NOT_FOUND, MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY } from "./messages.constants.ts";

export class ReapplyMerchantUseCase implements IMerchantReapplyUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(id: string, input: MerchantReapplyInputDTO): Promise<Merchant> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

    if (merchant.status !== "rejected") {
      throw new ApiError(400, MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY);
    }

    const updated = await this._merchantRepository.updateById(id, {
      ...input,
      status: "pending",
      rejectionReason: undefined,
      isAdminVerified: false,
    });

    if (!updated) {
      throw new ApiError(500, "Failed to update merchant reapplication");
    }

    return updated;
  }
}
