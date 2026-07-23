import type { IBaseRepository } from "@/domain/interface/IBaseRepository.ts";
import mongoose from "mongoose";

export abstract class BaseRepository<T, D = any> implements IBaseRepository<T> {
  constructor(
    protected model: mongoose.Model<D>,
    protected mapper: {
    toEntity(doc: unknown): T | null;
    toDocument(entity: Partial<T>): Record<string, unknown>;
   }
  ) {}

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    return doc ? (this.mapper.toEntity(doc) as T) : null;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    const doc = await this.model.findOne(filter as mongoose.FilterQuery<D>).lean();
    return doc ? (this.mapper.toEntity(doc) as T) : null;
  }

  async create(data: Partial<T>): Promise<T | null> {
    const docData = this.mapper.toDocument(data);
    
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const created = await this.model.create(docData as mongoose.AnyKeys<D>);
    return created ? (this.mapper.toEntity(created.toObject()) as T) : null;
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    const docData = this.mapper.toDocument(data);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await this.model.findByIdAndUpdate(
      id,
      { $set: docData as mongoose.UpdateQuery<D> },
      { new: true }
    ).lean();
    return updated ? (this.mapper.toEntity(updated) as T) : null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }

  async findOneAndUpdate(filter: Partial<T>, data: Partial<T>): Promise<T | null> {
    const docData = this.mapper.toDocument(data);
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    const updated = await this.model.findOneAndUpdate(
      filter as mongoose.FilterQuery<D>,
      { $set: docData as mongoose.UpdateQuery<D> },
      { new: true }
    ).lean();
    return updated ? (this.mapper.toEntity(updated) as T) : null;
  }

  async findByIds(ids: string[]): Promise<T[]> {
    const docs = await this.model.find({ _id: { $in: ids } } as mongoose.FilterQuery<D>).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as T);
  }

  async findMany(filter: Partial<T>): Promise<T[]> {
    const docs = await this.model.find(filter as mongoose.FilterQuery<D>).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as T);
  }

  async getCount(filter: Partial<T>): Promise<number> {
    return await this.model.countDocuments(filter as mongoose.FilterQuery<D>);
  }
}
