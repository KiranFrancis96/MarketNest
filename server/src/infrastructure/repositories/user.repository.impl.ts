import type { IUserRepository } from "@/entities/user/user.repository.ts";
import type { User } from "@/entities/user/user.entity.ts";
import { UserModel } from "../database/user.model.ts";

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    return (await UserModel.create(user)) as unknown as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return (await UserModel.findOne({ email })) as unknown as User | null;
  }

  async update(user: Partial<User>, email: string): Promise<void> {
    await UserModel.updateOne({ email }, user);
  }

  async findAll(): Promise<User[]> {
    return (await UserModel.find({}, { password: 0, otp: 0, otpExpires: 0 }).sort({ createdAt: -1 })) as unknown as User[];
  }

  async toggleBlockStatus(id: string, isBlocked: boolean): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { isBlocked });
  }
}