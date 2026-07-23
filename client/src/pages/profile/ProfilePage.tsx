import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Plus, 
  MapPin, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  ShieldCheck, 
  User as UserIcon, 
  Mail, 
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  History
} from "lucide-react";
import type { RootState, AppDispatch } from "@/app/store";
import { setUser } from "@/entities/user/model/userSlice";
import { userApi } from "@/entities/user/api/userApi";
import { orderApi, type WalletTransaction } from "@/entities/order/api/orderApi";
import type { Address } from "@/entities/user/model/types";
import { Header } from "@/shared/components/Header";
import { setProfile, setError, setLoading } from "@/entities/userProfile/model/userProfileSlice";
import { userProfileApi } from "@/entities/userProfile/api/userProfileApi";
import { PersonalizationOverviewCard } from "@/features/userProfile";
import { WalletHistoryModal } from "@/features/wallet";
import { HttpStatus } from "@/shared/api/httpStatus";
import { MSG_FAILED_LOAD_PERSONALIZATION, MSG_FAILED_SAVE_ADDRESS } from "@/shared/constants/messages";

export const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const [walletLoading, setWalletLoading] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWalletHistoryModalOpen, setIsWalletHistoryModalOpen] = useState(false);
  const [fundsAmount, setFundsAmount] = useState("1000");
  const [fundsError, setFundsError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalAmount, setSuccessModalAmount] = useState(0);

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const fetchWalletHistory = async () => {
    try {
      setLoadingTransactions(true);
      const res = await orderApi.getWalletHistory();
      if (res.data.success) {
        setWalletTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet history:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchWalletHistory();
  }, []);

  const handleAddWalletFunds = async (amount: number) => {
    try {
      setWalletLoading(true);
      await orderApi.addWalletFunds(amount);
      
      const profileRes = await userApi.getProfile();
      dispatch(setUser(profileRes.data));
      
      await fetchWalletHistory();

      setIsAddFundsModalOpen(false);
      setFundsError("");
      setSuccessModalAmount(amount);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Wallet fund error:", err);
      setFundsError(err.response?.data?.message || err.message);
    } finally {
      setWalletLoading(false);
    }
  };

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

  // Address Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [autoOpenPersonalizationModal, setAutoOpenPersonalizationModal] = useState(false);

  useEffect(() => {
    const fetchPersonalizationProfile = async () => {
      dispatch(setLoading(true));
      try {
        const res = await userProfileApi.getUserPersonalizationProfile();
        dispatch(setProfile(res.data.profile));
      } catch (err: any) {
        if (err.response?.status === HttpStatus.NOT_FOUND) {
          dispatch(setProfile(null));
          setAutoOpenPersonalizationModal(true);
        } else {
          dispatch(setError(err.response?.data?.message || MSG_FAILED_LOAD_PERSONALIZATION));
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPersonalizationProfile();
  }, [dispatch]);

  const handlePersonalizationModalClose = () => {
    setAutoOpenPersonalizationModal(false);
  };

  useEffect(() => {
    if (user && user.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setFullName(user?.name || "");
    setPhone("");
    setStreet("");
    setCity("");
    setState("");
    setZipCode("");
    setCountry("India");
    setIsDefault(addresses.length === 0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (address: Address) => {
    setEditingAddress(address);
    setFullName(address.fullName);
    setPhone(address.phone);
    setStreet(address.street);
    setCity(address.city);
    setState(address.state);
    setZipCode(address.zipCode);
    setCountry(address.country || "India");
    setIsDefault(address.isDefault || false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !state || !zipCode) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const addressData = {
      fullName,
      phone,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault,
    };

    try {
      let updatedUser;
      if (editingAddress && editingAddress._id) {
        const res = await userApi.updateAddress(editingAddress._id, addressData);
        updatedUser = res.data;
      } else {
        const res = await userApi.addAddress(addressData);
        updatedUser = res.data;
      }

      dispatch(setUser(updatedUser));
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || MSG_FAILED_SAVE_ADDRESS);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await userApi.deleteAddress(addressId);
      dispatch(setUser(res.data));
      setAddressToDeleteId(null);
    } catch (err) {
      console.error("Failed to delete address", err);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, backgroundColor: "#f8fafc", padding: "3rem 0" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          
          {/* User Profile Header Card */}
          <section style={profileHeaderCardStyles}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={avatarStyles}>
                <UserIcon size={36} color="var(--primary)" />
              </div>
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                  {user?.name || "User Account"}
                </h1>
                <div style={profileDetailRowStyles}>
                  <Mail size={16} color="var(--text-muted)" />
                  <span style={profileEmailStyles}>{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Wallet Balance Widget */}
            <div style={walletWidgetStyles}>
              <div 
                onClick={() => setIsWalletHistoryModalOpen(true)}
                style={{ ...walletIconWrapperStyles, cursor: "pointer" }}
                title="Click to view Wallet History"
              >
                <WalletIcon size={22} color="var(--primary)" />
              </div>
              <div 
                onClick={() => setIsWalletHistoryModalOpen(true)}
                style={{ display: "flex", flexDirection: "column", cursor: "pointer" }}
                title="Click to view Wallet History"
              >
                <span style={walletLabelStyles}>MARKETNEST WALLET</span>
                <span style={walletBalanceStyles}>₹{(user?.walletBalance || 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={() => {
                  setFundsAmount("1000");
                  setFundsError("");
                  setIsAddFundsModalOpen(true);
                }}
                style={walletAddBtnStyles}
              >
                + Add Funds
              </button>
            </div>
          </section>

          {/* Wallet Transaction History Section */}
          <section style={{ marginTop: "2rem" }}>
            <div style={sectionHeaderStyles}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <History size={20} color="var(--primary)" />
                <h2 style={sectionTitleStyles}>Wallet Activity & History</h2>
              </div>
              <button 
                onClick={fetchWalletHistory} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: "var(--primary)", 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.25rem",
                  fontSize: "0.85rem",
                  fontWeight: 600
                }}
              >
                <RefreshCw size={14} className={loadingTransactions ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            <div style={historyCardContainerStyles}>
              {loadingTransactions ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  Loading wallet history...
                </div>
              ) : walletTransactions.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>No wallet transactions recorded yet.</p>
                  <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem" }}>Top up your wallet or make purchases to view your transaction log.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {walletTransactions.map((tx) => {
                    const isCredit = tx.type?.toLowerCase() === "credit" || tx.description?.toLowerCase().includes("credit") || tx.description?.toLowerCase().includes("added") || tx.description?.toLowerCase().includes("top-up");
                    return (
                      <div key={tx._id} style={transactionItemStyles}>
                        <div style={{
                          ...txIconWrapperStyles,
                          backgroundColor: isCredit ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: isCredit ? "#10b981" : "#ef4444"
                        }}>
                          {isCredit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                              <span style={txDescriptionStyles}>{tx.description}</span>
                              <span style={{
                                fontSize: "0.65rem",
                                fontWeight: 800,
                                padding: "0.15rem 0.45rem",
                                borderRadius: "6px",
                                backgroundColor: isCredit ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                color: isCredit ? "#10b981" : "#ef4444",
                                letterSpacing: "0.04em"
                              }}>
                                {isCredit ? "CREDITED" : "DEBITED"}
                              </span>
                            </div>
                            <span style={{
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: isCredit ? "#10b981" : "#ef4444"
                            }}>
                              {isCredit ? "+" : "-"} ₹{tx.amount.toFixed(2)}
                            </span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                            <span style={txDateStyles}>
                              {new Date(tx.createdAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short"
                              })}
                            </span>
                            <span style={txBalanceAfterStyles}>
                              Balance: ₹{(tx.balanceAfter || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* AI Personalization Section */}
          <section style={{ marginTop: "2rem" }}>
            <PersonalizationOverviewCard
              autoOpenOnboardingModal={autoOpenPersonalizationModal}
              onModalCloseAction={handlePersonalizationModalClose}
            />
          </section>

          {/* Address Book Section */}
          <section style={{ marginTop: "2rem" }}>
            <div style={sectionHeaderStyles}>
              <h2 style={sectionTitleStyles}>Saved Delivery Addresses</h2>
              <button onClick={handleOpenAddModal} className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
                <Plus size={16} style={{ marginRight: "0.35rem" }} /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div style={emptyAddressStyles}>
                <MapPin size={36} color="var(--text-muted)" style={{ marginBottom: "0.5rem" }} />
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-main)" }}>No delivery addresses saved yet.</p>
                <p style={{ margin: "0.25rem 0 1rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  Add your home or work address for faster checkout.
                </p>
                <button onClick={handleOpenAddModal} className="btn-secondary" style={{ fontSize: "0.875rem" }}>
                  Add Address
                </button>
              </div>
            ) : (
              <div style={addressGridStyles}>
                {addresses.map((address) => (
                  <div key={address._id} style={{ ...addressCardStyles, ...(address.isDefault ? defaultCardStyles : {}) }}>
                    {address.isDefault && (
                      <span style={defaultBadgeStyles}>
                        <ShieldCheck size={12} style={{ marginRight: "0.2rem" }} /> DEFAULT
                      </span>
                    )}

                    <h3 style={addressNameStyles}>{address.fullName}</h3>
                    <p style={addressTextStyles}>{address.street}</p>
                    <p style={addressTextStyles}>
                      {address.city}, {address.state} - {address.zipCode}
                    </p>
                    <p style={addressTextStyles}>{address.country}</p>
                    <p style={{ ...addressTextStyles, marginTop: "0.5rem", fontWeight: 500 }}>
                      Phone: {address.phone}
                    </p>

                    <div style={addressActionsStyles}>
                      <button onClick={() => handleOpenEditModal(address)} style={actionBtnStyles}>
                        <Edit3 size={14} style={{ marginRight: "0.25rem" }} /> Edit
                      </button>
                      <button
                        onClick={() => address._id && setAddressToDeleteId(address._id)}
                        style={{ ...actionBtnStyles, color: "#dc2626" }}
                      >
                        <Trash2 size={14} style={{ marginRight: "0.25rem" }} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "550px" }}>
            <div style={modalHeaderStyles}>
              <h3 style={modalTitleStyles}>
                {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={modalCloseBtnStyles}>×</button>
            </div>

            {formError && (
              <div style={errorBannerStyles}>
                <ShieldAlert size={16} style={{ marginRight: "0.5rem" }} /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveAddress}>
              <div style={formGridStyles}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Street Address / House No.</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Flat No, Building, Street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PIN Code / Zip Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="6-digit PIN"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2", flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="checkbox"
                    id="isDefaultCheckbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label htmlFor="isDefaultCheckbox" style={{ fontSize: "0.875rem", cursor: "pointer", fontWeight: 500 }}>
                    Set as default delivery address
                  </label>
                </div>
              </div>

              <div style={modalFooterStyles}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {addressToDeleteId && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "400px", textAlign: "center" }}>
            <ShieldAlert size={48} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Delete Address?</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", margin: "0 0 1.5rem" }}>
              Are you sure you want to delete this delivery address? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button onClick={() => setAddressToDeleteId(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleDeleteAddress(addressToDeleteId)} className="btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "450px" }}>
            <div style={modalHeaderStyles}>
              <h3 style={modalTitleStyles}>Add Funds to Wallet</h3>
              <button onClick={() => setIsAddFundsModalOpen(false)} style={modalCloseBtnStyles}>×</button>
            </div>

            {fundsError && (
              <div style={errorBannerStyles}>
                <ShieldAlert size={16} style={{ marginRight: "0.5rem" }} /> {fundsError}
              </div>
            )}

            <div style={{ margin: "1rem 0" }}>
              <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>Select or Enter Amount (₹)</label>
              
              {/* Quick Select Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                {["500", "1000", "2000", "5000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFundsAmount(preset)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "8px",
                      border: fundsAmount === preset ? "2px solid var(--primary)" : "1px solid var(--border)",
                      backgroundColor: fundsAmount === preset ? "rgba(79, 70, 229, 0.05)" : "transparent",
                      color: fundsAmount === preset ? "var(--primary)" : "var(--text-main)",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    + ₹{preset}
                  </button>
                ))}
              </div>

              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="Enter custom amount"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
              />
            </div>

            <div style={modalFooterStyles}>
              <button type="button" onClick={() => setIsAddFundsModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const num = Number(fundsAmount);
                  if (num > 0) handleAddWalletFunds(num);
                }} 
                disabled={walletLoading}
                className="btn-primary"
              >
                {walletLoading ? "Processing..." : "Confirm Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "400px", textAlign: "center", padding: "2rem" }}>
            <div style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem"
            }}>
              <ShieldCheck size={36} color="#10b981" />
            </div>

            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 0.5rem", color: "var(--text-main)" }}>
              Funds Added Successfully!
            </h3>

            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              Added <strong style={{ color: "#10b981" }}>+ ₹{successModalAmount.toLocaleString()}</strong> to your MarketNest wallet.
            </p>

            <div style={{ backgroundColor: "#f8fafc", padding: "0.85rem", borderRadius: "12px", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
              New Balance: <strong style={{ color: "var(--primary)" }}>₹{(user?.walletBalance || 0).toLocaleString()}</strong>
            </div>

            <button 
              onClick={() => setIsSuccessModalOpen(false)}
              className="btn-primary" 
              style={{ width: "100%" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Wallet History Modal */}
      <WalletHistoryModal
        isOpen={isWalletHistoryModalOpen}
        onClose={() => setIsWalletHistoryModalOpen(false)}
      />
    </div>
  );
};

// Styles
const profileHeaderCardStyles: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "20px",
  padding: "2rem",
  boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: "1px solid var(--border)",
};

const avatarStyles: React.CSSProperties = {
  width: "72px",
  height: "72px",
  borderRadius: "50%",
  backgroundColor: "rgba(79, 70, 229, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const profileDetailRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  marginTop: "0.35rem",
};

const profileEmailStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "var(--text-muted)",
  fontWeight: 500,
};

const walletWidgetStyles: React.CSSProperties = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.75rem 1.25rem",
  borderRadius: "16px",
  backgroundColor: "#f8fafc",
  border: "1px solid var(--border)",
};

const walletIconWrapperStyles: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  backgroundColor: "#e0e7ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const walletLabelStyles: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 800,
  color: "var(--text-muted)",
  letterSpacing: "0.05em",
};

const walletBalanceStyles: React.CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: 800,
  color: "var(--text-main)",
};

const walletAddBtnStyles: React.CSSProperties = {
  marginLeft: "0.5rem",
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "var(--primary)",
  color: "white",
  fontWeight: 700,
  fontSize: "0.8rem",
  cursor: "pointer",
};

const historyCardContainerStyles: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "20px",
  padding: "1.5rem",
  boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
  border: "1px solid var(--border)",
};

const transactionItemStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.85rem 1rem",
  borderRadius: "12px",
  backgroundColor: "#f8fafc",
  border: "1px solid #f1f5f9",
};

const txIconWrapperStyles: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const txDescriptionStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "var(--text-main)",
};

const txDateStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted)",
  fontWeight: 500,
};

const txBalanceAfterStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 600,
};

const sectionHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 800,
  color: "var(--text-main)",
  margin: 0,
};

const emptyAddressStyles: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "20px",
  padding: "3rem 2rem",
  textAlign: "center",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
};

const addressGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "1.5rem",
};

