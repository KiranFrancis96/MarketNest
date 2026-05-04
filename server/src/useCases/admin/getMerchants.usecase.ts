import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";

const repo = new MerchantRepository();

export const getMerchants = async (status?: string) => {
  return await repo.findAll(status);
};
