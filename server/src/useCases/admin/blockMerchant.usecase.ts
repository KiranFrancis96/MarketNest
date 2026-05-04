import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";

const repo = new MerchantRepository();

export const blockMerchant = async (id: string) => {
  await repo.toggleBlockStatus(id, true);
};
