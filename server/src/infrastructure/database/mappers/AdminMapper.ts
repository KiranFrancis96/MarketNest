import type { Admin } from "@/domain/entities/admin.entity.ts";

export class AdminMapper {
  static toEntity(doc: any): Admin | null {
    if (!doc) return null;
    return {
      id: doc._id ? doc._id.toString() : doc.id,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      isAdmin: doc.isAdmin,
      password: doc.password,
      otp: doc.otp ?? undefined,
      otpExpires: doc.otpExpires ?? undefined,
    };
  }

  static toDocument(entity: Admin): any {
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
