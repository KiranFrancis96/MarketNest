import React, { useState } from "react";
import { X, ShieldAlert } from "lucide-react";
import type { HomeInformation } from "../../entities/userProfile/model/types";
import { MSG_FAILED_SUBMIT_FORM } from "@/shared/constants/messages";

interface HomeFormProps {
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  initialValues?: HomeInformation;
}

export const HomeForm: React.FC<HomeFormProps> = ({
  onSubmit,
  onClose,
  initialValues,
}) => {
  const [houseType, setHouseType] = useState(initialValues?.houseType || "");
  const [ownership, setOwnership] = useState(initialValues?.ownership || "");
  const [bedrooms, setBedrooms] = useState<string>(
    initialValues?.bedrooms !== undefined ? String(initialValues.bedrooms) : ""
  );

  const [vehicles, setVehicles] = useState<string[]>(initialValues?.vehicles || []);
  const [vehicleInput, setVehicleInput] = useState("");

  const [smartHomeDevices, setSmartHomeDevices] = useState<string[]>(
    initialValues?.smartHomeDevices || []
  );
  const [smartDeviceInput, setSmartDeviceInput] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddVehicle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = vehicleInput.trim().replace(/,$/, "");
      if (val && !vehicles.includes(val)) {
        setVehicles([...vehicles, val]);
      }
      setVehicleInput("");
    }
  };

  const handleRemoveVehicle = (vehicle: string) => {
    setVehicles(vehicles.filter((v) => v !== vehicle));
  };

  const handleAddSmartDevice = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = smartDeviceInput.trim().replace(/,$/, "");
      if (val && !smartHomeDevices.includes(val)) {
        setSmartHomeDevices([...smartHomeDevices, val]);
      }
      setSmartDeviceInput("");
    }
  };

  const handleRemoveSmartDevice = (device: string) => {
    setSmartHomeDevices(smartHomeDevices.filter((d) => d !== device));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const finalVehicles = [...vehicles];
    const pendingVehicle = vehicleInput.trim().replace(/,$/, "");
    if (pendingVehicle && !finalVehicles.includes(pendingVehicle)) {
      finalVehicles.push(pendingVehicle);
    }

    const finalDevices = [...smartHomeDevices];
    const pendingDevice = smartDeviceInput.trim().replace(/,$/, "");
    if (pendingDevice && !finalDevices.includes(pendingDevice)) {
      finalDevices.push(pendingDevice);
    }

    try {
      const payload = {
        home: {
          houseType: houseType || undefined,
          ownership: ownership || undefined,
          bedrooms: bedrooms !== "" ? Number(bedrooms) : undefined,
          vehicles: finalVehicles.length > 0 ? finalVehicles : undefined,
          smartHomeDevices: finalDevices.length > 0 ? finalDevices : undefined,
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
        {/* House Type */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            House Type
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={houseType}
            onChange={(e) => setHouseType(e.target.value)}
          >
            <option value="">Select House Type</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
            <option value="Condo">Condo</option>
            <option value="Villa">Villa</option>
            <option value="Townhouse">Townhouse</option>
            <option value="Studio">Studio</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Ownership */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Ownership Status
          </label>
          <select
            className="form-input"
            style={inputOverrideStyles}
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
          >
            <option value="">Select Status</option>
            <option value="Owned">Owned</option>
            <option value="Rented">Rented</option>
            <option value="Living with Family">Living with Family</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Bedrooms */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Number of Bedrooms
          </label>
          <input
            type="number"
            className="form-input"
            style={inputOverrideStyles}
            placeholder="e.g. 2"
            min="0"
            value={bedrooms}
            onChange={(e) => setBedrooms(e.target.value)}
          />
        </div>

        {/* Vehicles */}
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Vehicles
          </label>
          <div style={langInputContainerStyles}>
            <div style={chipsWrapperStyles}>
              {vehicles.map((v) => (
                <span key={v} style={chipStyles}>
                  {v}
                  <button type="button" onClick={() => handleRemoveVehicle(v)} style={removeChipBtnStyles}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={vehicles.length === 0 ? "Add vehicle (press Enter)" : ""}
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value)}
                onKeyDown={handleAddVehicle}
                style={langInputFieldStyles}
              />
            </div>
          </div>
        </div>

        {/* Smart Home Devices */}
        <div className="form-group" style={{ margin: 0, gridColumn: "span 2" }}>
          <label className="form-label" style={{ color: "#94a3b8" }}>
            Smart Home Devices
          </label>
          <div style={langInputContainerStyles}>
            <div style={chipsWrapperStyles}>
              {smartHomeDevices.map((d) => (
                <span key={d} style={chipStyles}>
                  {d}
                  <button type="button" onClick={() => handleRemoveSmartDevice(d)} style={removeChipBtnStyles}>
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder={
                  smartHomeDevices.length === 0 ? "Add smart device (e.g. Alexa, Apple TV; press Enter)" : ""
                }
                value={smartDeviceInput}
                onChange={(e) => setSmartDeviceInput(e.target.value)}
                onKeyDown={handleAddSmartDevice}
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
          {loading ? "Saving..." : "Save Home Info"}
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
