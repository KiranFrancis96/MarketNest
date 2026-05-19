import type { IBaseRepository } from "@/domain/interface/IBaseRepository.ts";
import mongoose from "mongoose";

export abstract class BaseRepository<T, D> implements IBaseRepository<T> {
  constructor(
    protected model: mongoose.Model<D>,
    protected mapper: {
      toEntity(doc: any): T | null;
      toDocument(entity: T): any;
    }
  ) {}

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? (this.mapper.toEntity(doc) as T) : null;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const doc = await this.model.findOne(filter as any).lean();
    return doc ? (this.mapper.toEntity(doc) as T) : null;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const docData = this.mapper.toDocument(data as T);
    // Remove undefined values to avoid overwriting database fields with undefined
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const created = await this.model.create(docData);
    return created ? (this.mapper.toEntity(created.toObject()) as T) : null;
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const docData = this.mapper.toDocument(data as T);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: docData },
      { new: true }
    ).lean();
    return updated ? (this.mapper.toEntity(updated) as T) : null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async findOneAndUpdate(filter: Partial<T>, data: Partial<T>): Promise<T | null> {
    const docData = this.mapper.toDocument(data as T);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await this.model.findOneAndUpdate(
      filter as any,
      { $set: docData },
      { new: true }
    ).lean();
    return updated ? (this.mapper.toEntity(updated) as T) : null;
  }

  async findByIds(ids: string[]): Promise<T[]> {
    const docs = await this.model.find({ _id: { $in: ids } } as any).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as T);
  }

  async findMany(filter: Partial<T>): Promise<T[]> {
    const docs = await this.model.find(filter as any).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as T);
  }

  async getCount(filter: Partial<T>): Promise<number> {
    return await this.model.countDocuments(filter as any);
  }
}
