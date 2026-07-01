import { useLogin } from "@/features/auth/model/useLogin";
import { Link } from "react-router-dom";
import { RoleSwitcher } from "@/shared/ui/RoleSwitcher";
import { LoginForm } from "@/features/auth/ui/LoginForm";
import { useEffect } from "react";

interface GoogleWindow {
  google?: {
    accounts: {
      id: {
        initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
        renderButton: (element: HTMLElement | null, options: Record<string, unknown>) => void;
      };
    };
  };
}

export const LoginPage = () => {
  const { error, setError, isLoading, login, loginWithGoogle } = useLogin();

  useEffect(() => {
    const initializeGoogle = () => {
      const gWindow = window as unknown as GoogleWindow;
      if (gWindow.google) {
        gWindow.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              loginWithGoogle(response.credential);
            }
          },
        });
        gWindow.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 384, text: "signin_with" }
        );
      }
    };

    const gWindow = window as unknown as GoogleWindow;
    if (!gWindow.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [loginWithGoogle]);

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

        <div style={{ margin: "1.5rem 0 1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#cbd5e1" }}></div>
          <span style={{ padding: "0 0.75rem", fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>or</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#cbd5e1" }}></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <div id="google-signin-btn" style={{ minHeight: "44px" }}></div>
        </div>

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
