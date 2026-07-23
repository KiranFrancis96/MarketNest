import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { Travel } from "@/entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface TravelFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: Travel;
}

export const TravelForm: React.FC<TravelFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [travelFrequency, setTravelFrequency] = useState(
    initialValues?.travelFrequency || ""
  );
  const [preferredDestination, setPreferredDestination] = useState(
    initialValues?.preferredDestination || ""
  );
  const [accommodationStyle, setAccommodationStyle] = useState(
    initialValues?.accommodationStyle || ""
  );
  const [passportStatus, setPassportStatus] = useState<boolean | undefined>(
    initialValues?.passportStatus
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        travel: {
          travelFrequency: travelFrequency || undefined,
          preferredDestination: preferredDestination || undefined,
          accommodationStyle: accommodationStyle || undefined,
          passportStatus,
        },
      };

      await onSubmit(payload);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || MSG_FAILED_SUBMIT_FORM);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formContainerStyles} noValidate>
      {errorMsg && (
        <div style={errorContainerStyles}>
          <ShieldAlert size={18} style={{ marginRight: "0.5rem", flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={gridStyles}>
        {/* Travel Frequency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Travel Frequency
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={travelFrequency}
            onChange={(e) => setTravelFrequency(e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Frequently (Monthly)">Frequently (Monthly)</option>
            <option value="Occasionally (A few times a year)">Occasionally (A few times a year)</option>
            <option value="Rarely (Once a year)">Rarely (Once a year)</option>
            <option value="Never">Never</option>
          </select>
        </div>

        {/* Destination Preference */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Preferred Destination Style
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={preferredDestination}
            onChange={(e) => setPreferredDestination(e.target.value)}
          >
            <option value="">Select Style</option>
            <option value="Beach & Coastal">Beach & Coastal</option>
            <option value="Mountains & Nature">Mountains & Nature</option>
            <option value="Urban & Historical Cities">Urban & Historical Cities</option>
            <option value="Cultural & Heritage Sites">Cultural & Heritage Sites</option>
          </select>
        </div>

        {/* Accommodation Style */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Accommodation Preference
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={accommodationStyle}
            onChange={(e) => setAccommodationStyle(e.target.value)}
          >
            <option value="">Select Preference</option>
            <option value="Luxury Hotels & Resorts">Luxury Hotels & Resorts</option>
            <option value="Boutique / Airbnb">Boutique / Airbnb</option>
            <option value="Budget / Hostels">Budget / Hostels</option>
            <option value="Camping / Homestays">Camping / Homestays</option>
          </select>
        </div>

        {/* Passport Status */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Active International Passport
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={passportStatus === undefined ? "" : passportStatus ? "yes" : "no"}
            onChange={(e) =>
              setPassportStatus(
                e.target.value === "" ? undefined : e.target.value === "yes"
              )
            }
          >
            <option value="">Select Status</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div style={actionsContainerStyles}>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={cancelBtnStyles}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
          style={submitBtnStyles}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

const formContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const gridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1rem",
};

const inputOverrideStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
};

const errorContainerStyles: React.CSSProperties = {
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fee2e2",
  color: "#dc2626",
  fontSize: "0.875rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

const actionsContainerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
  marginTop: "1rem",
  borderTop: "1px solid #e2e8f0",
  paddingTop: "1.25rem",
};

const cancelBtnStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  backgroundColor: "transparent",
  color: "#475569",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};

const submitBtnStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "#4f46e5",
  color: "white",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
};
