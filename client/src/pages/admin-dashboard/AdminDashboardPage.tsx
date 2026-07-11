import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { adminApi } from "@/entities/admin/api/adminApi";
import { setUsers, setMerchants, setLoading } from "@/entities/admin/model/adminSlice";
import { UserTable } from "@/features/adminDashboard/ui/UserTable";
import { MerchantTable } from "@/features/adminDashboard/ui/MerchantTable";
import { AdminOverview } from "@/features/adminDashboard/ui/AdminOverview";
import { UserDetailsView } from "@/features/adminDashboard/ui/UserDetailsView";
import { CompanyDetailsView } from "@/features/adminDashboard/ui/CompanyDetailsView";
import { useAdminAuth } from "@/features/adminAuth/model/useAdminAuth";
import { ProductTable } from "@/shared/components/ProductTable";
import { Modal } from "@/shared/ui/Modal";
import { useAlertModal } from "@/shared/ui/AlertModalContext";
import type { User, Merchant } from "@/entities/admin/model/types";
import {
  fetchCatalog,
  toggleBlockProduct,
  fetchCategories,
  createCategory,
  addSubcategory,
} from "@/features/product/model/productSlice";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CheckSquare, 
  Coins, 
  Trophy, 
  DollarSign, 
  Percent, 
  Eye, 
  FileText, 
  Settings, 
  Layers, 
  Bell, 
  MessageSquare, 
  Search, 
  LogOut,
  ChevronDown
} from "lucide-react";

type TabOption = 
  | "dashboard" 
  | "users" 
  | "user-details" 
  | "merchants" 
  | "merchant-details" 
  | "coins"
  | "competitions"
  | "revenue"
  | "commission"
  | "insights"
  | "reports"
  | "settings"
  | "categories"
  | "products";

