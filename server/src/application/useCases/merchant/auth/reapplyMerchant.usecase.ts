import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IMerchantReapplyUseCase } from "@/application/IUseCases/merchant/IMerchantUseCases.ts";
import type { MerchantReapplyInputDTO } from "@/application/dtos/merchant/MerchantDtos.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { ApiError } from "@/utils/apiError.ts";
import { HttpStatus } from "@/utils/httpStatus.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY,
  MSG_MERCHANT_REAPPLY_FAILED,
} from "./messages.constants.ts";

export class ReapplyMerchantUseCase implements IMerchantReapplyUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(id: string, input: MerchantReapplyInputDTO): Promise<Merchant> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) throw new ApiError(HttpStatus.NOT_FOUND, MSG_MERCHANT_NOT_FOUND);

    if (merchant.status !== "rejected") {
      throw new ApiError(HttpStatus.BAD_REQUEST, MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY);
    }

    const updated = await this._merchantRepository.updateById(id, {
      ...input,
      status: "pending",
      rejectionReason: undefined,
      isAdminVerified: false,
    });

    if (!updated) {
      throw new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, MSG_MERCHANT_REAPPLY_FAILED);
    }

    return updated;
  }
}
