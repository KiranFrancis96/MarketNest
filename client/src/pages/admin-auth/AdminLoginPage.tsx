import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { AdminLoginForm } from "@/features/adminAuth/ui/AdminLoginForm";
import { ForgotPasswordForm } from "@/features/adminAuth/ui/ForgotPasswordForm";
import { ResetPasswordForm } from "@/features/adminAuth/ui/ResetPasswordForm";
import { useAdminAuth } from "@/features/adminAuth/model/useAdminAuth";
import { LayoutGrid, HelpCircle } from "lucide-react";
import type { RootState } from "@/app/store";

const AdminLoginPage: React.FC = () => {
  const { admin } = useSelector((state: RootState) => state.admin);
  const { step } = useAdminAuth();

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="admin-auth-page">
      {/* Top Header */}
      <header className="admin-auth-header">
        <a href="/admin/login" className="admin-header-logo">
          <div className="admin-header-logo-icon">
            <LayoutGrid size={28} strokeWidth={2.5} />
          </div>
          <div className="admin-header-logo-text">
            MarketNest<span>Admin</span>
          </div>
        </a>
        <a
          href="https://marketnest.com/support"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-header-support"
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </a>
      </header>

      {/* Main Content Area */}
      <main className="admin-auth-content">
        <div className="admin-card-outer">
          {step === "login" && <AdminLoginForm />}
          {step === "forgot" && <ForgotPasswordForm />}
          {step === "reset" && <ResetPasswordForm />}
        </div>
      </main>

      {/* Footer */}
      <footer className="admin-auth-footer">
        <span className="admin-footer-link">Privacy Policy</span>
        <span className="admin-footer-dot">•</span>
        <span className="admin-footer-link">Terms of Service</span>
        <span className="admin-footer-dot">•</span>
        <span className="admin-footer-link">Security Audit</span>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