const addressCardStyles: React.CSSProperties = {
  backgroundColor: "white",
  borderRadius: "16px",
  padding: "1.5rem",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
  position: "relative",
  display: "flex",
  flexDirection: "column",
};

const defaultCardStyles: React.CSSProperties = {
  border: "2px solid var(--primary)",
  backgroundColor: "rgba(79, 70, 229, 0.02)",
};

const defaultBadgeStyles: React.CSSProperties = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  fontSize: "0.65rem",
  fontWeight: 800,
  color: "var(--primary)",
  backgroundColor: "rgba(79, 70, 229, 0.1)",
  padding: "0.2rem 0.5rem",
  borderRadius: "6px",
  display: "flex",
  alignItems: "center",
};

const addressNameStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "var(--text-main)",
  margin: "0 0 0.5rem",
};

const addressTextStyles: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--text-muted)",
  margin: "0 0 0.2rem",
};

const addressActionsStyles: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  marginTop: "auto",
  paddingTop: "1rem",
  borderTop: "1px solid var(--border)",
};

const actionBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontWeight: 600,
  fontSize: "0.85rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 0,
};

const modalHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
};

const modalTitleStyles: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 800,
  color: "var(--text-main)",
  margin: 0,
};

const modalCloseBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
  color: "var(--text-muted)",
};

const errorBannerStyles: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fee2e2",
  color: "#dc2626",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  marginBottom: "1.25rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

const formGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
};

const modalFooterStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
  marginTop: "1.5rem",
};
