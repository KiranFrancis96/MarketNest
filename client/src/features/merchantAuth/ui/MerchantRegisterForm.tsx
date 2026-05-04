import { useState } from "react";

interface Props {
  onSubmit: (e: React.FormEvent, data: any) => void;
  isLoading: boolean;
}

export const MerchantRegisterForm = ({ onSubmit, isLoading }: Props) => {
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    gstNumber: "",
    houseName: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName) newErrors.businessName = "Business name is required";
    
    if (!formData.ownerName) {
      newErrors.ownerName = "Owner name is required";
    } else if (!/^[a-zA-Z\s]*$/.test(formData.ownerName)) {
      newErrors.ownerName = "Owner name should only contain letters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.gstNumber) {
      newErrors.gstNumber = "GST number is required";
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
    }

    if (!formData.houseName) newErrors.houseName = "House name is required";
    if (!formData.street) newErrors.street = "Street address is required";
    if (!formData.locality) newErrors.locality = "Locality is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";

    if (!formData.zipCode) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^[0-9]{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = "ZIP code must be 6 digits";
    }

    if (!formData.country) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(e, formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Business Name</label>
          <input 
            name="businessName" 
            className={`form-input ${errors.businessName ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.businessName && <span className="error-text">{errors.businessName}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Owner Name</label>
          <input 
            name="ownerName" 
            className={`form-input ${errors.ownerName ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.ownerName && <span className="error-text">{errors.ownerName}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            name="email" 
            className={`form-input ${errors.email ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            name="password" 
            className={`form-input ${errors.password ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input 
            type="tel" 
            name="phone" 
            className={`form-input ${errors.phone ? 'input-error' : ''}`} 
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              handleChange(e);
            }} 
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">GST / Registration No.</label>
          <input 
            name="gstNumber" 
            className={`form-input ${errors.gstNumber ? 'input-error' : ''}`} 
            placeholder="22AAAAA0000A1Z5"
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              handleChange(e);
            }} 
          />
          {errors.gstNumber && <span className="error-text">{errors.gstNumber}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">House Name / Building Number</label>
        <input 
          name="houseName" 
          className={`form-input ${errors.houseName ? 'input-error' : ''}`} 
          placeholder="Apt 4B / Sunset Villa" 
          onChange={handleChange} 
        />
        {errors.houseName && <span className="error-text">{errors.houseName}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Street Address</label>
        <input 
          name="street" 
          className={`form-input ${errors.street ? 'input-error' : ''}`} 
          placeholder="123 Main St" 
          onChange={handleChange} 
        />
        {errors.street && <span className="error-text">{errors.street}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Area / Locality</label>
          <input 
            name="locality" 
            className={`form-input ${errors.locality ? 'input-error' : ''}`} 
            placeholder="Downtown / Sector 4" 
            onChange={handleChange} 
          />
          {errors.locality && <span className="error-text">{errors.locality}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">City</label>
          <input 
            name="city" 
            className={`form-input ${errors.city ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.city && <span className="error-text">{errors.city}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">State / Province</label>
          <input 
            name="state" 
            className={`form-input ${errors.state ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.state && <span className="error-text">{errors.state}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">ZIP / Postal Code</label>
          <input 
            name="zipCode" 
            className={`form-input ${errors.zipCode ? 'input-error' : ''}`} 
            onChange={(e) => {
              e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              handleChange(e);
            }} 
          />
          {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Country</label>
          <input 
            name="country" 
            className={`form-input ${errors.country ? 'input-error' : ''}`} 
            onChange={handleChange} 
          />
          {errors.country && <span className="error-text">{errors.country}</span>}
        </div>
      </div>

      <button className="btn-primary" type="submit" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Merchant Account"}
      </button>
    </form>
  );
};
