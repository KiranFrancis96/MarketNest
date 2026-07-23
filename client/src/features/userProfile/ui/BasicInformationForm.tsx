import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import type { BasicInformation } from "../../entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface BasicInformationFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: BasicInformation;
}

export const BasicInformationForm: React.FC<BasicInformationFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [dateOfBirth, setDateOfBirth] = useState(
    initialValues?.dateOfBirth ? new Date(initialValues.dateOfBirth).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState(initialValues?.gender || "");
  const [maritalStatus, setMaritalStatus] = useState(initialValues?.maritalStatus || "");
  const [occupation, setOccupation] = useState(
    initialValues?.occupationType || (initialValues as any)?.occupation || ""
  );
  const [education, setEducation] = useState(initialValues?.education || "");
  const [languages, setLanguages] = useState<string[]>(initialValues?.languages || []);
  const [langInput, setLangInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleAddLanguage = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const val = langInput.trim().replace(/,$/, "");
    if (val && !languages.includes(val)) {
      setLanguages([...languages, val]);
    }
    setLangInput("");
  };

  const handleKeyDownLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setLanguages(languages.filter((l) => l !== lang));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const newErrors: Record<string, string> = {};

    if (!gender) {
      newErrors.gender = "Gender is required.";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required.";
    } else {
      const dobDate = new Date(dateOfBirth);
      const today = new Date();
      if (dobDate > today) {
        newErrors.dateOfBirth = "Date of Birth cannot be in the future.";
      }
    }

    if (!occupation.trim()) {
      newErrors.occupation = "Occupation is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMsg("Please correct the highlighted errors.");
      return;
    }

    const finalLanguages = [...languages];
    const pendingLang = langInput.trim().replace(/,$/, "");
    if (pendingLang && !finalLanguages.includes(pendingLang)) {
      finalLanguages.push(pendingLang);
    }

    setErrors({});
    setLoading(true);
    try {
      const payload = {
        basicInformation: {
          dateOfBirth,
          gender,
          maritalStatus: maritalStatus || undefined,
          occupation,
          occupationType: occupation,
          education: education || undefined,
          languages: finalLanguages.length > 0 ? finalLanguages : undefined,
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
        {/* Gender */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>Gender</label>
          <select
            className="form-input"
            style={{
              ...inputOverrideStyles,
              borderColor: errors.gender ? "#ef4444" : "#cbd5e1",
              boxShadow: errors.gender ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : "none",
            }}
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              if (errors.gender) setErrors({ ...errors, gender: "" });
            }}
          >
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer Not To Say</option>
          </select>
          {errors.gender && (
            <span style={fieldErrorStyles}>{errors.gender}</span>
          )}
        </div>

        {/* Date of Birth */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>Date of Birth</label>
          <input
            type="date"
            className="form-input"
            style={{
              ...inputOverrideStyles,
              borderColor: errors.dateOfBirth ? "#ef4444" : "#cbd5e1",
              boxShadow: errors.dateOfBirth ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : "none",
            }}
            value={dateOfBirth}
            onChange={(e) => {
              setDateOfBirth(e.target.value);
              if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: "" });
            }}
          />
          {errors.dateOfBirth && (
            <span style={fieldErrorStyles}>{errors.dateOfBirth}</span>
          )}
        </div>

        {/* Marital Status */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>Marital Status</label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
          >
            <option value="">Select Status (Optional)</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Occupation */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>Occupation</label>
          <input
            type="text"
            className="form-input"
            style={{
              ...inputOverrideStyles,
              borderColor: errors.occupation ? "#ef4444" : "#cbd5e1",
              boxShadow: errors.occupation ? "0 0 0 3px rgba(239, 68, 68, 0.15)" : "none",
            }}
            placeholder="e.g. Systems Architect"
            value={occupation}
            onChange={(e) => {
              setOccupation(e.target.value);
              if (errors.occupation) setErrors({ ...errors, occupation: "" });
            }}
          />
          {errors.occupation && (
            <span style={fieldErrorStyles}>{errors.occupation}</span>
          )}
        </div>

        {/* Education */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>Education</label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          >
            <option value="">Highest Level (Optional)</option>
            <option value="high_school">High School</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="phd">Ph.D.</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Languages */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>Languages Spoken</label>
          <div style={langInputContainerStyles}>
            <div style={chipsWrapperStyles}>
              {languages.map((lang) => (
                <span key={lang} style={chipStyles}>
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    style={removeChipBtnStyles}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={languages.length === 0 ? "Add language (press Enter)" : ""}
                value={langInput}
                onChange={(e) => setLangInput(e.target.value)}
                onKeyDown={handleKeyDownLanguage}
                style={langInputFieldStyles}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={actionRowStyles}>
        <button
          type="button"
          onClick={onClose}
          style={cancelBtnStyles}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={submitBtnStyles}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
};

// Styles
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

const langInputContainerStyles: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  borderRadius: "12px",
  padding: "0.5rem 0.75rem",
  backgroundColor: "#ffffff",
  minHeight: "45px",
  display: "flex",
  alignItems: "center",
};

const chipsWrapperStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
  alignItems: "center",
  width: "100%",
};

const chipStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  backgroundColor: "#f1f5f9",
  color: "#334155",
  padding: "0.2rem 0.5rem",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontWeight: 600,
};

const removeChipBtnStyles: React.CSSProperties = {
  border: "none",
  background: "none",
  color: "#64748b",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
};

const langInputFieldStyles: React.CSSProperties = {
  border: "none",
  outline: "none",
  backgroundColor: "transparent",
  flex: 1,
  minWidth: "80px",
  fontSize: "0.95rem",
  color: "#0f172a",
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

const fieldErrorStyles: React.CSSProperties = {
  color: "#ef4444",
  fontSize: "0.8rem",
  fontWeight: 500,
  marginTop: "0.35rem",
  display: "block",
};
