import React, { useState } from "react";
import { ShieldAlert, Plus, X } from "lucide-react";
import type { Technology } from "@/entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface TechnologyFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: Technology;
}

export const TechnologyForm: React.FC<TechnologyFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [primaryDevice, setPrimaryDevice] = useState(
    initialValues?.primaryDevice || ""
  );
  const [operatingSystem, setOperatingSystem] = useState(
    initialValues?.operatingSystem || ""
  );
  const [techSavviness, setTechSavviness] = useState(
    initialValues?.techSavviness || ""
  );
  const [favoriteGadgets, setFavoriteGadgets] = useState<string[]>(
    initialValues?.favoriteGadgets || []
  );
  const [newGadget, setNewGadget] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddGadget = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGadget.trim() && !favoriteGadgets.includes(newGadget.trim())) {
      setFavoriteGadgets([...favoriteGadgets, newGadget.trim()]);
      setNewGadget("");
    }
  };

  const handleRemoveGadget = (itemToRemove: string) => {
    setFavoriteGadgets(favoriteGadgets.filter((item) => item !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalGadgets = [...favoriteGadgets];
    const pendingGadget = newGadget.trim().replace(/,$/, "");
    if (pendingGadget && !finalGadgets.includes(pendingGadget)) {
      finalGadgets.push(pendingGadget);
    }

    try {
      const payload = {
        technology: {
          primaryDevice: primaryDevice || undefined,
          operatingSystem: operatingSystem || undefined,
          techSavviness: techSavviness || undefined,
          favoriteGadgets: finalGadgets.length > 0 ? finalGadgets : undefined,
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
        {/* Primary Device */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Primary Computing Device
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={primaryDevice}
            onChange={(e) => setPrimaryDevice(e.target.value)}
          >
            <option value="">Select Device</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop PC">Desktop PC</option>
            <option value="Smartphone">Smartphone</option>
            <option value="Tablet">Tablet</option>
          </select>
        </div>

        {/* Operating System */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Preferred OS
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={operatingSystem}
            onChange={(e) => setOperatingSystem(e.target.value)}
          >
            <option value="">Select Operating System</option>
            <option value="Windows">Windows</option>
            <option value="macOS">macOS</option>
            <option value="Linux">Linux</option>
            <option value="iOS / iPadOS">iOS / iPadOS</option>
            <option value="Android">Android</option>
          </select>
        </div>

        {/* Tech Savviness */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Tech Expertise Level
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={techSavviness}
            onChange={(e) => setTechSavviness(e.target.value)}
          >
            <option value="">Select Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced / Power User">Advanced / Power User</option>
            <option value="Professional Engineer">Professional Engineer</option>
          </select>
        </div>
      </div>

      {/* Favorite Gadgets */}
      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Favorite Hardware & Gadgets
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Mechanical Keyboard, Smart Watch, Noise Canceling Headphones"
            value={newGadget}
            onChange={(e) => setNewGadget(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddGadget(e);
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddGadget}
            style={addBtnStyles}
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {favoriteGadgets.length > 0 && (
          <div style={chipContainerStyles}>
            {favoriteGadgets.map((gadget) => (
              <span key={gadget} style={chipStyles}>
                {gadget}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveGadget(gadget)}
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
