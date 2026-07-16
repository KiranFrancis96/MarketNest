export interface Merchant {
  id?: string;
  _id?: string;
  email: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  gstNumber?: string;
  houseName?: string;
  street?: string;
  locality?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status: "pending" | "approved" | "rejected";
  isAdminVerified: boolean;
  rejectionReason?: string;
  profilePic?: string;
}

export interface MerchantAuthState {
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
