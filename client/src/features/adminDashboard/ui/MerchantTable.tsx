import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import type { Merchant } from "@/entities/admin/model/types";
import { adminApi } from "@/entities/admin/api/adminApi";
import { updateMerchantBlockStatus, updateMerchantStatus, addMerchantAction, updateMerchantAction } from "@/entities/admin/model/adminSlice";
import { Modal } from "@/shared/ui/Modal";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import { MerchantApprovalActions } from "./MerchantApprovalActions";
import { orderApi } from "@/entities/order/api/orderApi";
import { MSG_FAILED_LOAD_MERCHANT_SALES } from "@/shared/constants/messages";
import { 
  ShieldAlert, 
  ShieldCheck, 
  History, 
  Eye, 
  Settings, 
  Search, 
  Download, 
  Plus, 
  Ban, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X
} from "lucide-react";

interface SaleItemProduct {
  name?: string;
  [key: string]: unknown;
}

interface SaleItem {
  priceSnapshot: number;
  quantity: number;
  product?: SaleItemProduct;
}

interface Sale {
  orderId: string;
  createdAt?: string | Date;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
}

const getMerchantIndustry = (m: Merchant): string => {
  const name = m.businessName.toLowerCase();
  if (name.includes("fab") || name.includes("trend") || name.includes("style")) {
    return "Retail";
  }
  if (name.includes("global") || name.includes("grocery")) {
    return "Manufacturing";
  }
  return "Technology";
};

const getMerchantIndustryClass = (industry: string): string => {
  if (industry === "Retail") return "purple";
  if (industry === "Manufacturing") return "orange";
  return "blue";
};

interface MerchantTableProps {
  merchants: Merchant[];
  onViewMerchant: (merchant: Merchant) => void;
}

