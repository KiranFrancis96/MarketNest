import type { Merchant } from "./merchant.entity.ts";

export interface IMerchantRepository {
  findByEmail(email: string): Promise<Merchant | null>;
  findByGst(gstNumber: string): Promise<Merchant | null>;
  findById(id: string): Promise<Merchant | null>;
  create(merchant: Partial<Merchant>): Promise<Merchant>;
  update(merchant: Partial<Merchant>, email: string): Promise<Merchant | null>;
  updateById(id: string, updateData: Partial<Merchant>): Promise<Merchant | null>;
  findAll(status?: Merchant["status"] | "all"): Promise<Merchant[]>;
  toggleBlockStatus(id: string, isBlocked: boolean): Promise<void>;
}
