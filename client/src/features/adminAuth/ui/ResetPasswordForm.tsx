import React, { useState } from "react";
import { useAdminAuth } from "../model/useAdminAuth";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { OtpTimer } from "@/shared/ui/OtpTimer";
import { adminApi } from "@/entities/admin/api/adminApi";

export const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", otp: "", password: "" });
  const { resetPassword, setStep } = useAdminAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.admin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPassword(formData);
  };

  const handleResend = async () => {
    if (formData.email) {
      await adminApi.resendOtp(formData.email);
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Set New Password</h2>
        <p className="text-gray-500 mt-2">Verify OTP and update your admin password</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Verification Code (OTP)</label>
          <input
            type="text"
            value={formData.otp}
            onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
        >
          {isLoading ? "Updating Password..." : "Update Password"}
        </button>

        <OtpTimer onResend={handleResend} />
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setStep("login")}
          className="text-gray-500 hover:text-gray-700 font-medium text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};
