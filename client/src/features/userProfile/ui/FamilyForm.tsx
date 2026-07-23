import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import type { FamilyInformation } from "../../entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface FamilyFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: FamilyInformation;
}

export const FamilyForm: React.FC<FamilyFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [livingAlone, setLivingAlone] = useState<boolean | undefined>(initialValues?.livingAlone);
  const [familyMembers, setFamilyMembers] = useState<string>(
    initialValues?.familyMembers !== undefined ? String(initialValues.familyMembers) : ""
  );
  const [children, setChildren] = useState<string>(
    initialValues?.children !== undefined ? String(initialValues.children) : ""
  );
  const [dependents, setDependents] = useState<string>(
    initialValues?.dependents !== undefined ? String(initialValues.dependents) : ""
  );
  const [pets, setPets] = useState<string[]>(initialValues?.pets || []);
  const [petInput, setPetInput] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPet = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    const val = petInput.trim().replace(/,$/, "");
    if (val && !pets.includes(val)) {
      setPets([...pets, val]);
    }
    setPetInput("");
  };

  const handleKeyDownPet = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddPet();
    }
  };

  const handleRemovePet = (pet: string) => {
    setPets(pets.filter((p) => p !== pet));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalPets = [...pets];
    const pendingPet = petInput.trim().replace(/,$/, "");
    if (pendingPet && !finalPets.includes(pendingPet)) {
      finalPets.push(pendingPet);
    }

    try {
      const payload = {
        family: {
          livingAlone,
          familyMembers: familyMembers !== "" ? Number(familyMembers) : undefined,
          children: children !== "" ? Number(children) : undefined,
          dependents: dependents !== "" ? Number(dependents) : undefined,
          pets: finalPets.length > 0 ? finalPets : undefined,
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
        {/* Living Alone */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Do you live alone?
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={livingAlone === undefined ? "" : livingAlone ? "true" : "false"}
            onChange={(e) =>
              setLivingAlone(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Family Members */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Total Family Members
          </label>
          <input
            type="number"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. 4"
            min="1"
            value={familyMembers}
            onChange={(e) => setFamilyMembers(e.target.value)}
          />
        </div>

        {/* Children */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Number of Children
          </label>
          <input
            type="number"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. 2"
            min="0"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
          />
        </div>

        {/* Dependents */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Number of Dependents
          </label>
          <input
            type="number"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. 0"
            min="0"
            value={dependents}
            onChange={(e) => setDependents(e.target.value)}
          />
        </div>

        {/* Pets */}
        <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Pets Owned
          </label>
          <div style={langInputContainerStyles}>
            <div style={chipsWrapperStyles}>
              {pets.map((pet) => (
                <span key={pet} style={chipStyles}>
                  {pet}
                  <button type="button" onClick={() => handleRemovePet(pet)} style={removeChipBtnStyles}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={pets.length === 0 ? "Add pet (e.g. Dog, Cat; press Enter)" : ""}
                value={petInput}
                onChange={(e) => setPetInput(e.target.value)}
                onKeyDown={handleKeyDownPet}
                style={langInputFieldStyles}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={actionRowStyles}>
        <button type="button" onClick={onClose} style={cancelBtnStyles} disabled={loading}>
          Cancel
        </button>
        <button type="submit" style={submitBtnStyles} disabled={loading}>
          {loading ? "Saving..." : "Save Family Info"}
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
