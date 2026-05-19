import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IGetPendingMerchantsUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";

export class GetPendingMerchantsUseCase implements IGetPendingMerchantsUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute(): Promise<Merchant[]> {
    return await this._merchantRepository.findAll("pending");
  }
}
