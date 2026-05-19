import type { IBaseRepository } from "./IBaseRepository.ts";
import type { Merchant } from "../entities/merchant.entity.ts";

export interface IMerchantRepository extends IBaseRepository<Merchant> {
  findByEmail(email: string): Promise<Merchant | null>;
  findByGst(gstNumber: string): Promise<Merchant | null>;
  update(merchant: Partial<Merchant>, email: string): Promise<Merchant | null>;
  findAll(status?: Merchant["status"] | "all"): Promise<Merchant[]>;
  toggleBlockStatus(id: string, isBlocked: boolean): Promise<void>;
}
