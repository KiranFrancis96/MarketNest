import React, { useState } from "react";
import { useAdminAuth } from "../model/useAdminAuth";
import { useSelector } from "react-redux";
import { Mail, ShieldAlert, ArrowRight } from "lucide-react";
import type { RootState } from "@/app/store";

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword, setStep } = useAdminAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.admin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      forgotPassword(email);
    }
  };

  return (
    <>
      <div className="admin-card-inner">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recover Access</h2>
          <p className="admin-card-subtitle">Enter your admin email to receive an OTP</p>
        </div>

        {error && (
          <div className="admin-alert-banner" role="alert">
            <ShieldAlert size={20} className="admin-alert-banner-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="admin-form-group">
            <div className="admin-label-row">
              <label className="admin-field-label">Admin Email</label>
            </div>
            <div className="admin-input-wrapper">
              <span className="admin-input-icon">
                <Mail size={20} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-input-field"
                placeholder="admin@marketnest.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-submit-btn"
            style={{ marginTop: "2rem" }}
          >
            <span>{isLoading ? "Sending OTP..." : "Send Verification Code"}</span>
            {!isLoading && <ArrowRight size={18} strokeWidth={2.5} />}
          </button>
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
