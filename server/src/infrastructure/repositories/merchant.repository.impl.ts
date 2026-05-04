import { MerchantModel } from "../database/merchant.model.ts";
import type { Merchant } from "@/entities/merchant/merchant.entity.ts";
import type { IMerchantRepository } from "@/entities/merchant/merchant.repository.ts";

export class MerchantRepository implements IMerchantRepository {
  async findByEmail(email: string): Promise<Merchant | null> {
    return (await MerchantModel.findOne({ email })) as unknown as Merchant | null;
  }

  async findByGst(gstNumber: string): Promise<Merchant | null> {
    return (await MerchantModel.findOne({ gstNumber })) as unknown as Merchant | null;
  }

  async findById(id: string): Promise<Merchant | null> {
    return (await MerchantModel.findById(id)) as unknown as Merchant | null;
  }

  async create(merchantData: Partial<Merchant>): Promise<Merchant> {
    const merchant = new MerchantModel(merchantData);
    return (await merchant.save()) as unknown as Merchant;
  }

  async update(merchantData: Partial<Merchant>, email: string): Promise<Merchant | null> {
    return (await MerchantModel.findOneAndUpdate({ email }, merchantData, { new: true })) as unknown as Merchant | null;
  }

  async updateById(id: string, updateData: Partial<Merchant>): Promise<Merchant | null> {
    return (await MerchantModel.findByIdAndUpdate(id, updateData, { new: true })) as unknown as Merchant | null;
  }

  async findAll(status?: Merchant["status"] | "all"): Promise<Merchant[]> {
    const query = status && status !== "all" ? { status } : {};
    return (await MerchantModel.find(query, { password: 0, otp: 0, otpExpires: 0 }).sort({ createdAt: -1 })) as unknown as Merchant[];
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await MerchantModel.findByIdAndUpdate(id, { isBlocked });
  }
}
