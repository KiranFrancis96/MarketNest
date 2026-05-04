import { useState } from "react";
import { OtpTimer } from "@/shared/ui/OtpTimer";
import { merchantApi } from "@/entities/merchant/api/merchantApi";

interface Props {
  email: string;
  onSubmit: (e: React.FormEvent, otp: string) => void;
  isLoading: boolean;
}

export const MerchantOtpForm = ({ email, onSubmit, isLoading }: Props) => {
  const [otp, setOtp] = useState("");

  const handleResend = async () => {
    await merchantApi.resendOtp(email);
  };

  return (
    <form onSubmit={(e) => onSubmit(e, otp)}>
      <div className="form-group">
        <label className="form-label">One-Time Password</label>
        <input
          className="form-input"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={{ textAlign: "center", letterSpacing: "0.25em", fontSize: "1.25rem" }}
        />
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Verifying..." : "Verify Account"}
      </button>

      <OtpTimer onResend={handleResend} />
    </form>
  );
};
