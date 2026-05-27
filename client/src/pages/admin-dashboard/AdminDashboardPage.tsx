import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { adminApi } from "@/entities/admin/api/adminApi";
import { setUsers, setMerchants, setLoading } from "@/entities/admin/model/adminSlice";
import { UserTable } from "@/features/adminDashboard/ui/UserTable";
import { MerchantTable } from "@/features/adminDashboard/ui/MerchantTable";
import { useAdminAuth } from "@/features/adminAuth/model/useAdminAuth";
import { ProductTable } from "@/shared/components/ProductTable";
import {
  fetchCatalog,
  toggleBlockProduct,
  fetchCategories,
  createCategory,
  addSubcategory,
} from "@/features/product/model/productSlice";

const AdminDashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { admin, users, merchants, isLoading } = useSelector((state: RootState) => state.admin);
  const { catalogFeed, categories } = useSelector((state: RootState) => state.product);
  const { logout } = useAdminAuth();
  
  const [activeTab, setActiveTab] = useState<"users" | "merchants" | "products" | "categories">("users");
  const [merchantFilter, setMerchantFilter] = useState("all");

  // Category manager states
  const [newCatName, setNewCatName] = useState("");
  const [newSubcats, setNewSubcats] = useState("");
  const [selectedCat, setSelectedCat] = useState("");
  const [newSubName, setNewSubName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "users") {
        dispatch(setLoading(true));
        try {
          const res = await adminApi.getUsers();
          dispatch(setUsers(res.data));
        } catch (err) {
          console.error("Fetch users error", err);
        } finally {
          dispatch(setLoading(false));
        }
      } else if (activeTab === "merchants") {
        dispatch(setLoading(true));
        try {
          const res = await adminApi.getMerchants(merchantFilter);
          dispatch(setMerchants(res.data));
        } catch (err) {
          console.error("Fetch merchants error", err);
        } finally {
          dispatch(setLoading(false));
        }
      } else if (activeTab === "products") {
        dispatch(fetchCatalog({ limit: 100 }));
      } else if (activeTab === "categories") {
        dispatch(fetchCategories());
      }
    };
    fetchData();
  }, [activeTab, merchantFilter, dispatch]);

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar/Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Console</h1>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-gray-500 font-medium">Welcome, <span className="text-gray-900">{admin.firstName}</span></span>
              <button
                onClick={logout}
                className="text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex-wrap">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "users" ? "tab-active" : "tab-inactive"
              }`}
            >
              Users Listing
            </button>
            <button
              onClick={() => setActiveTab("merchants")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "merchants" ? "tab-active" : "tab-inactive"
              }`}
            >
              Merchants Listing
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "products" ? "tab-active" : "tab-inactive"
              }`}
            >
              Products Moderation
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "categories" ? "tab-active" : "tab-inactive"
              }`}
            >
              Categories Management
            </button>
          </div>

          {activeTab === "merchants" && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter:</span>
              <select
                value={merchantFilter}
                onChange={(e) => setMerchantFilter(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Merchants</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {isLoading && (activeTab === "users" || activeTab === "merchants") ? (
          <div className="flex justify-center items-center py-40">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "users" && <UserTable users={users} />}
            
            {activeTab === "merchants" && <MerchantTable merchants={merchants} />}

            {activeTab === "products" && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Marketplace Products</h2>
                <ProductTable 
                  products={catalogFeed?.products || []} 
                  mode="admin" 
                  onToggleBlock={(id, block) => {
                    if (window.confirm(`Are you sure you want to ${block ? "BLOCK" : "UNBLOCK"} this product?`)) {
                      dispatch(toggleBlockProduct({ id, isBlocked: block }));
                    }
                  }}
                />
              </div>
            )}

            {activeTab === "categories" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "2rem" }}>
                {/* Forms Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {/* Form 1: Add Category */}
                  <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Create New Category</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newCatName) return;
                      const subArr = newSubcats.split(",").map(s => s.trim()).filter(Boolean);
                      try {
                        await dispatch(createCategory({ name: newCatName, subcategories: subArr })).unwrap();
                        setNewCatName("");
                        setNewSubcats("");
                        alert("Category created successfully!");
                      } catch (err: any) {
                        alert(err || "Failed to create category");
                      }
                    }}>
                      <div className="form-group" style={{ marginBottom: "1rem" }}>
                        <label className="form-label">Category Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "1rem" }}>
                        <label className="form-label">Subcategories (comma-separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Shoes, Shirts, Pants"
                          value={newSubcats}
                          onChange={(e) => setNewSubcats(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem", padding: "0.625rem", borderRadius: "8px" }}>
                        Add Category
                      </button>
                    </form>
                  </div>

                  {/* Form 2: Add Subcategory */}
                  <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Add Subcategory</h3>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (!selectedCat || !newSubName) return;
                      try {
                        await dispatch(addSubcategory({ name: selectedCat, subcategoryName: newSubName })).unwrap();
                        setNewSubName("");
                        alert("Subcategory added successfully!");
                      } catch (err: any) {
                        alert(err || "Failed to add subcategory");
                      }
                    }}>
                      <div className="form-group" style={{ marginBottom: "1rem" }}>
                        <label className="form-label">Select Category *</label>
                        <select
                          className="form-input"
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
                        <label className="form-label">Subcategory Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "0.5rem", padding: "0.625rem", borderRadius: "8px" }}>
                        Add Subcategory
                      </button>
                    </form>
                  </div>
                </div>

                {/* Categories List Column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Store Classification Schema</h3>
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
  );
};

export default AdminDashboardPage;