const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { admin, users, merchants, isLoading } = useSelector((state: RootState) => state.admin);
  const { catalogFeed, categories } = useSelector((state: RootState) => state.product);
  const { logout } = useAdminAuth();
  const { showAlert } = useAlertModal();

  const [activeTab, setActiveTab] = useState<TabOption>("dashboard");
  const [merchantFilter, setMerchantFilter] = useState("all");

  // Selected entities for detail pages
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Search input state
  const [searchVal, setSearchVal] = useState("");

  // State for blocking/unblocking confirmation modal
  const [confirmBlock, setConfirmBlock] = useState<{ id: string; block: boolean } | null>(null);

  // Category manager states
  const [newCatName, setNewCatName] = useState("");
  const [newSubcats, setNewSubcats] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [newSubName, setNewSubName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "users" || activeTab === "dashboard") {
        dispatch(setLoading(true));
        try {
          const res = await adminApi.getUsers();
          dispatch(setUsers(res.data));
        } catch (err: unknown) {
          console.error("Fetch users error", err);
        } finally {
          dispatch(setLoading(false));
        }
      } 
      
      if (activeTab === "merchants" || activeTab === "dashboard") {
        dispatch(setLoading(true));
        try {
          const res = await adminApi.getMerchants(merchantFilter);
          dispatch(setMerchants(res.data));
        } catch (err: unknown) {
          console.error("Fetch merchants error", err);
        } finally {
          dispatch(setLoading(false));
        }
      } 
      
      if (activeTab === "products") {
        dispatch(fetchCatalog({ limit: 100 }));
      } else if (activeTab === "categories") {
        dispatch(fetchCategories());
      }
    };
    fetchData();
  }, [activeTab, merchantFilter, dispatch]);

  if (!admin) return null;

  const sidebarMenu = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "merchants", label: "Company Management", icon: Building2 },
    { id: "coins", label: "Coin & Rewards Plans", icon: Coins },
    { id: "competitions", label: "Competitions", icon: Trophy },
    { id: "revenue", label: "Revenue Management", icon: DollarSign },
    { id: "commission", label: "Commission Negotiations", icon: Percent },
    { id: "insights", label: "Buying Insights", icon: Eye },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "categories", label: "Store Categories", icon: Layers },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <a href="/admin/dashboard" className="admin-sidebar-logo">
            <Building2 size={24} style={{ color: "var(--admin-orange)" }} />
            <span>MarketNest Admin</span>
          </a>
        </div>

        <nav className="admin-sidebar-menu">
          {sidebarMenu.map((item) => {
            const Icon = item.icon;
            // Determine active highlight
            const isTabActive = activeTab === item.id || 
              (item.id === "users" && activeTab === "user-details") ||
              (item.id === "merchants" && activeTab === "merchant-details");
              
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "merchants") {
                    setMerchantFilter("all");
                  }
                  setActiveTab(item.id as TabOption);
                }}
                className={`admin-menu-item ${isTabActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={logout}
            className="admin-menu-item"
            style={{ color: "#ef4444" }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="admin-search-bar">
            <Search size={16} style={{ color: "#94a3b8" }} />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search users, companies, orders..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>

          <div className="admin-header-actions">
            <button className="admin-header-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="admin-notification-dot"></span>
            </button>
            <button className="admin-header-btn" aria-label="Messages">
              <MessageSquare size={20} />
            </button>
            
            <div className="admin-profile-card">
              <div className="admin-profile-info">
                <span className="admin-profile-name">{admin.firstName} {admin.lastName}</span>
                <span className="admin-profile-role">Super Admin</span>
              </div>
              <div className="admin-profile-avatar" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontStyle: "normal", fontWeight: "700", color: "#e15b24", background: "#fff1eb" }}>
                {admin.firstName[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content Panel */}
        <main className="admin-content">
          {isLoading && activeTab !== "dashboard" && activeTab !== "user-details" && activeTab !== "merchant-details" ? (
            <div className="flex justify-center items-center py-40">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Dashboard tab */}
              {activeTab === "dashboard" && (
                <AdminOverview 
                  onNavigate={(tab) => {
                    if (tab === "merchants") {
                      setMerchantFilter("all");
                    }
                    setActiveTab(tab as TabOption);
                  }}
                  totalUsersCount={users.length}
                  totalMerchantsCount={merchants.length}
                  totalProductsCount={catalogFeed?.products?.length || 85400}
                />
              )}

              {/* User management tab */}
              {activeTab === "users" && (
                <UserTable 
                  users={users} 
                  onEditUser={(user) => {
                    setSelectedUser(user);
                    setActiveTab("user-details");
                  }} 
                />
              )}

              {/* User edit subpage */}
              {activeTab === "user-details" && selectedUser && (
                <UserDetailsView 
                  user={selectedUser} 
                  onBack={() => {
                    setSelectedUser(null);
                    setActiveTab("users");
                  }} 
                />
              )}

              {/* Merchant management tab */}
              {activeTab === "merchants" && (
                <MerchantTable 
                  merchants={merchants} 
                  onViewMerchant={(m) => {
                    setSelectedMerchant(m);
                    setActiveTab("merchant-details");
                  }} 
                />
              )}

              {/* Merchant details subpage */}
              {activeTab === "merchant-details" && selectedMerchant && (
                <CompanyDetailsView 
                  merchant={selectedMerchant} 
                  onBack={() => {
                    setSelectedMerchant(null);
                    setActiveTab("merchants");
                  }} 
                />
              )}

              {/* Unused tabs placeholders for visual mockup fidelity */}
              {(activeTab === "coins" || 
                activeTab === "competitions" || 
                activeTab === "revenue" || 
                activeTab === "commission" || 
                activeTab === "insights" || 
                activeTab === "reports" || 
                activeTab === "settings") && (
                <div className="dash-card text-center py-20">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Management Module</h2>
                  <p className="text-gray-500 text-sm">
                    This section represents the <strong>{sidebarMenu.find(m => m.id === activeTab)?.label}</strong> portal and is currently under scheduled development.
                  </p>
                </div>
              )}

              {/* Store Classification Categories tab */}
              {activeTab === "categories" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div className="dash-card">
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Create New Category</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newCatName) return;
                        const subArr = newSubcats.split(",").map(s => s.trim()).filter(Boolean);
                        try {
                          await dispatch(createCategory({ name: newCatName, subcategories: subArr })).unwrap();
                          setNewCatName("");
                          setNewSubcats("");
                          showAlert("Category created successfully!", "success");
                        } catch (err: unknown) {
                          showAlert(typeof err === "string" ? err : (err instanceof Error ? err.message : "Failed to create category"), "error");
                        }
                      }}>
                        <div className="form-group" style={{ marginBottom: "1rem" }}>
                          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>Category Name *</label>
                          <input
                            type="text"
                            className="details-form-input"
                            style={{ width: "100%", boxSizing: "border-box" }}
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: "1rem" }}>
                          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>Subcategories (comma-separated)</label>
                          <input
                            type="text"
                            className="details-form-input"
                            style={{ width: "100%", boxSizing: "border-box" }}
                            placeholder="e.g. Shoes, Shirts, Pants"
                            value={newSubcats}
                            onChange={(e) => setNewSubcats(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="btn-primary-orange" style={{ width: "100%", marginTop: "0.5rem", padding: "0.625rem", borderRadius: "8px", justifyContent: "center" }}>
                          Add Category
                        </button>
                      </form>
                    </div>

                    <div className="dash-card">
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Add Subcategory</h3>
                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedCat || !newSubName) return;
                        try {
                          await dispatch(addSubcategory({ name: selectedCat, subcategoryName: newSubName })).unwrap();
                          setNewSubName("");
                          showAlert("Subcategory added successfully!", "success");
                        } catch (err: unknown) {
                          showAlert(typeof err === "string" ? err : (err instanceof Error ? err.message : "Failed to add subcategory"), "error");
                        }
                      }}>
                        <div className="form-group" style={{ marginBottom: "1rem" }}>
                          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>Select Category *</label>
                          <select
                            className="details-form-input"
                            style={{ width: "100%", boxSizing: "border-box" }}
                            value={selectedCat}
                            onChange={(e) => setSelectedCat(e.target.value)}
                            required
                          >
                            <option value="">Choose category</option>
                            {categories.map((c) => (
                              <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: "1rem" }}>
                          <label className="form-label" style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>Subcategory Name *</label>
                          <input
                            type="text"
                            className="details-form-input"
                            style={{ width: "100%", boxSizing: "border-box" }}
                            value={newSubName}
                            onChange={(e) => setNewSubName(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="btn-primary-orange" style={{ width: "100%", marginTop: "0.5rem", padding: "0.625rem", borderRadius: "8px", justifyContent: "center" }}>
                          Add Subcategory
                        </button>
                      </form>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Store Classification</h3>
                    {categories.length === 0 ? (
                      <div style={{ padding: "3rem", background: "white", border: "1px dashed var(--border)", borderRadius: "16px", textAlign: "center", color: "var(--text-muted)" }}>
                        No categories created yet.
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat._id} style={{ background: "white", padding: "1.25rem", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.5rem" }}>{cat.name}</h4>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                            {cat.subcategories.length === 0 ? (
                              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No subcategories</span>
                            ) : (
                              cat.subcategories.map((sub) => (
                                <span key={sub} style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", background: "#f1f5f9", borderRadius: "6px", fontWeight: 600 }}>{sub}</span>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {confirmBlock && (
        <Modal
          isOpen={!!confirmBlock}
          onClose={() => setConfirmBlock(null)}
          title={confirmBlock.block ? "Block Product" : "Unblock Product"}
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setConfirmBlock(null)}
                className="px-4 py-2 border border-gray-200 text-sm font-bold text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  dispatch(toggleBlockProduct({ id: confirmBlock.id, isBlocked: confirmBlock.block }));
                  setConfirmBlock(null);
                }}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${
                  confirmBlock.block ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                Confirm
              </button>
            </div>
          }
        >
          <div className="p-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              Are you sure you want to <strong>{confirmBlock.block ? "BLOCK" : "UNBLOCK"}</strong> this product?
              {confirmBlock.block && " Once blocked, it will not be shown to customers in the marketplace."}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboardPage;
