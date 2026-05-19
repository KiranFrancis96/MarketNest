// ─── Base Paths (server.ts mounts) ────────────────────────────────────────────
export const BASE_AUTH_ROUTE     = "/api/auth";
export const BASE_MERCHANT_ROUTE = "/api/merchant";
export const BASE_ADMIN_ROUTE    = "/api/admin";

// ─── Auth Routes ──────────────────────────────────────────────────────────────
export const ROUTE_REGISTER      = "/register";
export const ROUTE_LOGIN         = "/login";
export const ROUTE_LOGOUT        = "/logout";
export const ROUTE_VERIFY_OTP    = "/verify-otp";
export const ROUTE_RESEND_OTP    = "/resend-otp";
export const ROUTE_FORGOT_PW     = "/forgot-password";
export const ROUTE_RESET_PW      = "/reset-password";
export const ROUTE_REFRESH       = "/refresh";
export const ROUTE_PROFILE       = "/profile";

// ─── Admin Routes ─────────────────────────────────────────────────────────────
export const ROUTE_USERS                   = "/users";
export const ROUTE_MERCHANTS               = "/merchants";
export const ROUTE_MERCHANT_APPROVE        = "/merchants/:id/approve";
export const ROUTE_MERCHANT_REJECT         = "/merchants/:id/reject";
export const ROUTE_MERCHANT_BLOCK          = "/merchants/:id/block";
export const ROUTE_MERCHANT_UNBLOCK        = "/merchants/:id/unblock";
export const ROUTE_USER_BLOCK              = "/users/:id/block";
export const ROUTE_USER_UNBLOCK            = "/users/:id/unblock";

// ─── Merchant Routes ──────────────────────────────────────────────────────────
export const ROUTE_MERCHANT_ME             = "/me";
export const ROUTE_MERCHANT_REAPPLY        = "/reapply";
