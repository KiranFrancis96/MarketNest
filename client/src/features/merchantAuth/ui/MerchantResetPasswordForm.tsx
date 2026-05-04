import { useState } from "react";
import { OtpTimer } from "@/shared/ui/OtpTimer";
import { merchantApi } from "@/entities/merchant/api/merchantApi";

interface Props {
  email: string;
  onSubmit: (e: React.FormEvent, otp: string, pass: string) => void;
  isLoading: boolean;
}

export const MerchantResetPasswordForm = ({ email, onSubmit, isLoading }: Props) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const handleResend = async () => {
    await merchantApi.resendOtp(email);
  };

  return (
    <form onSubmit={(e) => onSubmit(e, otp, password)}>
      <div className="form-group">
        <label className="form-label">OTP Code</label>
        <input
          className="form-input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">New Password</label>
        <input
          type="password"
          className="form-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </button>

      <OtpTimer onResend={handleResend} />
    </form>
  );
};
