import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IApproveMerchantUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { ApproveMerchantInputDTO, ApproveMerchantOutputDTO } from "@/application/dtos/admin/AdminDtos.ts";
import { ApiError } from "@/utils/apiError.ts";
import {
  MSG_MERCHANT_NOT_FOUND,
  MSG_MERCHANT_ALREADY_APPROVED,
} from "./messages.constants.ts";

export class ApproveMerchantUseCase implements IApproveMerchantUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ id }: ApproveMerchantInputDTO): Promise<ApproveMerchantOutputDTO> {
    const merchant = await this._merchantRepository.findById(id);
    if (!merchant) throw new ApiError(404, MSG_MERCHANT_NOT_FOUND);

    if (merchant.status === "approved") {
      throw new ApiError(400, MSG_MERCHANT_ALREADY_APPROVED);
    }

    const updated = await this._merchantRepository.updateById(id, {
      status: "approved",
      isAdminVerified: true,
      rejectionReason: undefined,
    });

    if (!updated) throw new ApiError(500, "Failed to update merchant status");

    return {
      id: updated._id || id,
      email: updated.email,
      status: "approved",
    };
  }
}
