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

// ─── Extra Controller Message Constants ──────────────────────────────────────
export const MSG_PRODUCT_ADDED_SUCCESS         = "Product added successfully";
export const MSG_PRODUCT_UPDATED_SUCCESS       = "Product updated successfully";
export const MSG_PRODUCT_DELETED_SUCCESS       = "Product deleted successfully";
export const MSG_PRODUCT_BLOCKED_SUCCESS       = "Product blocked successfully";
export const MSG_PRODUCT_UNBLOCKED_SUCCESS     = "Product unblocked successfully";

export const MSG_CATEGORY_CREATED_SUCCESS       = "Category created successfully";
export const MSG_SUBCATEGORY_ADDED_SUCCESS      = "Subcategory added successfully";

export const MSG_PRODUCT_ADDED_CART            = "Product added to cart";
export const MSG_CART_UPDATED_SUCCESS          = "Cart updated successfully";
export const MSG_PRODUCT_REMOVED_CART          = "Product removed from cart";
export const MSG_CART_CLEARED_SUCCESS          = "Cart cleared successfully";

export const MSG_WISHLIST_ADDED_SUCCESS        = "Product added to wishlist";
export const MSG_WISHLIST_REMOVED_SUCCESS      = "Product removed from wishlist";

export const MSG_PAYMENT_VERIFIED_SUCCESS      = "Payment verified and order placed successfully";
export const MSG_ORDER_ITEM_STATUS_UPDATED_SUCCESS = "Order item status updated successfully";
export const MSG_ORDER_ITEM_CANCELLED_SUCCESS  = "Order item successfully cancelled";
export const MSG_ORDER_ITEM_RETURN_SUCCESS     = "Order item successfully requested for return";

export const MSG_SHIPPING_ADDRESS_REQUIRED     = "Shipping address is required";
export const MSG_PAYMENT_TOKENS_REQUIRED       = "All payment verification tokens are required";
export const MSG_ORDER_ID_REQUIRED             = "Order ID is required";
export const MSG_USER_ID_REQUIRED              = "User ID is required";
export const MSG_MERCHANT_ID_REQUIRED          = "Merchant ID is required";
export const MSG_NOTIFICATION_ID_REQUIRED      = "Notification ID is required";
export const MSG_ORDER_ITEM_REQ_FIELDS         = "orderId, productId and status are required";
export const MSG_ORDER_INVALID_STATUS          = "Invalid status. Must be one of: ";
export const MSG_ORDER_INVALID_STATUS_REQ      = "Invalid status request. Must be one of: ";

export const MSG_DEVICE_REGISTERED_SUCCESS     = "Device registered successfully";
export const MSG_NOTIFICATION_MARKED_READ      = "Notification marked as read";
export const MSG_NOTIFICATION_DELETED_SUCCESS  = "Notification deleted successfully";
export const MSG_PREFERENCES_UPDATED_SUCCESS   = "Preferences updated successfully";

export const MSG_CREDENTIAL_REQUIRED           = "Credential token is required";
export const MSG_MERCHANT_ONBOARDING_SUCCESS   = "Merchant onboarding completed successfully";
export const MSG_REAPPLICATION_SUBMITTED_SUCCESS = "Reapplication submitted successfully";

export const MSG_ADDRESS_ADDED_SUCCESS         = "Address added successfully";
export const MSG_ADDRESS_UPDATED_SUCCESS       = "Address updated successfully";
export const MSG_ADDRESS_DELETED_SUCCESS       = "Address deleted successfully";
export const MSG_ADDRESS_ID_REQUIRED           = "Address ID is required";

// ─── Extra Use Case Message Constants ───────────────────────────────────────
export const MSG_ADDRESS_NOT_FOUND             = "Address not found";
export const MSG_ADDRESS_UPDATE_FAILED          = "Failed to update address";
export const MSG_ADDRESS_DELETE_FAILED          = "Failed to delete address";
export const MSG_ADDRESS_ADD_FAILED             = "Failed to add address";

export const MSG_RAZORPAY_CONFIG_MISSING       = "Razorpay key configuration is missing on the server";
export const MSG_ORDER_NOT_FOUND               = "Order not found";
export const MSG_UNAUTHORIZED_ORDER_VERIFY     = "Unauthorized order verification";
export const MSG_PAYMENT_VERIFY_FAILED         = "Payment verification failed. Invalid signature.";
export const MSG_ORDER_STATUS_PAID_FAILED       = "Failed to update order status to paid";
export const MSG_ORDER_ACCESS_DENIED           = "You do not have permission to access this order";
export const MSG_ORDER_ITEM_NOT_FOUND          = "Item not found in this order";
export const MSG_INVALID_STATUS_CHANGE          = "Invalid status change request";
export const MSG_ITEM_STATUS_UPDATE_FAILED     = "Failed to update item status";
export const MSG_CANCEL_ALREADY                = "Cannot cancel an item that is already ";
export const MSG_RETURN_ALREADY                = "Cannot return an item that is ";
export const MSG_ORDER_ITEM_MANAGE_DENIED      = "You do not have permission to manage this item";
export const MSG_ORDER_STATUS_UPDATE_FAILED     = "Failed to update order status";
export const MSG_UNAUTHORIZED_ORDER_VIEW       = "Access denied. Unauthorized order view.";
export const MSG_CART_EMPTY                    = "Your cart is empty";
export const MSG_INVALID_ORDER_TOTAL           = "Invalid order total";
export const MSG_ORDER_CREATE_FAILED           = "Failed to create order record in database";

export const MSG_NOTIFICATION_NOT_FOUND        = "Notification not found";
export const MSG_NOTIFICATION_MODIFY_DENIED    = "You do not have permission to modify this notification";
export const MSG_NOTIFICATION_MARK_FAILED      = "Failed to mark notification as read";
export const MSG_NOTIFICATION_DELETE_DENIED    = "You do not have permission to delete this notification";

export const MSG_PRODUCT_STOCK_SHORT           = "Insufficient stock for product ";
export const MSG_RAZORPAY_ORDER_CREATE_FAILED   = "Razorpay order creation failed: ";



