import React, { useState } from "react";
import { ShieldAlert, Plus, X } from "lucide-react";
import type { Occupation } from "@/entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface OccupationFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: Occupation;
}

export const OccupationForm: React.FC<OccupationFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [companyIndustry, setCompanyIndustry] = useState(
    initialValues?.companyIndustry || ""
  );
  const [jobRole, setJobRole] = useState(initialValues?.jobRole || "");
  const [yearsExperience, setYearsExperience] = useState<number | undefined>(
    initialValues?.yearsExperience
  );
  const [workLocation, setWorkLocation] = useState(
    initialValues?.workLocation || ""
  );
  const [skills, setSkills] = useState<string[]>(initialValues?.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (itemToRemove: string) => {
    setSkills(skills.filter((item) => item !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalSkills = [...skills];
    const pendingSkill = newSkill.trim().replace(/,$/, "");
    if (pendingSkill && !finalSkills.includes(pendingSkill)) {
      finalSkills.push(pendingSkill);
    }

    try {
      const payload = {
        occupation: {
          companyIndustry: companyIndustry || undefined,
          jobRole: jobRole || undefined,
          yearsExperience: yearsExperience !== undefined ? Number(yearsExperience) : undefined,
          workLocation: workLocation || undefined,
          skills: finalSkills.length > 0 ? finalSkills : undefined,
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
        {/* Industry */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Company / Industry
          </label>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Technology, Healthcare, Finance"
            value={companyIndustry}
            onChange={(e) => setCompanyIndustry(e.target.value)}
          />
        </div>

        {/* Job Role */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Job Role / Title
          </label>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Software Engineer, Product Manager"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
          />
        </div>

        {/* Years of Experience */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. 5"
            value={yearsExperience !== undefined ? yearsExperience : ""}
            onChange={(e) =>
              setYearsExperience(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
          />
        </div>

        {/* Work Location Style */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Work Environment
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
          >
            <option value="">Select Work Setup</option>
            <option value="On-site">On-site</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Freelance / Self-employed">Freelance / Self-employed</option>
          </select>
        </div>
      </div>

      {/* Skills */}
      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Key Skills & Expertise
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Project Management, Python, UI Design"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddSkill}
            style={addBtnStyles}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {skills.length > 0 && (
          <div style={chipContainerStyles}>
            {skills.map((skill) => (
              <span key={skill} style={chipStyles}>
                {skill}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveSkill(skill)}
                />
              </span>
            ))}
          </div>
        )}
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

const chipContainerStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem",
  marginTop: "0.75rem",
};

const chipStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.35rem",
  backgroundColor: "#f1f5f9",
  color: "#334155",
  padding: "0.3rem 0.65rem",
  borderRadius: "8px",
  fontSize: "0.85rem",
  fontWeight: 600,
};

const addBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  border: "none",
  borderRadius: "12px",
  padding: "0 1.25rem",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.875rem",
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
