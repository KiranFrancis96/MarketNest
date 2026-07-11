import React, { useState } from "react";
import { useAdminAuth } from "../model/useAdminAuth";
import { useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, LogIn } from "lucide-react";
import type { RootState } from "@/app/store";

export const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, setStep } = useAdminAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.admin);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      login({ email, password, rememberMe });
    }
  };

  return (
    <>
      <div className="admin-card-inner">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Administrator Login</h2>
          <p className="admin-card-subtitle">Welcome back. Please enter your credentials.</p>
        </div>

        {error && (
          <div className="admin-alert-banner" role="alert">
            <ShieldAlert size={20} className="admin-alert-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Address */}
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-field-label">Email Address</label>
            </div>
            <div className={`admin-input-wrapper ${errors.email ? "error" : ""}`}>
              <span className="admin-input-icon">
                <Mail size={20} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }
                }}
                className="admin-input-field"
                placeholder="admin@marketnest.com"
              />
            </div>
            {errors.email && (
              <span className="admin-validation-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-field-label">Password</label>
              <button
                type="button"
                onClick={() => setStep("forgot")}
                className="admin-forgot-link"
              >
                Forgot Password?
              </button>
            </div>
            <div className={`admin-input-wrapper ${errors.password ? "error" : ""}`}>
              <span className="admin-input-icon">
                <Lock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.password;
                      return next;
                    });
                  }
                }}
                className="admin-input-field"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="admin-password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="admin-validation-error">{errors.password}</span>
            )}
          </div>

          {/* Remember this device checkbox */}
          <div className="admin-options-row">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="admin-custom-checkbox"></span>
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="admin-submit-btn"
          >
            <span>{isLoading ? "Authenticating..." : "Login to Dashboard"}</span>
            {!isLoading && <LogIn size={18} strokeWidth={2.5} />}
          </button>
        </form>
      </div>

      {/* Restricted Warning Footer Banner */}
      <div className="admin-restricted-banner">
        <ShieldAlert size={16} className="admin-restricted-banner-icon" />
        <span className="admin-restricted-banner-text">
          This portal is restricted to authorized administrators
        </span>
      </div>
    </>
  );
};
