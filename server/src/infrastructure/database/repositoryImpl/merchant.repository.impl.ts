import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { MerchantModel } from "../models/merchant.model.ts";
import { MerchantMapper } from "../mappers/MerchantMapper.ts";

export class MerchantRepository implements IMerchantRepository {
  async findByEmail(email: string): Promise<Merchant | null> {
    const doc = await MerchantModel.findOne({ email }).lean();
    return MerchantMapper.toEntity(doc);
  }

  async findByGst(gstNumber: string): Promise<Merchant | null> {
    const doc = await MerchantModel.findOne({ gstNumber }).lean();
    return MerchantMapper.toEntity(doc);
  }

  async findById(id: string): Promise<Merchant | null> {
    const doc = await MerchantModel.findById(id).lean();
    return MerchantMapper.toEntity(doc);
  }

  async create(merchantData: Partial<Merchant>): Promise<Merchant> {
    const docData = MerchantMapper.toDocument(merchantData as Merchant);
    const merchant = new MerchantModel(docData);
    const saved = await merchant.save();
    return MerchantMapper.toEntity(saved.toObject()) as Merchant;
  }

  async update(merchantData: Partial<Merchant>, email: string): Promise<Merchant | null> {
    const docData = MerchantMapper.toDocument(merchantData as Merchant);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await MerchantModel.findOneAndUpdate({ email }, { $set: docData }, { new: true }).lean();
    return MerchantMapper.toEntity(updated);
  }

  async updateById(id: string, updateData: Partial<Merchant>): Promise<Merchant | null> {
    const docData = MerchantMapper.toDocument(updateData as Merchant);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await MerchantModel.findByIdAndUpdate(id, { $set: docData }, { new: true }).lean();
    return MerchantMapper.toEntity(updated);
  }

  async findAll(status?: Merchant["status"] | "all"): Promise<Merchant[]> {
    const query = status && status !== "all" ? { status } : {};
    const docs = await MerchantModel.find(query, { password: 0, otp: 0, otpExpires: 0 }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => MerchantMapper.toEntity(doc) as Merchant);
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await MerchantModel.findByIdAndUpdate(id, { isBlocked });
  }
}
