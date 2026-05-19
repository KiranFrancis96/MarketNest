import type { User } from "@/domain/entities/user.entity.ts";

export class UserMapper {
  static toEntity(doc: any): User | null {
    if (!doc) return null;
    return {
      _id: doc._id ? doc._id.toString() : doc.id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      email: doc.email,
      password: doc.password,
      isVerified: doc.isVerified,
      otp: doc.otp ?? undefined,
      otpExpires: doc.otpExpires ?? undefined,
      isBlocked: doc.isBlocked,
    };
  }

  static toDocument(entity: User): any {
    return {
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      isVerified: entity.isVerified,
      otp: entity.otp,
      otpExpires: entity.otpExpires,
      isBlocked: entity.isBlocked,
    };
  }
}
