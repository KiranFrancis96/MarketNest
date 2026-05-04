import React, { useState } from "react";
import { useAdminAuth } from "../model/useAdminAuth";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const { forgotPassword, setStep } = useAdminAuth();
  const { isLoading, error } = useSelector((state: RootState) => state.admin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword(email);
  };

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Recover Access</h2>
        <p className="text-gray-500 mt-2">Enter your admin email to receive an OTP</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
        >
          {isLoading ? "Sending OTP..." : "Send Verification Code"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setStep("login")}
          className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};
