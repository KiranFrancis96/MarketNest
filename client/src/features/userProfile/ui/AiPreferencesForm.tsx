import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { AiPreferences } from "@/entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface AiPreferencesFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: AiPreferences;
}

export const AiPreferencesForm: React.FC<AiPreferencesFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [aiFeatureUsage, setAiFeatureUsage] = useState(
    initialValues?.aiFeatureUsage || ""
  );
  const [preferredAiStyle, setPreferredAiStyle] = useState(
    initialValues?.preferredAiStyle || ""
  );
  const [dataSharingConsent, setDataSharingConsent] = useState<boolean | undefined>(
    initialValues?.dataSharingConsent
  );
  const [automatedRecommendations, setAutomatedRecommendations] = useState<
    boolean | undefined
  >(initialValues?.automatedRecommendations);

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        aiPreferences: {
          aiFeatureUsage: aiFeatureUsage || undefined,
          preferredAiStyle: preferredAiStyle || undefined,
          dataSharingConsent,
          automatedRecommendations,
        },
      };

      await onSubmit(payload);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.message || MSG_FAILED_SUBMIT_FORM
      );
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
        {/* AI Feature Usage Frequency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            AI Assistant Feature Usage
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={aiFeatureUsage}
            onChange={(e) => setAiFeatureUsage(e.target.value)}
          >
            <option value="">Select Level</option>
            <option value="Heavy (Automate daily tasks)">Heavy (Automate daily tasks)</option>
            <option value="Moderate (Assistance & recommendations)">Moderate (Assistance & recommendations)</option>
            <option value="Minimal (Search & basic queries)">Minimal (Search & basic queries)</option>
            <option value="Off (Manual control only)">Off (Manual control only)</option>
          </select>
        </div>

        {/* AI Response Style */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Preferred AI Tone & Style
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={preferredAiStyle}
            onChange={(e) => setPreferredAiStyle(e.target.value)}
          >
            <option value="">Select Tone</option>
            <option value="Concise & Professional">Concise & Professional</option>
            <option value="Friendly & Conversational">Friendly & Conversational</option>
            <option value="Detailed & Analytical">Detailed & Analytical</option>
            <option value="Creative & Expressive">Creative & Expressive</option>
          </select>
        </div>

        {/* Data Sharing Consent */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Allow Contextual Model Personalization
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={
              dataSharingConsent === undefined
                ? ""
                : dataSharingConsent
                ? "yes"
                : "no"
            }
            onChange={(e) =>
              setDataSharingConsent(
                e.target.value === "" ? undefined : e.target.value === "yes"
              )
            }
          >
            <option value="">Select Option</option>
            <option value="yes">Enabled (personalized responses)</option>
            <option value="no">Disabled (standard responses)</option>
          </select>
        </div>

        {/* Automated Recommendations */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Proactive Product Recommendations
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={
              automatedRecommendations === undefined
                ? ""
                : automatedRecommendations
                ? "yes"
                : "no"
            }
            onChange={(e) =>
              setAutomatedRecommendations(
                e.target.value === "" ? undefined : e.target.value === "yes"
              )
            }
          >
            <option value="">Select Option</option>
            <option value="yes">Enabled</option>
            <option value="no">Disabled</option>
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
