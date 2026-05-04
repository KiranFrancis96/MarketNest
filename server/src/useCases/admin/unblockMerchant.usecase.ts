import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";

const repo = new MerchantRepository();

export const unblockMerchant = async (id: string) => {
  await repo.toggleBlockStatus(id, false);
};
