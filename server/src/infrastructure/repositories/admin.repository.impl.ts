import { UserModel } from "../database/user.model.ts";
import type { Admin } from "@/entities/admin/admin.entity.ts";
import type { IAdminRepository } from "@/entities/admin/admin.repository.ts";

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const user = await UserModel.findOne({ email, isAdmin: true });
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      password: user.password,
      otp: user.otp,
      otpExpires: user.otpExpires,
    };
  }

  async findById(id: string): Promise<Admin | null> {
    const user = await UserModel.findOne({ _id: id, isAdmin: true });
    if (!user) return null;
    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
    };
  }

  async update(email: string, updateData: Partial<Admin>): Promise<void> {
    await UserModel.updateOne({ email, isAdmin: true }, updateData);
  }
}
