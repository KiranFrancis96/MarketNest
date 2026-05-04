export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export interface Merchant {
  _id: string;
  businessName: string;
  email: string;
  phone: string;
  gstNumber: string;
  ownerName: string;
  status: "pending" | "approved" | "rejected";
  isAdminVerified: boolean;
  isBlocked: boolean;
  houseName: string;
  street: string;
  locality: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: string;
  rejectionReason?: string;
}

export const ADMIN_TYPES_LOADED = true;
