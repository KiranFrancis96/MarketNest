import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { AdminLoginForm } from "@/features/adminAuth/ui/AdminLoginForm";
import { ForgotPasswordForm } from "@/features/adminAuth/ui/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/adminAuth/ui/ResetPasswordForm";
import { useAdminAuth } from "@/features/adminAuth/model/useAdminAuth";
import type { RootState } from "@/app/store";

const AdminLoginPage: React.FC = () => {
  const { admin } = useSelector((state: RootState) => state.admin);
  const { step } = useAdminAuth();

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {step === "login" && <AdminLoginForm />}
      {step === "forgot" && <ForgotPasswordForm />}
      {step === "reset" && <ResetPasswordForm />}
    </div>
  );
};

export default AdminLoginPage;
