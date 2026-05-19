import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { IBlockMerchantUseCase } from "@/application/IUseCases/admin/IAdminUseCases.ts";
import type { BlockMerchantInputDTO } from "@/application/dtos/admin/AdminDtos.ts";

export class BlockMerchantUseCase implements IBlockMerchantUseCase {
  constructor(private _merchantRepository: IMerchantRepository) {}

  async execute({ id }: BlockMerchantInputDTO): Promise<void> {
    await this._merchantRepository.toggleBlockStatus(id, true);
  }
}
