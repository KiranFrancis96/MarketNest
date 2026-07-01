import type { Admin } from "@/domain/entities/admin.entity.ts";
import mongoose from "mongoose";

interface IAdminDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
  password?: string;
  otp?: string | null;
  otpExpires?: Date | null;
}

export class AdminMapper {
  static toEntity(doc: unknown): Admin | null {
    if (!doc) return null;
    const d = doc as IAdminDoc;
    return {
      id: d._id ? d._id.toString() : d.id,
      email: d.email || "",
      firstName: d.firstName || "",
      lastName: d.lastName || "",
      isAdmin: !!d.isAdmin,
      password: d.password || "",
      otp: d.otp ?? undefined,
      otpExpires: d.otpExpires ?? undefined,
    };
  }

  static toDocument(entity: Admin): Record<string, unknown> {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      isAdmin: entity.isAdmin,
      otp: entity.otp,
      otpExpires: entity.otpExpires,
    };
  }
}
