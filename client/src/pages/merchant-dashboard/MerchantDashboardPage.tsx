import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { setMerchant, logoutMerchant } from "@/entities/merchant/model/merchantSlice";
import { useNavigate } from "react-router-dom";
import { ProductTable } from "@/shared/components/ProductTable";
import { AddProductModal } from "@/features/product/ui/AddProductModal";
import { fetchMerchantProducts, deleteProduct, type Product } from "@/features/product/model/productSlice";
import type { RootState, AppDispatch } from "@/app/store";
import { orderApi } from "@/entities/order/api/orderApi";

interface SaleItemProduct {
  name?: string;
  [key: string]: unknown;
}

interface SaleItem {
  priceSnapshot: number;
  quantity: number;
  product?: SaleItemProduct;
  productId: string;
  status?: string;
}

interface Sale {
  orderId: string;
  createdAt?: string | Date;
  customerName: string;
  customerPhone: string;
  items: SaleItem[];
  subtotal: number;
}

export const MerchantDashboardPage = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const merchant   = useSelector((state: RootState) => state.merchant.merchant);
  const isLoading  = useSelector((state: RootState) => state.merchant.isLoading);
  const merchantProducts = useSelector((state: RootState) => state.product.merchantProducts);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [statusUpdatePending, setStatusUpdatePending] = useState<{
    orderId: string;
    productId: string;
    status: string;
    productName: string;
  } | null>(null);

  const [isReapplying, setIsReapplying] = useState(false);
  const [reapplyError, setReapplyError] = useState("");
  const [reapplySuccess, setReapplySuccess] = useState(false);
  const [reapplyErrors, setReapplyErrors] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<"listings" | "sales">("listings");
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);

  // Search & Filtering states
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sales Search, Filtering & Pagination states
  const [salesSearchInput, setSalesSearchInput] = useState("");
  const [salesAppliedSearch, setSalesAppliedSearch] = useState("");
  const [salesStatusFilter, setSalesStatusFilter] = useState("all");
  const [salesCurrentPage, setSalesCurrentPage] = useState(1);

  useEffect(() => {
    if (!merchant) {
      navigate("/merchant/auth");
    } else if (merchant.isProfileComplete === false || merchant.gstNumber?.startsWith("PENDING-")) {
      navigate("/merchant/complete-profile");
    }
  }, [merchant, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await merchantApi.getProfile();
        dispatch(setMerchant(res.data));
      } catch (err: unknown) {
        dispatch(logoutMerchant());
        navigate("/merchant/auth");
      }
    };

    fetchProfile();

    // Set up polling if the merchant is pending
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (merchant?.status === "pending") {
      intervalId = setInterval(fetchProfile, 10000); // Poll every 10 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dispatch, navigate, merchant?.status]);

  useEffect(() => {
    if (merchant?.status === "approved") {
      dispatch(fetchMerchantProducts());
      const fetchSales = async () => {
        try {
          const res = await orderApi.getMerchantSales();
          setSales(res.data);
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          setSalesError(error.response?.data?.message || "Failed to load sales history.");
        } finally {
          setSalesLoading(false);
        }
      };
      fetchSales();
    }
  }, [dispatch, merchant?.status]);

  const handleLogout = async () => {
    try {
      await merchantApi.logout();
    } catch (e: unknown) {
      console.error(e);
    }
    dispatch(logoutMerchant());
    navigate("/merchant/auth");
  };

  // Helper variables for filtering products
  const merchantCategories = Array.from(
    new Set(merchantProducts.map((p) => p.category).filter(Boolean))
  );

  const merchantSubcategories = Array.from(
    new Set(
      merchantProducts
        .filter((p) => !selectedCategory || p.category === selectedCategory)
        .map((p) => p.subcategory)
        .filter(Boolean)
    )
  );

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSelectedSubcategory("");
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (val: string) => {
    setSelectedSubcategory(val);
    setCurrentPage(1);
  };

  const handleStockFilterChange = (val: string) => {
    setStockFilter(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput);
    setCurrentPage(1);
  };

  const filteredProducts = merchantProducts
    .filter((product) => {
      const matchesSearch =
        !appliedSearch.trim() ||
        product.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        product.brand.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(appliedSearch.toLowerCase()));

      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;

      let matchesStock = true;
      if (stockFilter === "in_stock") {
        matchesStock = product.stock > 0;
      } else if (stockFilter === "out_of_stock") {
        matchesStock = product.stock === 0;
      } else if (stockFilter === "low_stock") {
        matchesStock = product.stock > 0 && product.stock <= 5;
      }

      return matchesSearch && matchesCategory && matchesSubcategory && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") {
        const pA = a.offerPrice ?? a.price;
        const pB = b.offerPrice ?? b.price;
        return pA - pB;
      }
      if (sortBy === "price_desc") {
        const pA = a.offerPrice ?? a.price;
        const pB = b.offerPrice ?? b.price;
        return pB - pA;
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === "stock_asc") {
        return a.stock - b.stock;
      }
      if (sortBy === "stock_desc") {
        return b.stock - a.stock;
      }
      return 0;
    });

  // Pagination calculation
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sales search & filter computations
  const handleSalesSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSalesAppliedSearch(salesSearchInput);
    setSalesCurrentPage(1);
  };

  const handleSalesStatusFilterChange = (val: string) => {
    setSalesStatusFilter(val);
    setSalesCurrentPage(1);
  };

  const filteredSales = sales
    .filter((sale) => {
      const matchesSearch =
        !salesAppliedSearch.trim() ||
        sale.orderId.toLowerCase().includes(salesAppliedSearch.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(salesAppliedSearch.toLowerCase()) ||
        sale.items.some((item: any) =>
          item.product?.name?.toLowerCase().includes(salesAppliedSearch.toLowerCase())
        );

      const matchesStatus =
        salesStatusFilter === "all" ||
        sale.items.some((item: any) => (item.status || "pending") === salesStatusFilter);

      return matchesSearch && matchesStatus;
    });

  const salesItemsPerPage = 5;
  const totalSalesPages = Math.ceil(filteredSales.length / salesItemsPerPage);
  const paginatedSales = filteredSales.slice(
    (salesCurrentPage - 1) * salesItemsPerPage,
    salesCurrentPage * salesItemsPerPage
  );

  if (isLoading || !merchant) {
    return (
      <div className="auth-container">
        <div style={{ textAlign: "center" }}>
          <div className="status-icon-container status-icon-pending">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <p>Loading your merchant profile...</p>
        </div>
      </div>
    );
  }

  const renderStatusContent = () => {
    switch (merchant.status) {
      case "pending":
        return (
          <div className="status-page-container">
            <div className="status-icon-container status-icon-pending">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h2 className="status-title" style={{ color: "#d97706" }}>Approval Pending</h2>
            <p className="status-description">
              Hello, <strong>{merchant.businessName}</strong>! Your account is currently in <strong>Pending</strong> status. 
              Our administrators are reviewing your documents.
            </p>
            <div className="status-badge status-badge-pending">
              <span style={{ width: "8px", height: "8px", backgroundColor: "#f59e0b", borderRadius: "50%", marginRight: "8px" }}></span>
              Status: Pending
            </div>
          </div>
        );

      case "rejected":
        return (
          <div className="status-page-container" style={{ borderColor: "#fecaca", textAlign: "left", maxWidth: "800px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="status-icon-container status-icon-rejected">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              </div>
              <h2 className="status-title" style={{ color: "#dc2626" }}>Application Rejected</h2>
              <div className="rejection-box">
                <span className="rejection-label">Reason for Rejection:</span>
                <p className="rejection-text">"{merchant.rejectionReason || "Reason not specified."}"</p>
              </div>
            </div>

            {reapplySuccess ? (
              <div style={{ marginTop: "1.5rem", padding: "1.5rem", background: "#ecfdf5", borderRadius: "12px", color: "#059669", fontWeight: 700, textAlign: "center", border: "1px solid #a7f3d0" }}>
                ✓ Your reapplication has been successfully submitted! Our administrators will review your updated details.
              </div>
            ) : (
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>Update Application Details</h3>
                <p style={{ color: "#64748b", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                  Please correct any errors in your application form below and resubmit.
                </p>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setReapplyError("");
                    setReapplyErrors({});

                    const formData = new FormData(e.currentTarget);
                    const data: Record<string, string> = {};
                    formData.forEach((value, key) => {
                      data[key] = value.toString().trim();
                    });

                    // Validation
                    const newErrors: Record<string, string> = {};
                    if (!data.businessName) newErrors.businessName = "Business name is required";
                    
                    if (!data.ownerName) {
                      newErrors.ownerName = "Owner name is required";
                    } else if (!/^[a-zA-Z\s]*$/.test(data.ownerName)) {
                      newErrors.ownerName = "Owner name should only contain letters";
                    }

                    if (!data.phone) {
                      newErrors.phone = "Phone number is required";
                    } else if (!/^[0-9]{10}$/.test(data.phone)) {
                      newErrors.phone = "Phone number must be 10 digits";
                    }

                    if (!data.gstNumber) {
                      newErrors.gstNumber = "GST number is required";
                    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstNumber)) {
                      newErrors.gstNumber = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
                    }

                    if (!data.houseName) newErrors.houseName = "House name is required";
                    if (!data.street) newErrors.street = "Street address is required";
                    if (!data.locality) newErrors.locality = "Locality is required";
                    if (!data.city) newErrors.city = "City is required";
                    if (!data.state) newErrors.state = "State is required";

                    if (!data.zipCode) {
                      newErrors.zipCode = "ZIP code is required";
                    } else if (!/^[0-9]{6}$/.test(data.zipCode)) {
                      newErrors.zipCode = "ZIP code must be 6 digits";
                    }

                    if (!data.country) newErrors.country = "Country is required";

                    if (Object.keys(newErrors).length > 0) {
                      setReapplyErrors(newErrors);
                      return;
                    }

                    setIsReapplying(true);
                    try {
                      const res = await merchantApi.reapply(data);
                      dispatch(setMerchant(res.data.merchant));
                      setReapplySuccess(true);
                    } catch (err: unknown) {
                      const error = err as { response?: { data?: { message?: string } } };
                      setReapplyError(error.response?.data?.message ?? "Reapplication failed. Please try again.");
                    } finally {
                      setIsReapplying(false);
                    }
                  }}
                  noValidate
                >
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Business Name</label>
                      <input 
                        name="businessName" 
                        defaultValue={merchant.businessName}
                        className={`form-input ${reapplyErrors.businessName ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.businessName && <span className="error-text">{reapplyErrors.businessName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Owner Name</label>
                      <input 
                        name="ownerName" 
                        defaultValue={merchant.ownerName}
                        className={`form-input ${reapplyErrors.ownerName ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.ownerName && <span className="error-text">{reapplyErrors.ownerName}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        defaultValue={merchant.phone}
                        className={`form-input ${reapplyErrors.phone ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.phone && <span className="error-text">{reapplyErrors.phone}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">GST / Registration No.</label>
                      <input 
                        name="gstNumber" 
                        defaultValue={merchant.gstNumber}
                        className={`form-input ${reapplyErrors.gstNumber ? 'input-error' : ''}`} 
                        placeholder="22AAAAA0000A1Z5"
                      />
                      {reapplyErrors.gstNumber && <span className="error-text">{reapplyErrors.gstNumber}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">House Name / Building Number</label>
                    <input 
                      name="houseName" 
                      defaultValue={merchant.houseName}
                      className={`form-input ${reapplyErrors.houseName ? 'input-error' : ''}`} 
                      placeholder="Apt 4B / Sunset Villa" 
                    />
                    {reapplyErrors.houseName && <span className="error-text">{reapplyErrors.houseName}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input 
                      name="street" 
                      defaultValue={merchant.street}
                      className={`form-input ${reapplyErrors.street ? 'input-error' : ''}`} 
                      placeholder="123 Main St" 
                    />
                    {reapplyErrors.street && <span className="error-text">{reapplyErrors.street}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Area / Locality</label>
                      <input 
                        name="locality" 
                        defaultValue={merchant.locality}
                        className={`form-input ${reapplyErrors.locality ? 'input-error' : ''}`} 
                        placeholder="Downtown / Sector 4" 
                      />
                      {reapplyErrors.locality && <span className="error-text">{reapplyErrors.locality}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input 
                        name="city" 
                        defaultValue={merchant.city}
                        className={`form-input ${reapplyErrors.city ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.city && <span className="error-text">{reapplyErrors.city}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">State / Province</label>
                      <input 
                        name="state" 
                        defaultValue={merchant.state}
                        className={`form-input ${reapplyErrors.state ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.state && <span className="error-text">{reapplyErrors.state}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">ZIP / Postal Code</label>
                      <input 
                        name="zipCode" 
                        defaultValue={merchant.zipCode}
                        className={`form-input ${reapplyErrors.zipCode ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.zipCode && <span className="error-text">{reapplyErrors.zipCode}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Country</label>
                      <input 
                        name="country" 
                        defaultValue={merchant.country}
                        className={`form-input ${reapplyErrors.country ? 'input-error' : ''}`} 
                      />
                      {reapplyErrors.country && <span className="error-text">{reapplyErrors.country}</span>}
                    </div>
                  </div>

                  {reapplyError && (
                    <div className="error-message" role="alert" style={{ marginTop: "1rem" }}>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {reapplyError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isReapplying}
                    style={{ marginTop: "1.5rem" }}
                  >
                    {isReapplying ? "Submitting Application..." : "Submit Reapplication"}
                  </button>
                </form>
              </div>
            )}
          </div>
        );

      case "approved":
        return (
          <div className="animate-fadeIn">
            <div className="dashboard-welcome">
              <div style={{ display: "inline-flex", alignItems: "center", padding: "0.5rem 1rem", backgroundColor: "#ecfdf5", color: "#059669", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "700", marginBottom: "1rem" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                Approval Success
              </div>
              <h1>Welcome to MarketNest</h1>
              <p>Managing <strong>{merchant.businessName}</strong> • Your account is fully active</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Total Sales</p>
                <h3 className="stat-value">₹{sales.reduce((sum, s) => sum + s.subtotal, 0).toFixed(2)}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Orders</p>
                <h3 className="stat-value">{sales.length}</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Products</p>
                <h3 className="stat-value">{merchantProducts.length}</h3>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", margin: "2.5rem 0 1.5rem 0", gap: "2rem" }}>
              <button
                onClick={() => setActiveTab("listings")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.75rem 0",
                  fontSize: "1rem",
                  fontWeight: activeTab === "listings" ? 700 : 500,
                  color: activeTab === "listings" ? "var(--primary)" : "var(--text-muted)",
                  borderBottom: activeTab === "listings" ? "2.5px solid var(--primary)" : "2.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Product Listings
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.75rem 0",
                  fontSize: "1rem",
                  fontWeight: activeTab === "sales" ? 700 : 500,
                  color: activeTab === "sales" ? "var(--primary)" : "var(--text-muted)",
                  borderBottom: activeTab === "sales" ? "2.5px solid var(--primary)" : "2.5px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Sales History
              </button>
            </div>

            {activeTab === "listings" && (
              <div className="animate-fadeIn">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Your Listings</h2>
                  <button 
                    className="btn-primary" 
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    style={{ width: "auto", marginTop: 0, padding: "0.625rem 1.25rem", borderRadius: "10px" }}
                  >
                    + Add Product
                  </button>
                </div>

                {/* Search & Filter Bar */}
                <div style={filterBarStyles}>
                  {/* Search Input and Button Form */}
                  <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                    <div style={searchWrapperStyles}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={searchIconStyles}
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search listings by name, brand, description..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        style={searchInputStyles}
                      />
                    </div>
                    <button type="submit" style={searchBtnStyles}>
                      Search
                    </button>
                  </form>

                  {/* Filters block */}
                  <div style={filtersWrapperStyles}>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      style={selectStyles}
                    >
                      <option value="">All Categories</option>
                      {merchantCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedSubcategory}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      style={selectStyles}
                      disabled={!selectedCategory}
                    >
                      <option value="">All Subcategories</option>
                      {merchantSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    <select
                      value={stockFilter}
                      onChange={(e) => handleStockFilterChange(e.target.value)}
                      style={selectStyles}
                    >
                      <option value="all">All Stock Status</option>
                      <option value="in_stock">In Stock</option>
                      <option value="low_stock">Low Stock (≤ 5)</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      style={selectStyles}
                    >
                      <option value="default">Sort: Default</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A-Z</option>
                      <option value="name_desc">Name: Z-A</option>
                      <option value="stock_asc">Stock: Low to High</option>
                      <option value="stock_desc">Stock: High to Low</option>
                    </select>

                    {(searchInput || appliedSearch || selectedCategory || selectedSubcategory || stockFilter !== "all" || sortBy !== "default") && (
                      <button
                        onClick={() => {
                          setSearchInput("");
                          setAppliedSearch("");
                          setSelectedCategory("");
                          setSelectedSubcategory("");
                          setStockFilter("all");
                          setSortBy("default");
                          setCurrentPage(1);
                        }}
                        style={clearBtnStyles}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <ProductTable 
                  products={paginatedProducts} 
                  mode="merchant"
                  onEdit={(prod) => {
                    setEditingProduct(prod);
                    setIsModalOpen(true);
                  }}
                  onDelete={(id) => {
                    setProductToDeleteId(id);
                  }}
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={paginationWrapperStyles}>
                    <div style={paginationInfoStyles}>
                      Showing <strong style={{ color: "var(--text-main)" }}>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}</strong> to{" "}
                      <strong style={{ color: "var(--text-main)" }}>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of{" "}
                      <strong style={{ color: "var(--text-main)" }}>{filteredProducts.length}</strong> listings
                    </div>
                    <div style={paginationNavStyles}>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        style={{
                          ...paginationBtnStyles,
                          opacity: currentPage === 1 ? 0.5 : 1,
                          cursor: currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            ...paginationNumStyles,
                            backgroundColor: currentPage === page ? "var(--primary)" : "transparent",
                            color: currentPage === page ? "white" : "var(--text-main)",
                            borderColor: currentPage === page ? "var(--primary)" : "var(--border)",
                          }}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{
                          ...paginationBtnStyles,
                          opacity: currentPage === totalPages ? 0.5 : 1,
                          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "sales" && (
              <div className="animate-fadeIn">
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.25rem" }}>Sales & Transactions</h2>

                {/* Sales Search & Filter Bar */}
                <div style={filterBarStyles}>
                  <form onSubmit={handleSalesSearchSubmit} style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                    <div style={searchWrapperStyles}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={searchIconStyles}
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      <input
                        type="text"
                        placeholder="Search sales by Customer, Order ID, Product..."
                        value={salesSearchInput}
                        onChange={(e) => setSalesSearchInput(e.target.value)}
                        style={searchInputStyles}
                      />
                    </div>
                    <button type="submit" style={searchBtnStyles}>
                      Search
                    </button>
                  </form>

                  <div style={filtersWrapperStyles}>
                    <select
                      value={salesStatusFilter}
                      onChange={(e) => handleSalesStatusFilterChange(e.target.value)}
                      style={selectStyles}
                    >
                      <option value="all">All Item Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>

                    {(salesSearchInput || salesAppliedSearch || salesStatusFilter !== "all") && (
                      <button
                        onClick={() => {
                          setSalesSearchInput("");
                          setSalesAppliedSearch("");
                          setSalesStatusFilter("all");
                          setSalesCurrentPage(1);
                        }}
                        style={clearBtnStyles}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                
                {salesLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4rem" }}>
                    <div className="animate-spin" style={{ width: "36px", height: "36px", border: "4px solid #e2e8f0", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
                    <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Loading transactions...</p>
                  </div>
                ) : salesError ? (
                  <div style={{ padding: "2rem", border: "1px solid #fee2e2", backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "12px", textAlign: "center" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Failed to Load Sales</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>{salesError}</p>
                  </div>
                ) : filteredSales.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "5rem 2rem", background: "white", borderRadius: "20px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>No matching sales found</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", maxWidth: "400px", margin: "0 auto" }}>
                      Try adjusting your search terms or filters to locate transactions.
                    </p>
                  </div>
                ) : (
                  <>
                    <div style={{ overflowX: "auto", background: "white", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--border)", backgroundColor: "#f8fafc" }}>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.03em" }}>ORDER ID</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.03em" }}>DATE</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.03em" }}>CUSTOMER</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.03em" }}>ITEMS & FULFILLMENT STATUS</th>
                            <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.03em", textAlign: "right" }}>EARNINGS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedSales.map((sale) => {
                            const dateStr = sale.date ? new Date(sale.date).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }) : "N/A";
                            return (
                              <tr key={sale.orderId} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: 700 }}>#{sale.orderId}</td>
                                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>{dateStr}</td>
                                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem" }}>
                                  <div style={{ fontWeight: 600, color: "var(--text-main)" }}>{sale.customerName}</div>
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>Phone: {sale.customerPhone}</div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem" }}>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {sale.items.map((item: any, idx: number) => {
                                      const currentStatus = item.status || "pending";
                                      return (
                                        <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", padding: "0.5rem", border: "1px solid #f1f5f9", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                                            <span style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "0.875rem" }}>{item.product?.name || "Product"}</span>
                                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>(₹{item.priceSnapshot} × {item.quantity})</span>
                                          </div>
                                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Fulfillment:</span>
                                            <select
                                              value={currentStatus}
                                              onChange={async (e) => {
                                                const newStatus = e.target.value;
                                                if (newStatus === "cancelled" || newStatus === "returned") {
                                                  setStatusUpdatePending({
                                                    orderId: sale.orderId!,
                                                    productId: item.productId,
                                                    status: newStatus,
                                                    productName: item.product?.name || "Product"
                                                  });
                                                  return;
                                                }
                                                try {
                                                  await orderApi.updateMerchantItemStatus(sale.orderId!, item.productId, newStatus);
                                                  const res = await orderApi.getMerchantSales();
                                                  setSales(res.data as any);
                                                } catch (err: unknown) {
                                                  alert("Failed to update status. Please try again.");
                                                }
                                              }}
                                              style={saleStatusSelectStyles}
                                            >
                                              <option value="pending">Pending</option>
                                              <option value="processing">Processing</option>
                                              <option value="shipped">Shipped</option>
                                              <option value="completed">Completed</option>
                                              <option value="cancelled">Cancelled</option>
                                              <option value="returned">Returned</option>
                                            </select>
                                            <span style={{
                                              ...statusBadgeBaseStyles,
                                              ...statusBadgeColorStyles[currentStatus as keyof typeof statusBadgeColorStyles]
                                            }}>
                                              {currentStatus}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.95rem", fontWeight: 800, color: "var(--primary)", textAlign: "right" }}>
                                  ₹{sale.subtotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Sales Pagination Controls */}
                    {totalSalesPages > 1 && (
                      <div style={paginationWrapperStyles}>
                        <div style={paginationInfoStyles}>
                          Showing <strong style={{ color: "var(--text-main)" }}>{Math.min((salesCurrentPage - 1) * salesItemsPerPage + 1, filteredSales.length)}</strong> to{" "}
                          <strong style={{ color: "var(--text-main)" }}>{Math.min(salesCurrentPage * salesItemsPerPage, filteredSales.length)}</strong> of{" "}
                          <strong style={{ color: "var(--text-main)" }}>{filteredSales.length}</strong> transactions
                        </div>
                        <div style={paginationNavStyles}>
                          <button
                            onClick={() => setSalesCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={salesCurrentPage === 1}
                            style={{
                              ...paginationBtnStyles,
                              opacity: salesCurrentPage === 1 ? 0.5 : 1,
                              cursor: salesCurrentPage === 1 ? "not-allowed" : "pointer",
                            }}
                          >
                            Previous
                          </button>
                          
                          {Array.from({ length: totalSalesPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setSalesCurrentPage(page)}
                              style={{
                                ...paginationNumStyles,
                                backgroundColor: salesCurrentPage === page ? "var(--primary)" : "transparent",
                                color: salesCurrentPage === page ? "white" : "var(--text-main)",
                                borderColor: salesCurrentPage === page ? "var(--primary)" : "var(--border)",
                              }}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setSalesCurrentPage((p) => Math.min(p + 1, totalSalesPages))}
                            disabled={salesCurrentPage === totalSalesPages}
                            style={{
                              ...paginationBtnStyles,
                              opacity: salesCurrentPage === totalSalesPages ? 0.5 : 1,
                              cursor: salesCurrentPage === totalSalesPages ? "not-allowed" : "pointer",
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <AddProductModal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }} 
              productToEdit={editingProduct} 
            />

            {/* Delete Confirmation Modal */}
            {productToDeleteId && (
              <div className="modal-overlay animate-fadeIn">
                <div className="modal-container" style={{ maxWidth: "420px", width: "90%", padding: "1.75rem", borderRadius: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div style={deleteWarningIconContainerStyles}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#dc2626" }}>
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </div>
                    
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginTop: "1rem", marginBottom: "0.5rem" }}>
                      Delete Product Listing?
                    </h3>
                    
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 1.5rem 0" }}>
                      Are you sure you want to delete this listing? This action is permanent and cannot be undone.
                    </p>

                    <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                      <button
                        onClick={() => setProductToDeleteId(null)}
                        className="modal-btn modal-btn-secondary"
                        style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "12px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (productToDeleteId) {
                            dispatch(deleteProduct(productToDeleteId));
                            setProductToDeleteId(null);
                          }
                        }}
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
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Update Confirmation Modal (Cancelled / Returned) */}
            {statusUpdatePending && (
              <div className="modal-overlay animate-fadeIn">
                <div className="modal-container" style={{ maxWidth: "440px", width: "90%", padding: "1.75rem", borderRadius: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    <div style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      backgroundColor: statusUpdatePending.status === "cancelled" ? "#fee2e2" : "#ffedd5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      {statusUpdatePending.status === "cancelled" ? (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="15" y1="9" x2="9" y2="15"></line>
                          <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                      ) : (
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                        </svg>
                      )}
                    </div>
                    
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginTop: "1rem", marginBottom: "0.5rem" }}>
                      {statusUpdatePending.status === "cancelled" ? "Cancel Item Fulfillment?" : "Return Item Order?"}
                    </h3>
                    
                    <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 1.5rem 0" }}>
                      Are you sure you want to mark <strong style={{ color: "var(--text-main)" }}>{statusUpdatePending.productName}</strong> as <strong style={{ color: statusUpdatePending.status === "cancelled" ? "#dc2626" : "#ea580c" }}>{statusUpdatePending.status.toUpperCase()}</strong>? This will update the fulfillment status and automatically notify the customer.
                    </p>

                    <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                      <button
                        onClick={() => setStatusUpdatePending(null)}
                        className="modal-btn modal-btn-secondary"
                        style={{ flex: 1, padding: "0.75rem 1rem", borderRadius: "12px", cursor: "pointer" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await orderApi.updateMerchantItemStatus(
                              statusUpdatePending.orderId,
                              statusUpdatePending.productId,
                              statusUpdatePending.status
                            );
                            const res = await orderApi.getMerchantSales();
                            setSales(res.data as any);
                          } catch (err: unknown) {
                            alert("Failed to update status. Please try again.");
                          } finally {
                            setStatusUpdatePending(null);
                          }
                        }}
                        className="modal-btn"
                        style={{
                          flex: 1,
                          padding: "0.75rem 1rem",
                          borderRadius: "12px",
                          backgroundColor: statusUpdatePending.status === "cancelled" ? "#dc2626" : "#ea580c",
                          color: "white",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                          transition: "opacity 0.2s"
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          MarketNest
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <main style={{ flex: 1 }}>
        {renderStatusContent()}
      </main>
    </div>
  );
};

// Premium CSS Styles for Filter Bar
const filterBarStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.5rem",
  padding: "1.25rem",
  backgroundColor: "var(--surface)",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
};

const searchWrapperStyles: React.CSSProperties = {
  position: "relative",
  width: "100%",
};

const searchIconStyles: React.CSSProperties = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "var(--text-muted)",
  pointerEvents: "none",
};

const searchInputStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 2.75rem",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--background)",
  color: "var(--text-main)",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const filtersWrapperStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  alignItems: "center",
};

const selectStyles: React.CSSProperties = {
  padding: "0.625rem 2rem 0.625rem 1rem",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--background)",
  color: "var(--text-main)",
  fontSize: "0.875rem",
  fontWeight: 500,
  cursor: "pointer",
  outline: "none",
  minWidth: "160px",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.75rem center",
  backgroundSize: "1rem",
  transition: "border-color 0.2s",
};

const clearBtnStyles: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  borderRadius: "10px",
  border: "1px solid #fee2e2",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const searchBtnStyles: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  borderRadius: "12px",
  backgroundColor: "var(--primary)",
  color: "white",
  fontWeight: 600,
  fontSize: "0.95rem",
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const paginationWrapperStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "1.5rem",
  padding: "1rem 1.25rem",
  backgroundColor: "var(--surface)",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  flexWrap: "wrap",
  gap: "1rem",
};

const paginationInfoStyles: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--text-muted)",
};

const paginationNavStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const paginationBtnStyles: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  backgroundColor: "white",
  color: "var(--text-main)",
  fontSize: "0.875rem",
  fontWeight: 600,
  transition: "all 0.2s",
};

const paginationNumStyles: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
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

const statusBadgeBaseStyles: React.CSSProperties = {
  padding: "0.125rem 0.375rem",
  borderRadius: "6px",
  fontSize: "0.7rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

const statusBadgeColorStyles = {
  pending: { backgroundColor: "#f1f5f9", color: "#64748b" },
  processing: { backgroundColor: "#eff6ff", color: "#2563eb" },
  shipped: { backgroundColor: "#faf5ff", color: "#7c3aed" },
  completed: { backgroundColor: "#ecfdf5", color: "#059669" },
  cancelled: { backgroundColor: "#fef2f2", color: "#dc2626" },
  returned: { backgroundColor: "#fff7ed", color: "#ea580c" },
};

const saleStatusSelectStyles: React.CSSProperties = {
  padding: "0.2rem 0.5rem",
  borderRadius: "6px",
  border: "1px solid var(--border)",
  backgroundColor: "white",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  outline: "none",
};
