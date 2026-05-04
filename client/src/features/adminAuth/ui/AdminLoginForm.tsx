import React, { useState } from "react";
import { useAdminAuth } from "../model/useAdminAuth";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

export const AdminLoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      login({ email, password });
    }
  };

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h2>
        <p className="text-gray-500 mt-2">Secure access for MarketNest administrators</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-pulse">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => {
                const next = { ...prev };
                delete next.email;
                return next;
              });
            }}
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200`}
            placeholder="admin@marketnest.com"
          />
          {errors.email && <span className="text-xs text-red-600 mt-1 block font-medium">{errors.email}</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => {
                const next = { ...prev };
                delete next.password;
                return next;
              });
            }}
            className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200`}
            placeholder="••••••••"
          />
          {errors.password && <span className="text-xs text-red-600 mt-1 block font-medium">{errors.password}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Authenticating..." : "Sign In to Dashboard"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => setStep("forgot")}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
        >
          Trouble signing in? Reset password
        </button>
      </div>
    </div>
  );
};
