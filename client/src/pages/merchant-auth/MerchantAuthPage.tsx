import { useMerchantAuth } from "@/features/merchantAuth/model/useMerchantAuth";
import { MerchantLoginForm } from "@/features/merchantAuth/ui/MerchantLoginForm";
import { MerchantRegisterForm } from "@/features/merchantAuth/ui/MerchantRegisterForm";
import { MerchantOtpForm } from "@/features/merchantAuth/ui/MerchantOtpForm";
import { MerchantForgotPasswordForm } from "@/features/merchantAuth/ui/MerchantForgotPasswordForm";
import { MerchantResetPasswordForm } from "@/features/merchantAuth/ui/MerchantResetPasswordForm";
import { RoleSwitcher } from "@/shared/ui/RoleSwitcher";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useEffect } from "react";

export const MerchantAuthPage = () => {
  const isMerchantAuthenticated = useSelector((state: any) => state.merchant.isAuthenticated);
  const isUserAuthenticated     = useSelector((state: any) => state.user.isAuthenticated);
  const {
    step,
    setStep,
    email,
    setEmail,
    error,
    successMessage,
    isLoading,
    login,
    register,
    verifyOtp,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
  } = useMerchantAuth();

  useEffect(() => {
    if (step === "login") {
      const initializeGoogle = () => {
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: (response: any) => {
              if (response.credential) {
                loginWithGoogle(response.credential);
              }
            },
          });
          (window as any).google.accounts.id.renderButton(
            document.getElementById("google-merchant-signin-btn"),
            { theme: "outline", size: "large", width: 384, text: "signin_with" }
          );
        }
      };

      if (!(window as any).google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.body.appendChild(script);
      } else {
        initializeGoogle();
      }
    }
  }, [step, loginWithGoogle]);

  if (isMerchantAuthenticated) return <Navigate to="/merchant/dashboard" replace />;
  if (isUserAuthenticated)     return <Navigate to="/"                   replace />;

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: step === "register" ? "600px" : "450px" }}>
        <h1 className="auth-title">
          {step === "login" && "Merchant Portal"}
          {step === "register" && "Become a Merchant"}
          {step === "otp" && "Verify Email"}
          {step === "forgotPassword" && "Reset Password"}
          {step === "resetPassword" && "New Password"}
        </h1>
        <p className="auth-subtitle">
          {step === "login" && "Sign in to manage your store"}
          {step === "register" && "Join MarketNest to sell your products"}
          {step === "otp" && "Enter the OTP sent to your email"}
          {step === "forgotPassword" && "Enter your email to receive an OTP"}
          {step === "resetPassword" && "Enter the OTP and your new password"}
        </p>

        <RoleSwitcher activeRole="merchant" />

        {error && (
          <div className="error-message" role="alert">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {successMessage && (
           <div className="error-message" style={{ backgroundColor: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }} role="alert">
            {successMessage}
          </div>
        )}

        {step === "login" && (
          <>
            <MerchantLoginForm 
              onSubmit={login} 
              email={email} 
              setEmail={setEmail} 
              isLoading={isLoading} 
              onForgotClick={() => setStep("forgotPassword")} 
            />
            <div style={{ margin: "1.5rem 0 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#cbd5e1" }}></div>
              <span style={{ padding: "0 0.75rem", fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>or</span>
              <div style={{ flex: 1, height: "1px", backgroundColor: "#cbd5e1" }}></div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <div id="google-merchant-signin-btn" style={{ minHeight: "44px" }}></div>
            </div>
          </>
        )}
        
        {step === "register" && (
          <MerchantRegisterForm onSubmit={register} isLoading={isLoading} />
        )}
        
        {step === "otp" && (
          <MerchantOtpForm email={email} onSubmit={verifyOtp} isLoading={isLoading} />
        )}

        {step === "forgotPassword" && (
          <MerchantForgotPasswordForm 
            onSubmit={forgotPassword} 
            isLoading={isLoading} 
            onBack={() => setStep("login")} 
          />
        )}

        {step === "resetPassword" && (
          <MerchantResetPasswordForm 
            email={email}
            onSubmit={resetPassword} 
            isLoading={isLoading} 
          />
        )}

        {step === "login" && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Don't have a merchant account?{" "}
            <button onClick={() => setStep("register")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>
              Apply Now
            </button>
          </p>
        )}

        {step === "register" && (
          <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Already a merchant?{" "}
            <button onClick={() => setStep("login")} style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
