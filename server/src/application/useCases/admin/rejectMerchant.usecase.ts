import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IRejectMerchantUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { RejectMerchantInputDTO, RejectMerchantOutputDTO } from "@/application/dtos/admin/AdminDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_ALREADY_REJECTED,
  MSG_MERCHANT_UPDATE_FAILED,
} from "./messages.constants.ts";

export class RejectMerchantUseCase implements IRejectMerchantUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ id, reason }: RejectMerchantInputDTO): Promise<RejectMerchantOutputDTO> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

    if (merchant.status === "rejected") {
      throw new ApiError(400, MSG_MERCHANT_ALREADY_REJECTED);
    }

    const updated = await this._merchantRepository.updateById(id, {
      status: "rejected",
      isAdminVerified: false,
      rejectionReason: reason,
    });

    if (!updated) throw new ApiError(500, MSG_MERCHANT_UPDATE_FAILED);

    return {
      id: updated._id || id,
      email: updated.email,
      status: "rejected",
    };
  }
}
