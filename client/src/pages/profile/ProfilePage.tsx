import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Plus, MapPin, Trash2, Edit3, ShieldAlert, User as UserIcon, Mail } from "lucide-react";
import type { RootState, AppDispatch } from "@/app/store";
import { setUser } from "@/entities/user/model/userSlice";
import { userApi } from "@/entities/user/api/userApi";
import type { Address } from "@/entities/user/model/types";
import { Header } from "@/shared/components/Header";

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user && user.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("");
    setIsDefault(addresses.length === 0); // Force default if it is the first address
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country);
    setIsDefault(addr.isDefault);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !state || !zipCode || !country) {
      setErrorMsg("All fields are required.");
      return;
    }

    const payload = { fullName, phone, street, city, state, zipCode, country, isDefault };

    try {
      let res;
      if (editingAddress) {
        res = await userApi.updateAddress(editingAddress._id, payload);
      } else {
        res = await userApi.addAddress(payload);
      }
      
      dispatch(setUser(res.data.user));
      setIsModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to save address.");
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDeleteId) return;
    try {
      const res = await userApi.deleteAddress(addressToDeleteId);
      dispatch(setUser(res.data.user));
      setAddressToDeleteId(null);
    } catch (err) {
      alert("Failed to delete address.");
    }
  };

  return (
    <div style={containerStyles}>
      <Header />
      <main style={mainContentStyles}>
        {/* Profile Info Header */}
        <section style={profileHeaderCardStyles}>
          <div style={avatarCircleStyles}>
            <UserIcon size={36} color="var(--primary)" />
          </div>
          <div>
            <h1 style={profileNameStyles}>
              {user?.firstName ? `${user.firstName} ${user.lastName}` : "User Profile"}
            </h1>
            <div style={profileDetailRowStyles}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={profileEmailStyles}>{user?.email}</span>
            </div>
          </div>
        </section>

        {/* Address Book Section */}
        <section style={{ marginTop: "2rem" }}>
          <div style={sectionHeaderStyles}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={22} color="var(--primary)" />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Saved Delivery Addresses</h2>
            </div>
            <button onClick={openAddModal} style={addBtnStyles}>
              <Plus size={18} /> Add Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div style={emptyStateCardStyles}>
              <MapPin size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.25rem" }}>No Addresses Saved</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
                Please add a delivery address to make the checkout process smooth and rapid.
              </p>
            </div>
          ) : (
            <div style={addressGridStyles}>
              {addresses.map((addr) => (
                <div key={addr._id} style={{
                  ...addressCardStyles,
                  borderColor: addr.isDefault ? "var(--primary)" : "var(--border)",
                  boxShadow: addr.isDefault ? "0 4px 20px rgba(99, 102, 241, 0.08)" : "none",
                }}>
                  {addr.isDefault && (
                    <span style={defaultBadgeStyles}>DEFAULT</span>
                  )}
                  <h3 style={cardNameStyles}>{addr.fullName}</h3>
                  <p style={cardTextStyles}>{addr.street}</p>
                  <p style={cardTextStyles}>{addr.city}, {addr.state} - {addr.zipCode}</p>
                  <p style={cardTextStyles}>{addr.country}</p>
                  <p style={{ ...cardTextStyles, marginTop: "0.5rem", fontWeight: 600 }}>Phone: {addr.phone}</p>

                  <div style={cardActionsStyles}>
                    <button onClick={() => openEditModal(addr)} style={actionBtnStyles} title="Edit Address">
                      <Edit3 size={16} style={{ marginRight: "0.25rem" }} /> Edit
                    </button>
                    <button onClick={() => setAddressToDeleteId(addr._id)} style={{ ...actionBtnStyles, color: "#dc2626" }} title="Delete Address">
                      <Trash2 size={16} style={{ marginRight: "0.25rem" }} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Address Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "520px", width: "90%", borderRadius: "24px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={closeBtnStyles}>&times;</button>
            </div>

            {errorMsg && (
              <div style={errorContainerStyles}>
                <ShieldAlert size={18} style={{ marginRight: "0.5rem", flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Apartment, building, flat, street..."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State / Province</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">ZIP / Postal Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ZIP Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              {/* Default toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={isDefault}
                  disabled={editingAddress?.isDefault} // Cannot unset default directly if it's the only default
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <label htmlFor="defaultAddressCheckbox" style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-main)", cursor: "pointer" }}>
                  Set as default shipping address
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", width: "auto" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", width: "auto", marginTop: 0 }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Address Modal */}
      {addressToDeleteId && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "420px", width: "90%", padding: "1.75rem", borderRadius: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={deleteWarningIconContainerStyles}>
                <Trash2 width="28" height="28" style={{ color: "#dc2626" }} />
              </div>
              
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginTop: "1rem", marginBottom: "0.5rem" }}>
                Remove Saved Address?
              </h3>
              
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 1.5rem 0" }}>
                Are you sure you want to remove this address from your saved address book?
              </p>

              <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                <button
                  onClick={() => setAddressToDeleteId(null)}
                  className="modal-btn modal-btn-secondary"
                  style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "12px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAddress}
                  className="modal-btn"
                  style={{
                    flex: 1,
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.2s"
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyles: React.CSSProperties = {
  backgroundColor: "var(--background)",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
};

const mainContentStyles: React.CSSProperties = {
  flex: 1,
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "2rem",
};

const profileHeaderCardStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  padding: "2rem",
  borderRadius: "24px",
  backgroundColor: "white",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.01)",
};

const avatarCircleStyles: React.CSSProperties = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  backgroundColor: "var(--background)",
  border: "2px solid #e0e7ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const profileNameStyles: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 800,
  color: "var(--text-main)",
  margin: 0,
  letterSpacing: "-0.01em",
};

const profileDetailRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "0.35rem",
};

const profileEmailStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "var(--text-muted)",
  fontWeight: 500,
};

const sectionHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.25rem",
};

const addBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.35rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "12px",
  backgroundColor: "var(--primary)",
  color: "white",
  border: "none",
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const emptyStateCardStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  padding: "5rem 2rem",
  backgroundColor: "white",
  borderRadius: "24px",
  border: "1px solid var(--border)",
};

const addressGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "1.5rem",
};

const addressCardStyles: React.CSSProperties = {
  position: "relative",
  padding: "1.5rem",
  borderRadius: "20px",
  backgroundColor: "white",
  border: "2px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.25s ease",
};

const defaultBadgeStyles: React.CSSProperties = {
  position: "absolute",
  top: "1.25rem",
  right: "1.25rem",
  backgroundColor: "#e0e7ff",
  color: "var(--primary)",
  fontSize: "0.65rem",
  fontWeight: 800,
  padding: "0.25rem 0.6rem",
  borderRadius: "8px",
  letterSpacing: "0.05em",
};

const cardNameStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--text-main)",
  margin: "0 0 0.75rem 0",
};

const cardTextStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  margin: "0 0 0.25rem 0",
  lineHeight: 1.45,
};

const cardActionsStyles: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginTop: "1.5rem",
  borderTop: "1px solid #f1f5f9",
  paddingTop: "1rem",
};

const actionBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: "none",
  border: "none",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  cursor: "pointer",
  transition: "color 0.2s",
};

const closeBtnStyles: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 700,
  border: "none",
  background: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  padding: 0,
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
  marginBottom: "1rem",
};

const deleteWarningIconContainerStyles: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: "#fee2e2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
