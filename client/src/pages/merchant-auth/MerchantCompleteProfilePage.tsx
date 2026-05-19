import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { setMerchant } from "@/entities/merchant/model/merchantSlice";
import { useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

export const MerchantCompleteProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const merchant = useSelector((state: any) => state.merchant.merchant);
  const isMerchantAuthenticated = useSelector((state: any) => state.merchant.isAuthenticated);

  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // If not authenticated, redirect to merchant auth
  if (!isMerchantAuthenticated || !merchant) {
    return <Navigate to="/merchant/auth" replace />;
  }

  // If already complete, go to dashboard
  if (merchant.isProfileComplete && !merchant.gstNumber?.startsWith("PENDING-")) {
    return <Navigate to="/merchant/dashboard" replace />;
  }

  const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? "Profile completion failed. Please try again.";
    }
    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString().trim();
    });

    // Validation
    const newErrors: Record<string, string> = {};
    if (!data.businessName) newErrors.businessName = "Business name is required";
    
    if (!data.ownerName) {
      newErrors.ownerName = "Owner name is required";
    } else if (!/^[a-zA-Z\s]*$/.test(data.ownerName)) {
      newErrors.ownerName = "Owner name should only contain letters";
    }

    if (!data.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(data.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!data.gstNumber) {
      newErrors.gstNumber = "GST number is required";
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber)) {
      newErrors.gstNumber = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
    }

    if (!data.houseName) newErrors.houseName = "House name/number is required";
    if (!data.street) newErrors.street = "Street address is required";
    if (!data.locality) newErrors.locality = "Locality is required";
    if (!data.city) newErrors.city = "City is required";
    if (!data.state) newErrors.state = "State is required";

    if (!data.zipCode) {
      newErrors.zipCode = "ZIP/postal code is required";
    } else if (!/^[0-9]{6}$/.test(data.zipCode)) {
      newErrors.zipCode = "ZIP code must be 6 digits";
    }

    if (!data.country) newErrors.country = "Country is required";

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await merchantApi.completeProfile(data);
      dispatch(setMerchant(res.data.merchant));
      navigate("/merchant/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ padding: "3rem 1rem" }}>
      <div className="auth-card" style={{ maxWidth: "650px", width: "100%" }}>
        <h1 className="auth-title">Complete Your Merchant Profile</h1>
        <p className="auth-subtitle" style={{ marginBottom: "2rem" }}>
          Please fill in the remaining details to submit your merchant application for review.
        </p>

        {error && (
          <div className="error-message" role="alert" style={{ marginBottom: "1.5rem" }}>
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                name="businessName"
                placeholder="My Store Ltd"
                className={`form-input ${formErrors.businessName ? "input-error" : ""}`}
              />
              {formErrors.businessName && <span className="error-text">{formErrors.businessName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input
                name="ownerName"
                defaultValue={merchant.ownerName || ""}
                placeholder="John Doe"
                className={`form-input ${formErrors.ownerName ? "input-error" : ""}`}
              />
              {formErrors.ownerName && <span className="error-text">{formErrors.ownerName}</span>}
            </div>
          </div>

          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="10 digit number"
                className={`form-input ${formErrors.phone ? "input-error" : ""}`}
              />
              {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">GST / Registration No.</label>
              <input
                name="gstNumber"
                placeholder="22AAAAA0000A1Z5"
                className={`form-input ${formErrors.gstNumber ? "input-error" : ""}`}
              />
              {formErrors.gstNumber && <span className="error-text">{formErrors.gstNumber}</span>}
            </div>
          </div>

          <h3 style={{ margin: "2rem 0 1rem", fontSize: "1.1rem", fontWeight: "700", color: "var(--text-main)", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.5rem" }}>
            Business Address
          </h3>

          <div className="form-group">
            <label className="form-label">House / Building Name or Number</label>
            <input
              name="houseName"
              placeholder="Suite 400 / Building B"
              className={`form-input ${formErrors.houseName ? "input-error" : ""}`}
            />
            {formErrors.houseName && <span className="error-text">{formErrors.houseName}</span>}
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label className="form-label">Street Address</label>
            <input
              name="street"
              placeholder="123 Commerce Way"
              className={`form-input ${formErrors.street ? "input-error" : ""}`}
            />
            {formErrors.street && <span className="error-text">{formErrors.street}</span>}
          </div>

          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Area / Locality</label>
              <input
                name="locality"
                placeholder="Industrial Park"
                className={`form-input ${formErrors.locality ? "input-error" : ""}`}
              />
              {formErrors.locality && <span className="error-text">{formErrors.locality}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input
                name="city"
                placeholder="Mumbai"
                className={`form-input ${formErrors.city ? "input-error" : ""}`}
              />
              {formErrors.city && <span className="error-text">{formErrors.city}</span>}
            </div>
          </div>

          <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                name="state"
                placeholder="Maharashtra"
                className={`form-input ${formErrors.state ? "input-error" : ""}`}
              />
              {formErrors.state && <span className="error-text">{formErrors.state}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">ZIP / Postal Code</label>
              <input
                name="zipCode"
                placeholder="6 digits"
                className={`form-input ${formErrors.zipCode ? "input-error" : ""}`}
              />
              {formErrors.zipCode && <span className="error-text">{formErrors.zipCode}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                name="country"
                placeholder="India"
                className={`form-input ${formErrors.country ? "input-error" : ""}`}
              />
              {formErrors.country && <span className="error-text">{formErrors.country}</span>}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ marginTop: "2.5rem" }}
          >
            {isLoading ? "Saving Profile..." : "Complete Setup & Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};
