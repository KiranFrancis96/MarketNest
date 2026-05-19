import { UserModel } from "../models/user.model.ts";
import type { Admin } from "@/domain/entities/admin.entity.ts";
import type { IAdminRepository } from "@/domain/interface/admin.repository.ts";
import { AdminMapper } from "../mappers/AdminMapper.ts";

export class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<Admin | null> {
    const userDoc = await UserModel.findOne({ email, isAdmin: true }).lean();
    return AdminMapper.toEntity(userDoc);
  }

  async findById(id: string): Promise<Admin | null> {
    const userDoc = await UserModel.findOne({ _id: id, isAdmin: true }).lean();
    return AdminMapper.toEntity(userDoc);
  }

  async update(email: string, updateData: Partial<Admin>): Promise<void> {
    const docData = updateData.id ? updateData : AdminMapper.toDocument(updateData as Admin);
    // remove empty/undefined values so we don't overwrite with undefined
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) {
        delete docData[key];
      }
    });
    await UserModel.updateOne({ email, isAdmin: true }, { $set: docData });
  }
}
