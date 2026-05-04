import { Routes, Route } from "react-router-dom";
import { RegisterPage } from "@/pages/register/RegisterPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { ForgotPasswordPage } from "@/pages/login/ForgotPasswordPage";
import { HomePage } from "@/pages/home/HomePage";
import { ProtectedRoute } from "./ProtectedRoute";
import { MerchantAuthPage } from "@/pages/merchant-auth/MerchantAuthPage";
import { MerchantDashboardPage } from "@/pages/merchant-dashboard/MerchantDashboardPage";
import AdminLoginPage from "@/pages/admin-auth/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin-dashboard/AdminDashboardPage";
import { AdminProtectedRoute } from "./AdminProtectedRoute";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Merchant Routes */}
      <Route path="/merchant/auth" element={<MerchantAuthPage />} />
      <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={
        <AdminProtectedRoute>
          <AdminDashboardPage />
        </AdminProtectedRoute>
      } />
    </Routes>
  );
};