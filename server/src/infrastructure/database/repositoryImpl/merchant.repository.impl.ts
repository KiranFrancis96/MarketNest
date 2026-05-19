import { BaseRepository } from "./BaseRepository.ts";
import type { IMerchantRepository } from "@/domain/interface/merchant.repository.ts";
import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import { MerchantModel } from "../models/merchant.model.ts";
import { MerchantMapper } from "../mappers/MerchantMapper.ts";

export class MerchantRepository extends BaseRepository<Merchant, any> implements IMerchantRepository {
  constructor() {
    super(MerchantModel, MerchantMapper);
  }

  async findByEmail(email: string): Promise<Merchant | null> {
    const doc = await this.model.findOne({ email }).lean();
    return this.mapper.toEntity(doc);
  }

  async findByGst(gstNumber: string): Promise<Merchant | null> {
    const doc = await this.model.findOne({ gstNumber }).lean();
    return this.mapper.toEntity(doc);
  }

  async update(merchantData: Partial<Merchant>, email: string): Promise<Merchant | null> {
    const docData = this.mapper.toDocument(merchantData as Merchant);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await this.model.findOneAndUpdate({ email }, { $set: docData }, { new: true }).lean();
    return this.mapper.toEntity(updated);
  }

  async findAll(status?: Merchant["status"] | "all"): Promise<Merchant[]> {
    const query = status && status !== "all" ? { status } : {};
    const docs = await this.model.find(query, { password: 0, otp: 0, otpExpires: 0 }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as Merchant);
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await this.model.findByIdAndUpdate(id, { isBlocked });
  }
}
