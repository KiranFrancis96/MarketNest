import { MerchantRepository } from "@/infrastructure/repositories/merchant.repository.impl.ts";

const repo = new MerchantRepository();

export const getPendingMerchants = async () => {
  return repo.findAll("pending");
};