export const MerchantTable: React.FC<MerchantTableProps> = ({ merchants, onViewMerchant }) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlertModal();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>(merchants);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Onboard Company modal
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    gstNumber: "",
    industry: "Technology"
  });

  // Commission Edit Modal
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [commMerchant, setCommMerchant] = useState<Merchant | null>(null);
  const [commissionRate, setCommissionRate] = useState("5");

  // States for sales history audit modal
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesMerchant, setSalesMerchant] = useState<Merchant | null>(null);
  const [merchantSales, setMerchantSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState<string | null>(null);

  useEffect(() => {
    let result = merchants;

    // Apply Search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(m => 
        m.businessName.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q) ||
        m.gstNumber.toLowerCase().includes(q) ||
        m._id.includes(q)
      );
    }

    // Apply Industry Filter
    if (industryFilter !== "All") {
      result = result.filter(m => getMerchantIndustry(m) === industryFilter);
    }

    // Apply Status Filter
    if (statusFilter !== "All") {
      result = result.filter(m => {
        if (statusFilter === "Suspended") return m.isBlocked;
        return m.status === statusFilter.toLowerCase() && !m.isBlocked;
      });
    }

    setFilteredMerchants(result);
    setCurrentPage(1);
  }, [merchants, searchQuery, statusFilter, industryFilter]);

  const totalItems = filteredMerchants.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedMerchants = filteredMerchants.slice(startIndex, endIndex);

  const handleToggleBlock = async () => {
    if (!selectedMerchant) return;
    
    setLoading(true);
    try {
      if (selectedMerchant.isBlocked) {
        await adminApi.unblockMerchant(selectedMerchant._id);
        dispatch(updateMerchantBlockStatus({ id: selectedMerchant._id, isBlocked: false }));
      } else {
        await adminApi.blockMerchant(selectedMerchant._id);
        dispatch(updateMerchantBlockStatus({ id: selectedMerchant._id, isBlocked: true }));
      }
      setShowBlockModal(false);
      setSelectedMerchant(null);
    } catch (err) {
      showAlert("Failed to update merchant status", "error");
    } finally {
      setLoading(false);
    }
  };

  const openBlockModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setShowBlockModal(true);
  };

  const openSalesModal = async (merchant: Merchant) => {
    setSalesMerchant(merchant);
    setShowSalesModal(true);
    setSalesLoading(true);
    setSalesError(null);
    setMerchantSales([]);
    try {
      const res = await orderApi.getAdminMerchantHistory(merchant._id);
      setMerchantSales(res.data);
    } catch (err: any) {
      setSalesError(err.response?.data?.message || MSG_FAILED_LOAD_MERCHANT_SALES);
    } finally {
      setSalesLoading(false);
    }
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.businessName || !onboardForm.ownerName || !onboardForm.email || !onboardForm.gstNumber) return;

    const newlyCreated: Merchant = {
      _id: "mch-" + Math.random().toString(36).substr(2, 9),
      businessName: onboardForm.businessName,
      ownerName: onboardForm.ownerName,
      email: onboardForm.email,
      phone: onboardForm.phone || "+91 99999 88888",
      gstNumber: onboardForm.gstNumber,
      status: "approved",
      isAdminVerified: true,
      isBlocked: false,
      houseName: "Office Suite 12",
      street: "Koramangala Ring Road",
      locality: "Block 4",
      city: "Bengaluru",
      state: "Karnataka",
      zipCode: "560034",
      country: "India",
      createdAt: new Date().toISOString()
    };

    dispatch(addMerchantAction(newlyCreated));
    showAlert("New company has been successfully onboarded!", "success");
    setOnboardForm({
      businessName: "",
      ownerName: "",
      email: "",
      phone: "",
      gstNumber: "",
      industry: "Technology"
    });
    setShowOnboardModal(false);
  };

  const openCommissionModal = (merchant: Merchant) => {
    setCommMerchant(merchant);
    setShowCommissionModal(true);
  };

  const handleSaveCommission = () => {
    if (!commMerchant) return;
    showAlert(`Commission level updated to ${commissionRate}% for ${commMerchant.businessName}`, "success");
    setShowCommissionModal(false);
    setCommMerchant(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
      {/* Top Header */}
      <div className="dash-header-row" style={{ marginBottom: 0 }}>
        <div className="dash-title-block">
          <h1 style={{ fontSize: "1.5rem" }}>Company Management</h1>
          <p>Manage, verify and monitor enterprise merchant accounts.</p>
        </div>
        <div className="dash-header-actions-btn-group">
          <button className="btn-secondary-white">
            <Download size={16} />
            <span>Export Data</span>
          </button>
          <button onClick={() => setShowOnboardModal(true)} className="btn-primary-orange">
            <Plus size={16} />
            <span>Onboard Company</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-filter-bar">
        <div className="admin-search-bar" style={{ flex: 1, minWidth: "260px" }}>
          <Search size={16} style={{ color: "#94a3b8" }} />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by Company ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
          value={industryFilter} 
          onChange={(e) => setIndustryFilter(e.target.value)} 
          className="filter-select"
        >
          <option value="All">Industry: All</option>
          <option value="Technology">Technology</option>
          <option value="Retail">Retail</option>
          <option value="Manufacturing">Manufacturing</option>
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)} 
          className="filter-select"
        >
          <option value="All">Status: All Accounts</option>
          <option value="Approved">Active</option>
          <option value="Pending">Pending</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1">
        <div className="flex-grow overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider" style={{ borderLeft: "4px solid transparent" }}>Company Details</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMerchants.map((m) => {
                // Get industry details
                const indTag = getMerchantIndustry(m);
                const indClass = getMerchantIndustryClass(indTag);

                // Mock statistics values
                const revenueMock = m.isBlocked ? "₹0.00" : "₹4,20,500";
                const productsCountMock = m.isBlocked ? "0 Products" : "124 Products";

                // Joined status pill
                const statusPill = m.isBlocked ? "suspended" : (m.status === "approved" ? "active" : "pending");

                return (
                  <tr key={m._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4" style={{ borderLeft: `4px solid ${m.isBlocked ? "#ef4444" : "#e15b24"}` }}>
                      <div className="table-user-cell">
                        <button
                          onClick={() => onViewMerchant(m)}
                          className="user-avatar-circle orange hover:opacity-80 transition-opacity cursor-pointer border-none"
                          style={{ borderRadius: "8px", backgroundColor: "#fff1eb", color: "#e15b24", padding: 0 }}
                          title={`View details for ${m.businessName}`}
                        >
                          {m.businessName[0].toUpperCase()}
                        </button>
                        <div className="table-user-info">
                          <span className="table-user-name">{m.businessName}</span>
                          <span className="table-user-id">ID: MN-{m._id.slice(-5).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`tag-cloud-item ${indClass}`} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>
                        {indTag}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="table-user-info">
                        <span className="table-user-name" style={{ fontSize: "0.875rem" }}>{revenueMock}</span>
                        <span className="table-user-id" style={{ fontSize: "0.72rem" }}>{productsCountMock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge-status ${statusPill}`}>
                        {m.isBlocked ? "Suspended" : m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onViewMerchant(m)}
                          className="table-action-btn"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {m.status === "pending" ? (
                          <MerchantApprovalActions merchantId={m._id} />
                        ) : (
                          <>
                            <button
                              onClick={() => openBlockModal(m)}
                              className={`table-action-btn ${m.isBlocked ? "" : "delete"}`}
                              title={m.isBlocked ? "Activate Merchant" : "Suspend Merchant"}
                            >
                              <Ban size={16} />
                            </button>
                            <button
                              onClick={() => openCommissionModal(m)}
                              className="table-action-btn"
                              title="Configure Settings"
                            >
                              <Settings size={16} />
                            </button>
                            <button
                              onClick={() => openSalesModal(m)}
                              className="table-action-btn"
                              title="Sales Audit"
                            >
                              <History size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMerchants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">No merchants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center px-6 py-4 bg-white border-t border-gray-200 mt-auto">
            <div className="text-sm text-slate-500 font-medium">
              Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} companies
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages <= 1}
                className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors outline-none text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Onboard Company Modal */}
      {showOnboardModal && (
        <Modal
          isOpen={showOnboardModal}
          onClose={() => setShowOnboardModal(false)}
          title="Onboard Enterprise Company"
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowOnboardModal(false)}
                className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOnboardSubmit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-sm font-bold text-white rounded-lg transition-colors"
              >
                Confirm Onboarding
              </button>
            </div>
          }
        >
          <form onSubmit={handleOnboardSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Company Business Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={onboardForm.businessName}
                onChange={(e) => setOnboardForm({ ...onboardForm, businessName: e.target.value })}
              />
            </div>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-bold text-gray-600 mb-1">Owner Name *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={onboardForm.ownerName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-bold text-gray-600 mb-1">Industry Classification</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={onboardForm.industry}
                  onChange={(e) => setOnboardForm({ ...onboardForm, industry: e.target.value })}
                >
                  <option value="Technology">Technology</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-bold text-gray-600 mb-1">GST Number *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. 29AAACT9087B1Z5"
                  value={onboardForm.gstNumber}
                  onChange={(e) => setOnboardForm({ ...onboardForm, gstNumber: e.target.value })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="block text-xs font-bold text-gray-600 mb-1">Contact Phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="+91 99999 88888"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={onboardForm.email}
                onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Block Confirmation Modal */}
      {showBlockModal && (
        <Modal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          title={selectedMerchant?.isBlocked ? "Activate Merchant" : "Suspend Merchant"}
          footer={
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100 justify-end">
              <button 
                className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" 
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </button>
              <button 
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                  selectedMerchant?.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
                onClick={handleToggleBlock}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          }
        >
          <div className="p-6">
            <p className="text-gray-600 text-sm">
              Are you sure you want to {selectedMerchant?.isBlocked ? "activate" : "suspend"} the company <strong>{selectedMerchant?.businessName}</strong>?
              {!selectedMerchant?.isBlocked && " Their products will be hidden from the marketplace while suspended."}
            </p>
          </div>
        </Modal>
      )}

      {/* Quick Commission Edit Modal */}
      {showCommissionModal && commMerchant && (
        <Modal
          isOpen={showCommissionModal}
          onClose={() => setShowCommissionModal(false)}
          title={`Configure Commission: ${commMerchant.businessName}`}
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setShowCommissionModal(false)}
                className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCommission}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-sm font-bold text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-500 font-semibold">
              Adjust transaction commission tier charge for this merchant.
            </p>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", overflow: "hidden", background: "#fff", width: "120px" }}>
              <input 
                type="number" 
                value={commissionRate} 
                onChange={(e) => setCommissionRate(e.target.value)} 
                style={{ border: "none", padding: "0.5rem", width: "80px", textAlign: "center", outline: "none", fontSize: "0.9rem", fontWeight: "700" }} 
              />
              <span style={{ padding: "0 0.5rem", background: "#f1f5f9", height: "100%", display: "flex", alignItems: "center", borderLeft: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: "700" }}>%</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Sales History Modal */}
      <Modal
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        title={`Sales History: ${salesMerchant?.businessName}`}
        footer={
          <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button 
              className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" 
              onClick={() => setShowSalesModal(false)}
            >
              Close
            </button>
          </div>
        }
      >
        <div className="p-6" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {salesLoading ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-500 text-xs mt-3 font-semibold">Fetching transactions...</p>
            </div>
          ) : salesError ? (
            <p className="text-rose-600 text-sm font-semibold">{salesError}</p>
          ) : merchantSales.length === 0 ? (
            <p className="text-gray-400 italic text-center py-6">No sales recorded for this merchant.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {merchantSales.map((sale) => {
                const dateStr = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "N/A";
                return (
                  <div key={sale.orderId} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400">ORDER ID</span>
                        <div className="text-xs font-bold text-gray-800">#{sale.orderId}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-gray-400">EARNINGS</span>
                        <div className="text-xs font-extrabold text-indigo-600">₹{sale.subtotal.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-500 mb-1 font-medium">Placed on: {dateStr}</div>
                    <div className="text-[11px] text-gray-500 mb-2 font-medium">
                      Customer: <strong className="text-gray-700">{sale.customerName}</strong> ({sale.customerPhone})
                    </div>
                    
                    <div className="flex flex-col gap-2 mt-2">
                      {sale.items.map((item: SaleItem, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-gray-700">{item.product?.name || "Product Listing"}</span>
                          <span className="text-gray-500">
                            ₹{item.priceSnapshot} × {item.quantity} = <strong className="text-gray-800">₹{(item.priceSnapshot * item.quantity).toFixed(2)}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
