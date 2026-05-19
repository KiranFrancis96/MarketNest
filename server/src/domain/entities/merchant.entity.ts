export interface Merchant {
  _id?: string;
  email: string;
  password: string;
  businessName: string;
  phone: string;
  gstNumber: string;
  houseName: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  ownerName: string;
  documentUrl?: string | undefined;
  isEmailVerified: boolean;
  isProfileComplete?: boolean;
  isAdminVerified: boolean;
  isBlocked: boolean;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | undefined;
  otp?: string | undefined;
  otpExpires?: Date | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}
