import React, { useState } from "react";
import { useAdminAuth } from "../model/useAdminAuth";
import { useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, ShieldAlert, Key, Check } from "lucide-react";
import type { RootState } from "@/app/store";
import { OtpTimer } from "@/shared/ui/OtpTimer";
import { adminApi } from "@/entities/admin/api/adminApi";

export const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", otp: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword, setStep } = useAdminAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.admin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.otp && formData.password) {
      resetPassword(formData);
    }
  };

  const handleResend = async () => {
    if (formData.email) {
      await adminApi.resendOtp(formData.email);
    }
  };

  return (
    <>
      <div className="admin-card-inner">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Set New Password</h2>
          <p className="admin-card-subtitle">Verify OTP and update your admin password</p>
        </div>

        {error && (
          <div className="admin-alert-banner" role="alert">
            <ShieldAlert size={20} className="admin-alert-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-field-label">Email</label>
            </div>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <Mail size={20} />
              </span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="admin-input-field"
                placeholder="admin@marketnest.com"
                required
              />
            </div>
          </div>

          {/* OTP */}
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-field-label">Verification Code (OTP)</label>
            </div>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <Key size={20} />
              </span>
              <input
                type="text"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                className="admin-input-field"
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>
          </div>

          {/* New Password */}
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-field-label">New Password</label>
            </div>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <Lock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="admin-input-field"
                placeholder="Enter new password"
                required
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-submit-btn"
            style={{ marginTop: "1.75rem", marginBottom: "1rem" }}
          >
            <span>{isLoading ? "Updating Password..." : "Update Password"}</span>
            {!isLoading && <Check size={18} strokeWidth={2.5} />}
          </button>

          <OtpTimer onResend={handleResend} />
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setStep("login")}
            className="admin-forgot-link"
          >
            Back to Login
          </button>
        </div>
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
