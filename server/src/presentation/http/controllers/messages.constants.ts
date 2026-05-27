// ─── Shared / Common ──────────────────────────────────────────────────────────
export const MSG_EMAIL_REQUIRED         = "Email is required";
export const MSG_EMAIL_PASSWORD_REQUIRED = "Email and password are required";
export const MSG_EMAIL_OTP_REQUIRED     = "Email and OTP are required";
export const MSG_EMAIL_OTP_PW_REQUIRED  = "Email, OTP, and new password are required";
export const MSG_ALL_FIELDS_REQUIRED    = "All fields are required";
export const MSG_OTP_SENT              = "OTP sent";
export const MSG_OTP_RESENT            = "OTP resent successfully";
export const MSG_OTP_VERIFIED          = "OTP verified successfully";
export const MSG_VERIFIED              = "Verified";
export const MSG_UNAUTHORIZED          = "Unauthorized";
export const MSG_USER_NOT_FOUND        = "User not found";

// ─── Auth (User) ──────────────────────────────────────────────────────────────
export const MSG_USER_LOGIN_SUCCESS    = "Logged in successfully";
export const MSG_USER_LOGOUT           = "logged out";
export const MSG_TOKEN_REFRESHED       = "refreshed";
export const MSG_FORGOT_PASSWORD_SENT  = "If an account exists, a password reset OTP was sent";
export const MSG_PASSWORD_RESET_SUCCESS = "Password reset successfully. You can now log in.";

// ─── Admin ────────────────────────────────────────────────────────────────────
export const MSG_ADMIN_LOGIN_SUCCESS      = "Login successful";
export const MSG_ADMIN_LOGOUT             = "Logged out successfully";
export const MSG_ADMIN_OTP_SENT           = "OTP sent to email";
export const MSG_ADMIN_PASSWORD_RESET     = "Password reset successful";
export const MSG_ADMIN_REJECTION_REQUIRED = "Rejection reason is required";
export const MSG_MERCHANT_APPROVED        = "Merchant approved successfully";
export const MSG_MERCHANT_REJECTED        = "Merchant rejected successfully";
export const MSG_USER_BLOCKED             = "User blocked successfully";
export const MSG_USER_UNBLOCKED           = "User unblocked successfully";
export const MSG_MERCHANT_BLOCKED         = "Merchant blocked successfully";
export const MSG_MERCHANT_UNBLOCKED       = "Merchant unblocked successfully";
export const MSG_ADMIN_OTP_RESENT         = "OTP resent successfully";

// ─── Merchant ─────────────────────────────────────────────────────────────────
export const MSG_MERCHANT_REGISTER_SUCCESS = "Registration successful. Please verify your OTP.";
export const MSG_MERCHANT_LOGIN_SUCCESS    = "Login successful";
export const MSG_MERCHANT_LOGOUT           = "Logged out successfully";
export const MSG_MERCHANT_FORGOT_PW_SENT   = "If an account exists, a password reset OTP was sent";
export const MSG_MERCHANT_PASSWORD_RESET   = "Password reset successfully. You can now log in.";

// ─── Products & Shopping ───────────────────────────────────────────────────────
export const MSG_PRODUCT_NOT_FOUND         = "Product not found";
export const MSG_PRODUCT_NOT_OWNED         = "Access denied. You do not own this product.";
export const MSG_PRODUCT_SAVE_FAILED       = "Failed to save product";
export const MSG_PRODUCT_CREATE_FAILED     = "Failed to create product";
export const MSG_PRODUCT_UPDATE_FAILED     = "Failed to update product";
export const MSG_PRODUCT_CORE_REQUIRED     = "All core fields are required";
export const MSG_PRODUCT_ID_REQUIRED       = "Product ID is required";
export const MSG_PRODUCT_ID_STRING         = "Product ID must be a string";
export const MSG_PRODUCT_BLOCKED_REQUIRED  = "isBlocked field is required";

export const MSG_CATEGORY_REQUIRED         = "Category name is required";
export const MSG_CATEGORY_EXISTS           = "Category already exists";
export const MSG_CATEGORY_CREATE_FAILED     = "Failed to create category";
export const MSG_CAT_SUB_REQUIRED          = "Category name and subcategory name are required";
export const MSG_CATEGORY_NOT_FOUND        = "Category not found";
export const MSG_SUBCAT_ADD_FAILED         = "Failed to add subcategory";

export const MSG_CART_INIT_FAILED          = "Failed to initialize cart";
export const MSG_CART_NOT_FOUND            = "Cart not found";
export const MSG_CART_ITEM_ACCESS_FAILED   = "Cart item access failed";
export const MSG_CART_ITEM_NOT_FOUND       = "Item not found in cart";
export const MSG_PRODUCT_UNAVAILABLE       = "Product not found or unavailable";
export const MSG_QTY_MINIMUM               = "Quantity must be at least 1";
export const MSG_PRODUCT_QTY_REQUIRED      = "Product ID and quantity are required";

export const MSG_WISHLIST_REQ_FIELDS       = "User ID and Product ID are required";
export const MSG_WISHLIST_ADD_FAILED       = "Failed to add to wishlist";

export const MSG_INSUFFICIENT_STOCK        = "Insufficient stock. Only {stock} items left.";
export const MSG_STOCK_LIMIT_EXCEEDED      = "Insufficient stock. Cannot add more items. Max available is {stock}";
