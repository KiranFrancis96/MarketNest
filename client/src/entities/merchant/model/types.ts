export interface Merchant {
  id: string;
  email: string;
  businessName: string;
  status: "pending" | "approved" | "rejected";
  isAdminVerified: boolean;
  rejectionReason?: string;
}

export interface MerchantAuthState {
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
