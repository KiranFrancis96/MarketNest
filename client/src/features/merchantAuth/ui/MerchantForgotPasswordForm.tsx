import { useState } from "react";

interface Props {
  onSubmit: (e: React.FormEvent, email: string) => void;
  isLoading: boolean;
  onBack: () => void;
}

export const MerchantForgotPasswordForm = ({ onSubmit, isLoading, onBack }: Props) => {
  const [email, setEmail] = useState("");

  return (
    <form onSubmit={(e) => onSubmit(e, email)}>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          className="form-input"
          placeholder="merchant@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send Reset OTP"}
      </button>

      <button 
        type="button" 
        onClick={onBack} 
        style={{ width: "100%", background: "none", border: "none", marginTop: "1rem", color: "var(--text-muted)", cursor: "pointer" }}
      >
        Back to Login
      </button>
    </form>
  );
};
