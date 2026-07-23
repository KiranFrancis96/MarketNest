import React, { useState } from "react";
import { ShieldAlert, Plus, X } from "lucide-react";
import type { Food } from "@/entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface FoodFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: Food;
}

export const FoodForm: React.FC<FoodFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(
    initialValues?.dietaryPreferences || []
  );
  const [newDiet, setNewDiet] = useState("");

  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>(
    initialValues?.favoriteCuisines || []
  );
  const [newCuisine, setNewCuisine] = useState("");

  const [cookingFrequency, setCookingFrequency] = useState(
    initialValues?.cookingFrequency || ""
  );
  const [diningOutFrequency, setDiningOutFrequency] = useState(
    initialValues?.diningOutFrequency || ""
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDiet.trim() && !dietaryPreferences.includes(newDiet.trim())) {
      setDietaryPreferences([...dietaryPreferences, newDiet.trim()]);
      setNewDiet("");
    }
  };

  const handleRemoveDiet = (itemToRemove: string) => {
    setDietaryPreferences(
      dietaryPreferences.filter((item) => item !== itemToRemove)
    );
  };

  const handleAddCuisine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCuisine.trim() && !favoriteCuisines.includes(newCuisine.trim())) {
      setFavoriteCuisines([...favoriteCuisines, newCuisine.trim()]);
      setNewCuisine("");
    }
  };

  const handleRemoveCuisine = (itemToRemove: string) => {
    setFavoriteCuisines(
      favoriteCuisines.filter((item) => item !== itemToRemove)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalDiets = [...dietaryPreferences];
    const pendingDiet = newDiet.trim().replace(/,$/, "");
    if (pendingDiet && !finalDiets.includes(pendingDiet)) {
      finalDiets.push(pendingDiet);
    }

    const finalCuisines = [...favoriteCuisines];
    const pendingCuisine = newCuisine.trim().replace(/,$/, "");
    if (pendingCuisine && !finalCuisines.includes(pendingCuisine)) {
      finalCuisines.push(pendingCuisine);
    }

    try {
      const payload = {
        food: {
          dietaryPreferences:
            finalDiets.length > 0 ? finalDiets : undefined,
          favoriteCuisines:
            finalCuisines.length > 0 ? finalCuisines : undefined,
          cookingFrequency: cookingFrequency || undefined,
          diningOutFrequency: diningOutFrequency || undefined,
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
        {/* Cooking Frequency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Cooking Frequency
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={cookingFrequency}
            onChange={(e) => setCookingFrequency(e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="A few times a week">A few times a week</option>
            <option value="Rarely">Rarely</option>
            <option value="Never">Never</option>
          </select>
        </div>

        {/* Dining Out Frequency */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
            Dining Out / Delivery Frequency
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={diningOutFrequency}
            onChange={(e) => setDiningOutFrequency(e.target.value)}
          >
            <option value="">Select Frequency</option>
            <option value="Daily">Daily</option>
            <option value="A few times a week">A few times a week</option>
            <option value="Rarely">Rarely</option>
            <option value="Never">Never</option>
          </select>
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="form-group" style={{ marginTop: "1rem" }}>
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Dietary Restrictions & Preferences
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Vegetarian, Keto, Gluten-Free, Halal"
            value={newDiet}
            onChange={(e) => setNewDiet(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddDiet(e);
              }
            }}
          />
          <button type="button" onClick={handleAddDiet} style={addBtnStyles}>
            <Plus size={16} /> Add
          </button>
        </div>

        {dietaryPreferences.length > 0 && (
          <div style={chipContainerStyles}>
            {dietaryPreferences.map((diet) => (
              <span key={diet} style={chipStyles}>
                {diet}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveDiet(diet)}
                />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Cuisines */}
      <div className="form-group">
        <label className="form-label" style={{ color: "#475569", fontWeight: 600 }}>
          Favorite Cuisines
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. Italian, Japanese, Mexican, Indian"
            value={newCuisine}
            onChange={(e) => setNewCuisine(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCuisine(e);
              }
            }}
          />
          <button type="button" onClick={handleAddCuisine} style={addBtnStyles}>
            <Plus size={16} /> Add
          </button>
        </div>

        {favoriteCuisines.length > 0 && (
          <div style={chipContainerStyles}>
            {favoriteCuisines.map((cuisine) => (
              <span key={cuisine} style={chipStyles}>
                {cuisine}
                <X
                  size={14}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRemoveCuisine(cuisine)}
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
