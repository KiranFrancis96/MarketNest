import { useState } from "react";

type RegisterFormProps = {
  onSubmit: (data: { firstName: string; lastName: string; email: string; password: string }) => void;
  isLoading: boolean;
};

export const RegisterForm = ({ onSubmit, isLoading }: RegisterFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[a-zA-Z\s]*$/.test(firstName)) {
      newErrors.firstName = "First name should only contain letters";
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s]*$/.test(lastName)) {
      newErrors.lastName = "Last name should only contain letters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ firstName, lastName, email, password });
    }
  };

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            className={`form-input ${errors.firstName ? 'input-error' : ''}`}
            placeholder="e.g. John"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.firstName) setErrors(prev => {
                const next = { ...prev };
                delete next.firstName;
                return next;
              });
            }}
          />
          {errors.firstName && <span className="error-text">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            className={`form-input ${errors.lastName ? 'input-error' : ''}`}
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (errors.lastName) setErrors(prev => {
                const next = { ...prev };
                delete next.lastName;
                return next;
              });
            }}
          />
          {errors.lastName && <span className="error-text">{errors.lastName}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Email Address</label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          placeholder="john@example.com"
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
        <label className="form-label">Password</label>
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
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
};
