import type { Merchant } from "@/domain/entities/merchant.entity.ts";

export class MerchantMapper {
  static toEntity(doc: any): Merchant | null {
    if (!doc) return null;
    return {
      _id: doc._id ? doc._id.toString() : doc.id,
      email: doc.email,
      password: doc.password,
      businessName: doc.businessName,
      phone: doc.phone,
      gstNumber: doc.gstNumber,
      houseName: doc.houseName,
      street: doc.street,
      locality: doc.locality,
      city: doc.city,
      state: doc.state,
      zipCode: doc.zipCode,
      country: doc.country,
      ownerName: doc.ownerName,
      documentUrl: doc.documentUrl ?? undefined,
      isEmailVerified: doc.isEmailVerified,
      isProfileComplete: doc.isProfileComplete,
      isAdminVerified: doc.isAdminVerified,
      isBlocked: doc.isBlocked,
      status: doc.status,
      rejectionReason: doc.rejectionReason ?? undefined,
      otp: doc.otp ?? undefined,
      otpExpires: doc.otpExpires ?? undefined,
      createdAt: doc.createdAt ?? undefined,
      updatedAt: doc.updatedAt ?? undefined,
    };
  }

  static toDocument(entity: Merchant): any {
    return {
      email: entity.email,
      password: entity.password,
      businessName: entity.businessName,
      phone: entity.phone,
      gstNumber: entity.gstNumber,
      houseName: entity.houseName,
      street: entity.street,
      locality: entity.locality,
      city: entity.city,
      state: entity.state,
      zipCode: entity.zipCode,
      country: entity.country,
      ownerName: entity.ownerName,
      documentUrl: entity.documentUrl,
      isEmailVerified: entity.isEmailVerified,
      isProfileComplete: entity.isProfileComplete,
      isAdminVerified: entity.isAdminVerified,
      isBlocked: entity.isBlocked,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      otp: entity.otp,
      otpExpires: entity.otpExpires,
    };
  }
}
