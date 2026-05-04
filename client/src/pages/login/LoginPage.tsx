import { useLogin } from "@/features/auth/model/useLogin";
import { Link } from "react-router-dom";
import { RoleSwitcher } from "@/shared/ui/RoleSwitcher";
import { LoginForm } from "@/features/auth/ui/LoginForm";

export const LoginPage = () => {
  const { error, setError, isLoading, login } = useLogin();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your MarketNest account</p>

        <RoleSwitcher activeRole="user" />

        {error && (
          <div className="error-message" role="alert">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <LoginForm 
          onSubmit={login} 
          isLoading={isLoading} 
          onClearError={() => setError("")} 
        />

        <div style={{ marginTop: "1rem", textAlign: "right" }}>
          <Link to="/forgot-password" style={{ fontSize: "0.875rem", color: "var(--primary)", fontWeight: "500", textDecoration: "none" }}>
            Forgot password?
          </Link>
        </div>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
