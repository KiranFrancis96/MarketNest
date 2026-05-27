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
    const $set: any = {};
    const $unset: any = {};

    Object.keys(docData).forEach((key) => {
      if (key in user) {
        if (docData[key] === undefined) {
          $unset[key] = "";
        } else {
          $set[key] = docData[key];
        }
      }
    });

    const updateQuery: any = {};
    if (Object.keys($set).length > 0) updateQuery.$set = $set;
    if (Object.keys($unset).length > 0) updateQuery.$unset = $unset;

    if (Object.keys(updateQuery).length > 0) {
      await this.model.updateOne({ email }, updateQuery);
    }
  }

  async findAll(): Promise<User[]> {
    const docs = await this.model.find({}, { password: 0, otp: 0, otpExpiresAt: 0 }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => this.mapper.toEntity(doc) as User);
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await this.model.findByIdAndUpdate(id, { isBlocked });
  }
}