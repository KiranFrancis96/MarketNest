import React from "react";
import { AdminLoginForm } from "@/features/adminAuth/ui/AdminLoginForm";
import { ForgotPasswordForm } from "@/features/adminAuth/ui/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/adminAuth/ui/ResetPasswordForm";
import { useAdminAuth } from "@/features/adminAuth/model/useAdminAuth";

const AdminLoginPage: React.FC = () => {
  const { step } = useAdminAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {step === "login" && <AdminLoginForm />}
      {step === "forgot" && <ForgotPasswordForm />}
      {step === "reset" && <ResetPasswordForm />}
    </div>
  );
};

export default AdminLoginPage;
