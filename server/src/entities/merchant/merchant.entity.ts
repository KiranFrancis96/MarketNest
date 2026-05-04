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
  documentUrl?: string;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  isBlocked: boolean;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  otp?: string;
  otpExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
