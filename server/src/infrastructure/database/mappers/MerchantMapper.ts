import type { Merchant } from "@/domain/entities/merchant.entity.ts";
import mongoose from "mongoose";

interface IMerchantDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  email?: string;
  password?: string;
  businessName?: string;
  phone?: string;
  gstNumber?: string;
  houseName?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  ownerName?: string;
  documentUrl?: string | null;
  profilePic?: string | null;
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
  isAdminVerified?: boolean;
  isBlocked?: boolean;
  status?: Merchant["status"];
  rejectionReason?: string | null;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MerchantMapper {
  static toEntity(doc: unknown): Merchant | null {
    if (!doc) return null;
    const d = doc as IMerchantDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      email: d.email || "",
      password: d.password || "",
      businessName: d.businessName || "",
      phone: d.phone || "",
      gstNumber: d.gstNumber || "",
      houseName: d.houseName || "",
      street: d.street || "",
      locality: d.locality || "",
      city: d.city || "",
      state: d.state || "",
      zipCode: d.zipCode || "",
      country: d.country || "",
      ownerName: d.ownerName || "",
      documentUrl: d.documentUrl ?? undefined,
      profilePic: d.profilePic ?? undefined,
      isEmailVerified: !!d.isEmailVerified,
      isProfileComplete: d.isProfileComplete !== false,
      isAdminVerified: !!d.isAdminVerified,
      isBlocked: !!d.isBlocked,
      status: d.status || "pending",
      rejectionReason: d.rejectionReason ?? undefined,
      otp: d.otp ?? undefined,
      otpExpiresAt: d.otpExpiresAt ?? undefined,
      createdAt: d.createdAt ?? undefined,
      updatedAt: d.updatedAt ?? undefined,
    };
  }

  static toDocument(entity: Merchant): Record<string, unknown> {
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
      profilePic: entity.profilePic,
      isEmailVerified: entity.isEmailVerified,
      isProfileComplete: entity.isProfileComplete,
      isAdminVerified: entity.isAdminVerified,
      isBlocked: entity.isBlocked,
      status: entity.status,
      rejectionReason: entity.rejectionReason,
      otp: entity.otp,
      otpExpiresAt: entity.otpExpiresAt,
    };
  }
}
