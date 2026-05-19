import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IUnblockMerchantUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { UnblockMerchantInputDTO } from "@/application/dtos/admin/AdminDtos.ts";

export class UnblockMerchantUseCase implements IUnblockMerchantUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ id }: UnblockMerchantInputDTO): Promise<void> {
    await this._merchantRepository.toggleBlockStatus(id, false);
  }
}
