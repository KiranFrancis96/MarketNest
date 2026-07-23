import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import type { ShoppingPreferences } from "../../entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface ShoppingFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: ShoppingPreferences;
}

export const ShoppingForm: React.FC<ShoppingFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [favoriteBrands, setFavoriteBrands] = useState<string[]>(
    initialValues?.favoriteBrands || []
  );
  const [brandInput, setBrandInput] = useState("");

  const [favoriteCategories, setFavoriteCategories] = useState<string[]>(
    initialValues?.favoriteCategories || []
  );
  const [categoryInput, setCategoryInput] = useState("");

  const [shoppingBudget, setShoppingBudget] = useState(initialValues?.shoppingBudget || "");
  const [couponUsage, setCouponUsage] = useState<boolean | undefined>(initialValues?.couponUsage);
  const [cashbackInterest, setCashbackInterest] = useState<boolean | undefined>(
    initialValues?.cashbackInterest
  );
  const [preferredShoppingTime, setPreferredShoppingTime] = useState(
    initialValues?.preferredShoppingTime || ""
  );

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddBrand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = brandInput.trim().replace(/,$/, "");
      if (val && !favoriteBrands.includes(val)) {
        setFavoriteBrands([...favoriteBrands, val]);
      }
      setBrandInput("");
    }
  };

  const handleRemoveBrand = (brand: string) => {
    setFavoriteBrands(favoriteBrands.filter((b) => b !== brand));
  };

  const handleAddCategory = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = categoryInput.trim().replace(/,$/, "");
      if (val && !favoriteCategories.includes(val)) {
        setFavoriteCategories([...favoriteCategories, val]);
      }
      setCategoryInput("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setFavoriteCategories(favoriteCategories.filter((c) => c !== cat));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalBrands = [...favoriteBrands];
    const pendingBrand = brandInput.trim().replace(/,$/, "");
    if (pendingBrand && !finalBrands.includes(pendingBrand)) {
      finalBrands.push(pendingBrand);
    }

    const finalCategories = [...favoriteCategories];
    const pendingCategory = categoryInput.trim().replace(/,$/, "");
    if (pendingCategory && !finalCategories.includes(pendingCategory)) {
      finalCategories.push(pendingCategory);
    }

    try {
      const payload = {
        shopping: {
          favoriteBrands: finalBrands.length > 0 ? finalBrands : undefined,
          favoriteCategories: finalCategories.length > 0 ? finalCategories : undefined,
          shoppingBudget: shoppingBudget || undefined,
          couponUsage,
          cashbackInterest,
          preferredShoppingTime: preferredShoppingTime || undefined,
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
        {/* Favorite Brands */}
        <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Favorite Brands
          </label>
          <div style={langInputContainerStyles}>
            <div style={chipsWrapperStyles}>
              {favoriteBrands.map((brand) => (
                <span key={brand} style={chipStyles}>
                  {brand}
                  <button type="button" onClick={() => handleRemoveBrand(brand)} style={removeChipBtnStyles}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={favoriteBrands.length === 0 ? "Add brand (press Enter)" : ""}
                value={brandInput}
                onChange={(e) => setBrandInput(e.target.value)}
                onKeyDown={handleAddBrand}
                style={langInputFieldStyles}
              />
            </div>
          </div>
        </div>

        {/* Favorite Categories */}
        <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Favorite Categories
          </label>
          <div style={langInputContainerStyles}>
            <div style={chipsWrapperStyles}>
              {favoriteCategories.map((cat) => (
                <span key={cat} style={chipStyles}>
                  {cat}
                  <button type="button" onClick={() => handleRemoveCategory(cat)} style={removeChipBtnStyles}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={favoriteCategories.length === 0 ? "Add category (press Enter)" : ""}
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={handleAddCategory}
                style={langInputFieldStyles}
              />
            </div>
          </div>
        </div>

        {/* Shopping Budget */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Shopping Budget
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={shoppingBudget}
            onChange={(e) => setShoppingBudget(e.target.value)}
          >
            <option value="">Select Budget</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Coupon Usage */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Do you frequently use coupons?
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={couponUsage === undefined ? "" : couponUsage ? "true" : "false"}
            onChange={(e) =>
              setCouponUsage(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Cashback Interest */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Interested in cashback offers?
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={cashbackInterest === undefined ? "" : cashbackInterest ? "true" : "false"}
            onChange={(e) =>
              setCashbackInterest(e.target.value === "" ? undefined : e.target.value === "true")
            }
          >
            <option value="">Select Option</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        {/* Preferred Shopping Time */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Preferred Shopping Time
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={preferredShoppingTime}
            onChange={(e) => setPreferredShoppingTime(e.target.value)}
          >
            <option value="">Select Preferred Time</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
            <option value="Any Time">Any Time</option>
          </select>
        </div>
      </div>

      <div style={actionRowStyles}>
        <button type="button" onClick={onClose} style={cancelBtnStyles} disabled={loading}>
          Cancel
        </button>
        <button type="submit" style={submitBtnStyles} disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
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
