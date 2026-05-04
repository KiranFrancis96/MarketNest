import { useState } from "react";

interface Props {
  onSubmit: (e: React.FormEvent, pass: string) => void;
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  onForgotClick: () => void;
}

export const MerchantLoginForm = ({ onSubmit, email, setEmail, isLoading, onForgotClick }: Props) => {
  const [password, setPassword] = useState("");
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
      onSubmit(e, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          placeholder="merchant@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors(prev => {
              const next = { ...prev };
              delete next.email;
              return next;
            });
          }}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
          <button type="button" onClick={onForgotClick} style={{ background: "none", border: "none", fontSize: "0.875rem", color: "var(--primary)", fontWeight: "500", cursor: "pointer" }}>
            Forgot password?
          </button>
        </div>
        <input
          type="password"
          className={`form-input ${errors.password ? 'input-error' : ''}`}
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors(prev => {
              const next = { ...prev };
              delete next.password;
              return next;
            });
          }}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in to Dashboard"}
      </button>
    </form>
  );
};
