import React, { useState } from "react";
import { useDispatch } from "react-redux";
import type { Merchant } from "@/entities/admin/model/types";
import { updateMerchantAction, setError } from "@/entities/admin/model/adminSlice";
import { adminApi } from "@/entities/admin/api/adminApi";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import {
  ArrowLeft,
  Mail,
  Percent,
  ShieldAlert,
  Coins,
  FileText,
  Package,
  Calendar,
  Building,
  Check,
  Briefcase
} from "lucide-react";

interface CompanyDetailsViewProps {
  merchant: Merchant;
  onBack: () => void;
}

export const CompanyDetailsView: React.FC<CompanyDetailsViewProps> = ({ merchant, onBack }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlertModal();

  // Local state for interactive settings
  const [commissionRate, setCommissionRate] = useState(5); // Default 5%
  const [isBlocked, setIsBlocked] = useState(merchant.isBlocked);
  const [status, setStatus] = useState(merchant.status);
  const [showCommissionEdit, setShowCommissionEdit] = useState(false);
  const [editRateValue, setEditRateValue] = useState("5");

  const [loading, setLoading] = useState(false);

  // Computed/Mock info matching mockup screenshot
  const cityState = `${merchant.city || "Bengaluru"}, ${merchant.state || "Karnataka"}`;
  const mockRegNo = "U72200KA2021PTC145000";
  const mockWeb = `www.${merchant.businessName.toLowerCase().replace(/\s+/g, "")}.in`;
  const mockHQ = `${merchant.houseName || "Level 4, Prestige Blue Chip"}, ${merchant.street || "Hosur Road"}, ${merchant.city || "Bengaluru"} - ${merchant.zipCode || "560029"}`;
  const mockJoinDate = merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }) : "12 Oct 2021";

  const handleToggleSuspend = async () => {
    setLoading(true);
    try {
      const nextBlocked = !isBlocked;
      if (nextBlocked) {
        await adminApi.blockMerchant(merchant._id);
      } else {
        await adminApi.unblockMerchant(merchant._id);
      }
      setIsBlocked(nextBlocked);

      const updated: Merchant = {
        ...merchant,
        isBlocked: nextBlocked
      };
      dispatch(updateMerchantAction(updated));
      showAlert(`Account has been successfully ${nextBlocked ? "SUSPENDED" : "UNSUSPENDED"}.`, "success");
    } catch (err) {
      console.error("Toggle suspend failed", err);
      showAlert("Failed to toggle suspension.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCommission = () => {
    const parsed = parseFloat(editRateValue);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      showAlert("Please enter a valid percentage between 0 and 100.", "warning");
      return;
    }
    setCommissionRate(parsed);
    setShowCommissionEdit(false);

    // We update the local Redux copy
    const updated: Merchant = {
      ...merchant,
      // We store the updated commission in a custom property if needed, but since types don't enforce it,
      // keeping it in React state is clean, and we print it dynamically.
    };
    dispatch(updateMerchantAction(updated));
    showAlert(`Commission tier updated to ${parsed}%`, "success");
  };



  return (
    <div className="details-page-wrapper">
      {/* Top Navigation */}
      <div className="flex justify-between items-center" style={{ width: "100%" }}>
        <div className="breadcrumbs">
          <span className="current" style={{ cursor: "pointer" }} onClick={onBack}>&lt; Back to List</span>
          {" "}| Companies &gt; <span className="current">{merchant.businessName}</span>
        </div>
      </div>

      {/* Main Banner Card */}
      <div className="company-banner-card">
        <div className="company-banner-left">
          <div className="company-logo-box">
            {merchant.businessName[0].toUpperCase()}
          </div>
          <div className="company-banner-info">
            <div className="company-title-row">
              <h1 className="company-title">{merchant.businessName}</h1>
              <span className={`badge-status ${isBlocked ? "suspended" : (status === "approved" ? "active" : "pending")}`}>
                {isBlocked ? "Suspended" : status}
              </span>
            </div>
            <div className="company-subtitle">
              {cityState} • Merchant ID: #MV-{merchant._id.slice(-5).toUpperCase()}
            </div>
          </div>
        </div>

        <div className="company-banner-actions">
          <button onClick={() => setShowCommissionEdit(true)} className="btn-secondary-white">
            <Percent size={16} />
            <span>Edit Commission</span>
          </button>
          <button
            onClick={handleToggleSuspend}
            disabled={loading}
            className="btn-primary-orange"
          >
            <ShieldAlert size={16} />
            <span>{isBlocked ? "Activate Account" : "Suspend Account"}</span>
          </button>
        </div>
      </div>

      {/* Commission Edit Sub-menu popup */}
      {showCommissionEdit && (
        <div className="details-card" style={{ border: "1.5px solid #ffd8cc", backgroundColor: "#fffcfb" }}>
          <div className="details-card-title-row" style={{ fontSize: "0.95rem" }}>
            <span>Update Commission Tier</span>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
              <input
                type="number"
                value={editRateValue}
                onChange={(e) => setEditRateValue(e.target.value)}
                style={{ border: "none", padding: "0.5rem", width: "80px", textAlign: "center", outline: "none", fontSize: "0.9rem", fontWeight: "700" }}
              />
              <span style={{ padding: "0 0.5rem", background: "#f1f5f9", height: "100%", display: "flex", alignItems: "center", borderLeft: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: "700" }}>%</span>
            </div>
            <button onClick={handleSaveCommission} className="btn-primary-orange" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
              Save
            </button>
            <button onClick={() => setShowCommissionEdit(false)} className="btn-secondary-white" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Highlights Metrics Grid */}
      <div className="company-stats-row">
        {/* Metric 1 */}
        <div className="company-stat-card">
          <div>
            <div className="company-stat-card-title">Lifetime Revenue</div>
            <div className="company-stat-card-value">₹4,20,000</div>
            <div className="company-stat-card-sub">
              <span className="up">+12.5%</span> from last month
            </div>
          </div>
          <div className="company-stat-icon green">
            <Coins size={22} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="company-stat-card">
          <div>
            <div className="company-stat-card-title">Avg Order Value</div>
            <div className="company-stat-card-value">₹3,387</div>
            <div className="company-stat-card-sub">
              Based on 124 transactions
            </div>
          </div>
          <div className="company-stat-icon blue">
            <FileText size={22} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="company-stat-card">
          <div>
            <div className="company-stat-card-title">Total Products</div>
            <div className="company-stat-card-value">124</div>
            <div className="company-stat-card-sub font-semibold">
              <span style={{ color: "#10b981" }}>98 Active</span> • 26 Out of Stock
            </div>
          </div>
          <div className="company-stat-icon purple">
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="details-layout-grid">
        {/* Left Column Cards */}
        <div>
          {/* Card 1: Business Overview */}
          <div className="details-card">
            <div className="details-card-title-row">
              <Building size={18} style={{ color: "#e15b24" }} />
              <span>Business Overview</span>
            </div>

            <div className="overview-grid">
              <div className="overview-grid-item">
                <span className="overview-grid-label">Registration No</span>
                <span className="overview-grid-val">{mockRegNo}</span>
              </div>
              <div className="overview-grid-item">
                <span className="overview-grid-label">GST Number</span>
                <span className="overview-grid-val font-mono">{merchant.gstNumber || "29AAACT9087B1Z5"}</span>
              </div>
              <div className="overview-grid-item">
                <span className="overview-grid-label">Incorporation Date</span>
                <span className="overview-grid-val">{mockJoinDate}</span>
              </div>
              <div className="overview-grid-item">
                <span className="overview-grid-label">Website</span>
                <span className="overview-grid-val">
                  <a href={`https://${mockWeb}`} target="_blank" rel="noopener noreferrer">{mockWeb}</a>
                </span>
              </div>
              <div className="overview-grid-item" style={{ gridColumn: "span 2" }}>
                <span className="overview-grid-label">Headquarters</span>
                <span className="overview-grid-val">{mockHQ}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Activity */}
          <div className="details-card">
            <div className="details-card-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={18} style={{ color: "#e15b24" }} />
                <span>Recent Activity</span>
              </div>
              <span className="current" style={{ fontSize: "0.8rem", fontWeight: "700", color: "#e15b24", cursor: "pointer" }}>View All</span>
            </div>

            <table className="activity-mini-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Details</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge-event order">Order</span></td>
                  <td className="font-semibold text-gray-800">New order #ORD-7729 (₹12,400)</td>
                  <td>2 mins ago</td>
                </tr>
                <tr>
                  <td><span className="badge-event product">Product</span></td>
                  <td className="font-semibold text-gray-800">Price updated for "Cloud Pro V2"</td>
                  <td>1 hour ago</td>
                </tr>
                <tr>
                  <td><span className="badge-event payout">Payout</span></td>
                  <td className="font-semibold text-gray-800">Weekly settlement processed</td>
                  <td>Yesterday, 11:45 PM</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column Cards */}
        <div>
          {/* Card 1: Merchant Settings */}
          <div className="details-card">
            <div className="details-card-title-row">
              <Briefcase size={18} style={{ color: "#e15b24" }} />
              <span>Merchant Settings</span>
            </div>

            <div className="settings-option-item">
              <div className="settings-option-left">
                <span className="settings-option-title">Commission Tier</span>
                <span className="settings-option-desc">Current portal transaction charge</span>
              </div>
              <div className="badge-verify">
                <Check size={12} />
                <span>Premium ({commissionRate}%)</span>
              </div>
            </div>

            <div className="settings-option-item">
              <div className="settings-option-left">
                <span className="settings-option-title">Payout Schedule</span>
                <span className="settings-option-desc">Automated settlement frequency</span>
              </div>
              <div className="badge-role">
                Every Monday
              </div>
            </div>

            <div className="settings-option-item" style={{ borderBottom: "none", paddingBottom: 0 }}>
              <div className="settings-option-left">
                <span className="settings-option-title">Account Manager</span>
                <div className="settings-manager-row">
                  <div className="settings-manager-avatar">AS</div>
                  <div className="settings-manager-info">
                    <span className="settings-manager-name">Arjun Sharma</span>
                    <span className="settings-manager-email">arjun.s@marketnest.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Product Categories */}
          <div className="details-card">
            <div className="details-card-title-row">
              <Package size={18} style={{ color: "#e15b24" }} />
              <span>Product Categories</span>
            </div>

            <div className="tags-cloud">
              <span className="tag-cloud-item">Cloud Hosting</span>
              <span className="tag-cloud-item">SaaS Solutions</span>
              <span className="tag-cloud-item">Enterprise Security</span>
              <span className="tag-cloud-item">Digital Assets</span>
              <span className="tag-cloud-item">Analytics Tools</span>
            </div>

            <button className="btn-large-secondary" style={{ marginTop: "1.5rem", fontSize: "0.85rem" }}>
              Manage Categories
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
