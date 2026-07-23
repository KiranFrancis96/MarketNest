import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Plus, 
  ShieldAlert,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { setUser } from "@/entities/user/model/userSlice";
import { userApi } from "@/entities/user/api/userApi";
import { orderApi, type WalletTransaction } from "@/entities/order/api/orderApi";

interface WalletHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletHistoryModal: React.FC<WalletHistoryModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "credit" | "debit">("all");

  // Add Funds Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [fundsAmount, setFundsAmount] = useState("1000");
  const [fundsError, setFundsError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await orderApi.getWalletHistory();
      if (res.data.success) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddFunds = async (amount: number) => {
    try {
      setAddLoading(true);
      setFundsError("");
      await orderApi.addWalletFunds(amount);
      
      const profileRes = await userApi.getProfile();
      dispatch(setUser(profileRes.data));
      
      await fetchTransactions();
      setIsAddModalOpen(false);
      setSuccessMsg(`Successfully added + ₹${amount.toLocaleString()} to your wallet!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Wallet fund error:", err);
      setFundsError(err.response?.data?.message || err.message || "Failed to add wallet funds");
    } finally {
      setAddLoading(false);
    }
  };

  const isCreditTx = (tx: WalletTransaction) =>
    tx.type?.toLowerCase() === "credit" ||
    tx.description?.toLowerCase().includes("credit") ||
    tx.description?.toLowerCase().includes("added") ||
    tx.description?.toLowerCase().includes("top-up") ||
    tx.description?.toLowerCase().includes("refund");

  const creditCount = transactions.filter(isCreditTx).length;
  const debitCount = transactions.length - creditCount;

  const filteredTransactions = transactions.filter((tx) => {
    if (activeFilter === "credit") return isCreditTx(tx);
    if (activeFilter === "debit") return !isCreditTx(tx);
    return true;
  });

  return (
    <div className="modal-overlay animate-fadeIn" style={overlayStyles}>
      <div className="modal-container animate-scaleUp" style={modalContainerStyles}>
        {/* Modal Header */}
        <div style={headerStyles}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={walletIconBoxStyles}>
              <Wallet size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0, color: "var(--text-main)" }}>
                MarketNest Wallet History
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                Track all credited refunds, top-ups, & order payments
              </span>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyles} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Balance Card */}
        <div style={balanceCardStyles}>
          <div>
            <span style={balanceLabelStyles}>AVAILABLE WALLET BALANCE</span>
            <div style={balanceValueStyles}>₹{(user?.walletBalance || 0).toFixed(2)}</div>
          </div>
          <button 
            onClick={() => {
              setFundsAmount("1000");
              setFundsError("");
              setIsAddModalOpen(true);
            }} 
            style={addFundsBtnStyles}
          >
            <Plus size={16} /> Add Funds
          </button>
        </div>

        {successMsg && (
          <div style={successBannerStyles}>
            <CheckCircle2 size={18} style={{ marginRight: "0.5rem", flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter Bar & Refresh */}
        <div style={filterRowStyles}>
          <div style={tabContainerStyles}>
            <button
              onClick={() => setActiveFilter("all")}
              style={{
                ...tabStyles,
                ...(activeFilter === "all" ? activeTabStyles : {})
              }}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setActiveFilter("credit")}
              style={{
                ...tabStyles,
                ...(activeFilter === "credit" ? activeTabStyles : {})
              }}
            >
              Credited ({creditCount})
            </button>
            <button
              onClick={() => setActiveFilter("debit")}
              style={{
                ...tabStyles,
                ...(activeFilter === "debit" ? activeTabStyles : {})
              }}
            >
              Debited ({debitCount})
            </button>
          </div>

          <button onClick={fetchTransactions} style={refreshBtnStyles} title="Refresh transactions">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Transaction History List */}
        <div style={listContainerStyles}>
          {loading ? (
            <div style={emptyLoadingStyles}>Loading transaction history...</div>
          ) : filteredTransactions.length === 0 ? (
            <div style={emptyLoadingStyles}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem" }}>
                No {activeFilter !== "all" ? activeFilter : ""} transactions found.
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Any credits, refunds, or payment debits will be recorded here automatically.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredTransactions.map((tx) => {
                const isCredit = isCreditTx(tx);
                return (
                  <div key={tx._id} style={txCardStyles}>
                    <div style={{
                      ...txBadgeStyles,
                      backgroundColor: isCredit ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                      color: isCredit ? "#10b981" : "#ef4444"
                    }}>
                      {isCredit ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span style={txTitleStyles}>{tx.description}</span>
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

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.35rem" }}>
                        <span style={txTimeStyles}>
                          {new Date(tx.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short"
                          })}
                        </span>
                        <span style={txBalanceStyles}>
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
      </div>

      {/* Add Funds Sub-Modal */}
      {isAddModalOpen && (
        <div style={{ ...overlayStyles, zIndex: 1100 }}>
          <div style={{ ...modalContainerStyles, maxWidth: "420px" }}>
            <div style={headerStyles}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0 }}>Add Funds to Wallet</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={closeBtnStyles}>×</button>
            </div>

            {fundsError && (
              <div style={errorBannerStyles}>
                <ShieldAlert size={16} style={{ marginRight: "0.5rem" }} /> {fundsError}
              </div>
            )}

            <div style={{ margin: "1rem 0" }}>
              <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>Select Amount (₹)</label>
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
                placeholder="Custom Amount"
                value={fundsAmount}
                onChange={(e) => setFundsAmount(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const num = Number(fundsAmount);
                  if (num > 0) handleAddFunds(num);
                }} 
                disabled={addLoading}
                className="btn-primary"
              >
                {addLoading ? "Processing..." : "Confirm Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const overlayStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.65)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem",
};

const modalContainerStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  width: "100%",
  maxWidth: "600px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  padding: "1.75rem",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  border: "1px solid var(--border)",
};

const headerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.25rem",
};

const walletIconBoxStyles: React.CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  backgroundColor: "rgba(79, 70, 229, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const closeBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text-muted)",
  cursor: "pointer",
  padding: "0.25rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
};

const balanceCardStyles: React.CSSProperties = {
  backgroundColor: "#0f172a",
  borderRadius: "16px",
  padding: "1.25rem 1.5rem",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.25rem",
  boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.3)",
};

const balanceLabelStyles: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 800,
  color: "#94a3b8",
  letterSpacing: "0.08em",
};

const balanceValueStyles: React.CSSProperties = {
  fontSize: "1.6rem",
  fontWeight: 800,
  color: "#ffffff",
  marginTop: "0.2rem",
};

const addFundsBtnStyles: React.CSSProperties = {
  backgroundColor: "var(--primary)",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "0.6rem 1.1rem",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
};

const successBannerStyles: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#047857",
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  marginBottom: "1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

const errorBannerStyles: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fee2e2",
  color: "#dc2626",
  padding: "0.75rem 1rem",
  borderRadius: "8px",
  marginBottom: "1rem",
  fontSize: "0.875rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

const filterRowStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const tabContainerStyles: React.CSSProperties = {
  display: "flex",
  gap: "0.35rem",
  backgroundColor: "#f1f5f9",
  padding: "0.25rem",
  borderRadius: "10px",
};

const tabStyles: React.CSSProperties = {
  border: "none",
  backgroundColor: "transparent",
  color: "var(--text-muted)",
  fontWeight: 600,
  fontSize: "0.8rem",
  padding: "0.35rem 0.75rem",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const activeTabStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "var(--primary)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
};

const refreshBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontWeight: 600,
  fontSize: "0.8rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
};

const listContainerStyles: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  paddingRight: "0.25rem",
  minHeight: "200px",
  maxHeight: "360px",
};

const emptyLoadingStyles: React.CSSProperties = {
  textAlign: "center",
  padding: "3rem 1rem",
  color: "var(--text-muted)",
};

const txCardStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  padding: "0.85rem 1rem",
  borderRadius: "14px",
  backgroundColor: "#f8fafc",
  border: "1px solid #f1f5f9",
};

const txBadgeStyles: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const txTitleStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "var(--text-main)",
};

const txTimeStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted)",
  fontWeight: 500,
};

const txBalanceStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#64748b",
  fontWeight: 600,
};
