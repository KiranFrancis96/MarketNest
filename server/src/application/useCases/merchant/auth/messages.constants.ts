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

// ─── OTP / Email ──────────────────────────────────────────────────────────────
export const MSG_OTP_EMAIL_FAILED                 = "Could not send OTP email. Please try again.";
export const MSG_OTP_EMAIL_FAILED_RESET           = "Could not send OTP email. Please try again later.";

// ─── Logger ───────────────────────────────────────────────────────────────────
export const LOG_OTP_EMAIL_FAILED                 = "Failed to send OTP email to merchant";
export const LOG_OTP_EMAIL_FAILED_RESET           = "Failed to send OTP email for merchant password reset";
