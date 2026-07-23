import React, { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { Lifestyle } from "../../entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface LifestyleFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: Lifestyle;
}

export const LifestyleForm: React.FC<LifestyleFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [exerciseFrequency, setExerciseFrequency] = useState(
    initialValues?.exerciseFrequency || ""
  );
  const [wakeUpTime, setWakeUpTime] = useState(initialValues?.wakeUpTime || "");
  const [sleepTime, setSleepTime] = useState(initialValues?.sleepTime || "");
  const [dietType, setDietType] = useState(initialValues?.dietType || "");
  const [smoking, setSmoking] = useState<boolean | undefined>(initialValues?.smoking);
  const [alcohol, setAlcohol] = useState<boolean | undefined>(initialValues?.alcohol);
  const [shoppingFrequency, setShoppingFrequency] = useState(
    initialValues?.shoppingFrequency || ""
  );
  const [workStyle, setWorkStyle] = useState(initialValues?.workStyle || "");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const payload = {
        lifestyle: {
          exerciseFrequency: exerciseFrequency || undefined,
          wakeUpTime: wakeUpTime || undefined,
          sleepTime: sleepTime || undefined,
          dietType: dietType || undefined,
          smoking,
          alcohol,
          shoppingFrequency: shoppingFrequency || undefined,
          workStyle: workStyle || undefined,
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
        {/* Exercise Frequency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Exercise Frequency
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={exerciseFrequency}
            onChange={(e) => setExerciseFrequency(e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Rarely">Rarely</option>
            <option value="Never">Never</option>
          </select>
        </div>

        {/* Diet Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Diet Type
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
          >
            <option value="">Select Diet</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="Halal">Halal</option>
            <option value="Kosher">Kosher</option>
            <option value="Keto">Keto</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Wake Up Time */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Wake Up Time
          </label>
          <input
            type="time"
            className="form-input"
            style={inputOverrideStyles}
            value={wakeUpTime}
            onChange={(e) => setWakeUpTime(e.target.value)}
          />
        </div>

        {/* Sleep Time */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Sleep Time
          </label>
          <input
            type="time"
            className="form-input"
            style={inputOverrideStyles}
            value={sleepTime}
            onChange={(e) => setSleepTime(e.target.value)}
          />
        </div>

        {/* Smoking */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Do you smoke?
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={smoking === undefined ? "" : smoking ? "true" : "false"}
            onChange={(e) =>
              setSmoking(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Alcohol */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Do you consume alcohol?
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={alcohol === undefined ? "" : alcohol ? "true" : "false"}
            onChange={(e) =>
              setAlcohol(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Shopping Frequency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Shopping Frequency
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={shoppingFrequency}
            onChange={(e) => setShoppingFrequency(e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Rarely">Rarely</option>
          </select>
        </div>

        {/* Work Style */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Work Style
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={workStyle}
            onChange={(e) => setWorkStyle(e.target.value)}
          >
            <option value="">Select Work Style</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
            <option value="Student">Student</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div style={actionRowStyles}>
        <button type="button" onClick={onClose} style={cancelBtnStyles} disabled={loading}>
          Cancel
        </button>
        <button type="submit" style={submitBtnStyles} disabled={loading}>
          {loading ? "Saving..." : "Save Lifestyle"}
        </button>
      </div>
    </form>
  );
};

// Styles matching BasicInformationForm
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
