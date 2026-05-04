import { useState } from "react";

interface LoginFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
  onClearError?: () => void;
}

export const LoginForm = ({ onSubmit, isLoading, onClearError }: LoginFormProps) => {
  const [email, setEmail] = useState("");
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
      onSubmit({ email, password });
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (onClearError) onClearError();
    if (errors.email) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.email;
        return next;
      });
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (onClearError) onClearError();
    if (errors.password) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          placeholder="john@example.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className={`form-input ${errors.password ? 'input-error' : ''}`}
          placeholder="••••••••"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};
