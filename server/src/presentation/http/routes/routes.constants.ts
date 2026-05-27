// ─── Base Paths (server.ts mounts) ────────────────────────────────────────────
export const BASE_AUTH_ROUTE     = "/api/auth";
export const BASE_MERCHANT_ROUTE = "/api/merchant";
export const BASE_ADMIN_ROUTE    = "/api/admin";
export const BASE_PRODUCT_ROUTE  = "/api/products";
export const BASE_CATEGORY_ROUTE = "/api/categories";
export const BASE_CART_ROUTE     = "/api/cart";
export const BASE_WISHLIST_ROUTE = "/api/wishlist";

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
export const ROUTE_GOOGLE        = "/google";

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
export const ROUTE_MERCHANT_COMPLETE_PROFILE = "/complete-profile";

// ─── Products & Shopping Routes ────────────────────────────────────────────────
export const ROUTE_BASE                    = "/";
export const ROUTE_PRODUCT_SEARCH          = "/search";
export const ROUTE_PRODUCT_RECOMMENDATIONS = "/recommendations";
export const ROUTE_PRODUCT_BY_ID           = "/:id";
export const ROUTE_PRODUCT_ID_PARAM        = "/:productId";
export const ROUTE_SUBCATEGORY             = "/subcategory";

export const ROUTE_MERCHANT_PRODUCT_LIST   = "/merchant/list";
export const ROUTE_MERCHANT_PRODUCT_ADD    = "/merchant/add";
export const ROUTE_MERCHANT_PRODUCT_EDIT   = "/merchant/edit/:id";
export const ROUTE_MERCHANT_PRODUCT_DELETE = "/merchant/delete/:id";

export const ROUTE_ADMIN_PRODUCT_BLOCK     = "/admin/block/:id";

