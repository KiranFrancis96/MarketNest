import { useForgotPassword } from "@/features/auth/model/useForgotPassword";
import { Link } from "react-router-dom";
import { RoleSwitcher } from "@/shared/ui/RoleSwitcher";
import { OtpTimer } from "@/shared/ui/OtpTimer";
import { userApi } from "@/entities/user/api/userApi";

export const ForgotPasswordPage = () => {
  const {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    password,
    setPassword,
    error,
    successMessage,
    isLoading,
    requestReset,
    submitReset,
  } = useForgotPassword();

  const handleResend = async () => {
    await userApi.resendOtp(email);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {step === "email" ? "Reset Password" : "Create New Password"}
        </h1>
        <p className="auth-subtitle">
          {step === "email" 
            ? "Enter your email address to receive a password reset OTP." 
            : "Enter the OTP sent to your email and your new password."}
        </p>

        <RoleSwitcher activeRole="user" />

        {error && (
          <div className="error-message" role="alert">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {successMessage && step === "reset" && (
          <div className="error-message" style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }} role="alert">
             <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={requestReset}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={submitReset}>
            <div className="form-group">
              <label className="form-label">One-Time Password</label>
              <input
                className="form-input"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.25rem" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <OtpTimer onResend={handleResend} />
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Remember your password?{" "}
          <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
