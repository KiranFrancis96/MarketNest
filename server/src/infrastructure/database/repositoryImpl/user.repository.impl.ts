import type { IUserRepository } from "@/domain/interface/user.repository.ts";
import type { User } from "@/domain/entities/user.entity.ts";
import { UserModel } from "../models/user.model.ts";
import { UserMapper } from "../mappers/UserMapper.ts";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const docData = UserMapper.toDocument(user);
    const created = await UserModel.create(docData);
    return UserMapper.toEntity(created.toObject()) as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email }).lean();
    return UserMapper.toEntity(userDoc);
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id).lean();
    return UserMapper.toEntity(userDoc);
  }

  async update(user: Partial<User>, email: string): Promise<void> {
    const docData = UserMapper.toDocument(user as User);
    // remove empty/undefined values so we don't overwrite with undefined
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    await UserModel.updateOne({ email }, { $set: docData });
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find({}, { password: 0, otp: 0, otpExpires: 0 }).sort({ createdAt: -1 }).lean();
    return docs.map((doc) => UserMapper.toEntity(doc) as User);
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { isBlocked });
  }
}