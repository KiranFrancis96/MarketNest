import { useState } from "react";
import { OtpTimer } from "@/shared/ui/OtpTimer";
import { userApi } from "@/entities/user/api/userApi";

type OtpFormProps = {
  email: string;
  onSubmit: (otp: string) => void;
  isLoading: boolean;
};

export const OtpForm = ({ email, onSubmit, isLoading }: OtpFormProps) => {
  const [otp, setOtp] = useState("");

  const handleResend = async () => {
    await userApi.resendOtp(email);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(otp);
      }}
    >
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
        {isLoading ? "Verifying..." : "Verify Email"}
      </button>

      <OtpTimer onResend={handleResend} />
    </form>
  );
};
