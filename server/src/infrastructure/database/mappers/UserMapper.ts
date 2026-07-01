import type { User } from "@/domain/entities/user.entity.ts";
import mongoose from "mongoose";

interface IUserDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  isVerified?: boolean;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  isBlocked?: boolean;
  addresses?: any[];
}

export class UserMapper {
  static toEntity(doc: unknown): User | null {
    if (!doc) return null;
    const d = doc as IUserDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      firstName: d.firstName || "",
      lastName: d.lastName || "",
      email: d.email || "",
      password: d.password || "",
      isVerified: !!d.isVerified,
      otp: d.otp ?? undefined,
      otpExpiresAt: d.otpExpiresAt ?? undefined,
      isBlocked: !!d.isBlocked,
      addresses: (d.addresses || []).map((addr: any) => ({
        _id: addr._id ? addr._id.toString() : addr.id,
        fullName: addr.fullName || "",
        phone: addr.phone || "",
        street: addr.street || "",
        city: addr.city || "",
        state: addr.state || "",
        zipCode: addr.zipCode || "",
        country: addr.country || "",
        isDefault: !!addr.isDefault,
      })),
    };
  }

  static toDocument(entity: User): Record<string, unknown> {
    const doc: Record<string, any> = {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      isVerified: entity.isVerified,
      otp: entity.otp,
      otpExpiresAt: entity.otpExpiresAt,
      isBlocked: entity.isBlocked,
    };
    if (entity.addresses !== undefined) {
      doc.addresses = entity.addresses.map((addr) => ({
        _id: addr._id,
        fullName: addr.fullName,
        phone: addr.phone,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        zipCode: addr.zipCode,
        country: addr.country,
        isDefault: addr.isDefault,
      }));
    }
    return doc;
  }
}
