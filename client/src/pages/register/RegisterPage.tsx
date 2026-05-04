import { Link } from "react-router-dom";
import { useRegister } from "@/features/auth/model/useRegister";
import { RegisterForm } from "@/features/auth/ui/RegisterForm";
import { OtpForm } from "@/features/auth/ui/OtpForm";
import { RoleSwitcher } from "@/shared/ui/RoleSwitcher";

export const RegisterPage = () => {
  const { step, register, verifyOtp, error, isLoading, email } = useRegister();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {step === "form" ? "Create an Account" : "Verify Your Email"}
        </h1>
        <p className="auth-subtitle">
          {step === "form" ? "Join MarketNest today" : "Enter the OTP sent to your email"}
        </p>
        
        <RoleSwitcher activeRole="user" />
        
        {error && (
          <div className="error-message" role="alert">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {step === "form" && <RegisterForm onSubmit={register} isLoading={isLoading} />}
        {step === "otp" && <OtpForm email={email} onSubmit={verifyOtp} isLoading={isLoading} />}
        
        {step === "form" && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};
