import { BaseRepository } from "./BaseRepository.ts";
import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { User } from "@/domain/entities/user.entity.ts";
import { UserModel } from "../models/user.model.ts";
import { UserMapper } from "../mappers/UserMapper.ts";

export class UserRepository extends BaseRepository<User, any> implements IUserRepository {
  constructor() {
    super(UserModel, UserMapper);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await this.model.findOne({ email }).lean();
    return this.mapper.toEntity(userDoc);
  }

  async update(user: Partial<User>, email: string): Promise<void> {
    const docData = this.mapper.toDocument(user as User);
    // remove empty/undefined values so we don't overwrite with undefined
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    await this.model.updateOne({ email }, { $set: docData });
  }

  async findAll(): Promise<User[]> {
    const docs = await this.model.find({}, { password: 0, otp: 0, otpExpires: 0 }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as User);
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await this.model.findByIdAndUpdate(id, { isBlocked });
  }
}