// ─── Auth (User) Routes ───────────────────────────────────────────────────────
export const AUTH_REGISTER            = "/auth/register";
export const AUTH_LOGIN               = "/auth/login";
export const AUTH_LOGOUT              = "/auth/logout";
export const AUTH_VERIFY_OTP          = "/auth/verify-otp";
export const AUTH_RESEND_OTP          = "/auth/resend-otp";
export const AUTH_FORGOT_PASSWORD     = "/auth/forgot-password";
export const AUTH_RESET_PASSWORD      = "/auth/reset-password";
export const AUTH_PROFILE             = "/auth/profile";
export const AUTH_GOOGLE              = "/auth/google";
export const AUTH_REFRESH             = "/auth/refresh";
export const AUTH_ADDRESSES           = "/auth/profile/addresses";
export const AUTH_ADDRESS_BY_ID       = (addressId: string) => `/auth/profile/addresses/${addressId}`;

// ─── Admin Routes ─────────────────────────────────────────────────────────────
export const ADMIN_LOGIN              = "/admin/login";
export const ADMIN_LOGOUT             = "/admin/logout";
export const ADMIN_FORGOT_PASSWORD    = "/admin/forgot-password";
export const ADMIN_RESET_PASSWORD     = "/admin/reset-password";
export const ADMIN_RESEND_OTP         = "/admin/resend-otp";
export const ADMIN_USERS              = "/admin/users";
export const ADMIN_USER_BY_ID         = (id: string) => `/admin/users/${id}`;
export const ADMIN_USER_BLOCK         = (id: string) => `/admin/users/${id}/block`;
export const ADMIN_USER_UNBLOCK       = (id: string) => `/admin/users/${id}/unblock`;
export const ADMIN_MERCHANTS          = "/admin/merchants";
export const ADMIN_MERCHANT_APPROVE   = (id: string) => `/admin/merchants/${id}/approve`;
export const ADMIN_MERCHANT_REJECT    = (id: string) => `/admin/merchants/${id}/reject`;
export const ADMIN_MERCHANT_BLOCK     = (id: string) => `/admin/merchants/${id}/block`;
export const ADMIN_MERCHANT_UNBLOCK   = (id: string) => `/admin/merchants/${id}/unblock`;

// ─── Merchant Routes ──────────────────────────────────────────────────────────
export const MERCHANT_REGISTER        = "/merchant/register";
export const MERCHANT_LOGIN           = "/merchant/login";
export const MERCHANT_LOGOUT          = "/merchant/logout";
export const MERCHANT_VERIFY_OTP      = "/merchant/verify-otp";
export const MERCHANT_RESEND_OTP      = "/merchant/resend-otp";
export const MERCHANT_FORGOT_PASSWORD = "/merchant/forgot-password";
export const MERCHANT_RESET_PASSWORD  = "/merchant/reset-password";
export const MERCHANT_PROFILE         = "/merchant/me";
export const MERCHANT_REAPPLY         = "/merchant/reapply";
export const MERCHANT_GOOGLE          = "/merchant/google";
export const MERCHANT_COMPLETE_PROFILE = "/merchant/complete-profile";
export const MERCHANT_UPDATE_PROFILE  = "/merchant/profile";

// ─── Order Routes ─────────────────────────────────────────────────────────────
export const ORDERS                         = "/orders";
export const ORDERS_VERIFY                  = "/orders/verify";
export const ORDERS_BY_ID                   = (id: string) => `/orders/${id}`;
export const ORDERS_MERCHANT_SALES          = "/orders/merchant/sales";
export const ORDERS_MERCHANT_ITEM_STATUS    = "/orders/merchant/items/status";
export const ORDERS_USER_ITEM_STATUS        = "/orders/user/items/status";
export const ORDERS_ADMIN_USER              = (userId: string) => `/orders/admin/user/${userId}`;
export const ORDERS_ADMIN_MERCHANT          = (merchantId: string) => `/orders/admin/merchant/${merchantId}`;
export const ORDERS_WALLET_PAY              = (id: string) => `/orders/${id}/wallet-pay`;
export const ORDERS_MARK_FAILED             = (id: string) => `/orders/${id}/fail`;
export const ORDERS_WALLET_ADD              = "/orders/wallet/add";

// ─── User Profile Routes ──────────────────────────────────────────────────────
export const PROFILE                  = "/profile";
