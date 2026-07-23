import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { PrivacySettings } from "../../entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface PrivacyFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: PrivacySettings;
}

export const PrivacyForm: React.FC<PrivacyFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [allowPersonalization, setAllowPersonalization] = useState<boolean | undefined>(
    initialValues?.allowPersonalization
  );
  const [allowAnalytics, setAllowAnalytics] = useState<boolean | undefined>(
    initialValues?.allowAnalytics
  );
  const [allowMarketing, setAllowMarketing] = useState<boolean | undefined>(
    initialValues?.allowMarketing
  );
  const [allowAiLearning, setAllowAiLearning] = useState<boolean | undefined>(
    initialValues?.allowAiLearning
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        privacy: {
          allowPersonalization,
          allowAnalytics,
          allowMarketing,
          allowAiLearning,
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
        {/* Allow Personalization */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Allow Personalization
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={allowPersonalization === undefined ? "" : allowPersonalization ? "true" : "false"}
            onChange={(e) =>
              setAllowPersonalization(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Allow Analytics */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Allow Analytics
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={allowAnalytics === undefined ? "" : allowAnalytics ? "true" : "false"}
            onChange={(e) =>
              setAllowAnalytics(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Allow Marketing */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Allow Marketing Communication
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={allowMarketing === undefined ? "" : allowMarketing ? "true" : "false"}
            onChange={(e) =>
              setAllowMarketing(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Allow AI Learning */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Allow AI Concierge Learning
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={allowAiLearning === undefined ? "" : allowAiLearning ? "true" : "false"}
            onChange={(e) =>
              setAllowAiLearning(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div style={actionRowStyles}>
        <button type="button" onClick={onClose} style={cancelBtnStyles} disabled={loading}>
          Cancel
        </button>
        <button type="submit" style={submitBtnStyles} disabled={loading}>
          {loading ? "Saving..." : "Save Privacy Settings"}
        </button>
      </div>
    </form>
  );
};

// Styles from BasicInformationForm
const formContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const gridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.25rem",
};

const inputOverrideStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#0f172a",
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.2s ease",
  width: "100%",
};

const actionRowStyles: React.CSSProperties = {
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
