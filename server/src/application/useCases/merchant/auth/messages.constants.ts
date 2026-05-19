// ─── Merchant ─────────────────────────────────────────────────────────────────
export const MSG_MERCHANT_NOT_FOUND               = "Merchant not found";
export const MSG_MERCHANT_EMAIL_ALREADY_EXISTS    = "A merchant with this email already exists and is verified";
export const MSG_MERCHANT_GST_ALREADY_EXISTS      = "A merchant with this GST number is already registered";
export const MSG_MERCHANT_INVALID_CREDENTIALS     = "Invalid email or password";
export const MSG_MERCHANT_NOT_VERIFIED            = "Please verify your email before logging in";
export const MSG_MERCHANT_BLOCKED                 = "Your merchant account has been blocked. Please contact admin.";
export const MSG_MERCHANT_ALREADY_VERIFIED        = "Merchant already verified";
export const MSG_MERCHANT_INVALID_OTP             = "Invalid or expired OTP";
export const MSG_MERCHANT_ONLY_REJECTED_CAN_REAPPLY = "Only rejected merchants can reapply";
export const MSG_MERCHANT_CREATE_FAILED           = "Failed to create merchant account";
export const MSG_MERCHANT_ACCOUNT_BLOCKED         = "Merchant account is blocked. Please contact support.";
export const MSG_MERCHANT_VERIFICATION_UPDATE_FAILED = "Failed to update merchant verification status";
export const MSG_MERCHANT_PASSWORD_REQUIRED       = "Password is required";
export const MSG_MERCHANT_REAPPLY_FAILED          = "Failed to update merchant reapplication";
export const MSG_MERCHANT_FETCH_FAILED_AFTER_VERIFY = "Failed to fetch updated merchant after OTP verification";

// ─── Profile Onboarding ────────────────────────────────────────────────────────
export const MSG_MERCHANT_ONBOARDING_FIELDS_REQUIRED = "All onboarding fields are required";
export const MSG_MERCHANT_OWNER_NAME_INVALID         = "Owner name should only contain letters";
export const MSG_MERCHANT_PHONE_INVALID              = "Phone number must be 10 digits";
export const MSG_MERCHANT_GST_INVALID                = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
export const MSG_MERCHANT_ZIP_INVALID                = "ZIP code must be 6 digits";
export const MSG_MERCHANT_GST_ALREADY_REGISTERED     = "GST number is already registered by another store";
export const MSG_MERCHANT_PROFILE_UPDATE_FAILED       = "Failed to update merchant profile";

// ─── OTP / Email ──────────────────────────────────────────────────────────────
export const MSG_OTP_EMAIL_FAILED                 = "Could not send OTP email. Please try again.";
export const MSG_OTP_EMAIL_FAILED_RESET           = "Could not send OTP email. Please try again later.";

// ─── Logger ───────────────────────────────────────────────────────────────────
export const LOG_OTP_EMAIL_FAILED                 = "Failed to send OTP email to merchant";
export const LOG_OTP_EMAIL_FAILED_RESET           = "Failed to send OTP email for merchant password reset";
