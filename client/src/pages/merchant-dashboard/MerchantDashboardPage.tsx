import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { setMerchant, logoutMerchant } from "@/entities/merchant/model/merchantSlice";
import { MSG_FAILED_LOAD_SALES_HISTORY, MSG_FAILED_UPDATE_PROFILE } from "@/shared/constants/messages";
import { useNavigate } from "react-router-dom";
import { ProductTable } from "@/shared/components/ProductTable";
import { AddProductModal } from "@/features/product/ui/AddProductModal";
import { fetchMerchantProducts, deleteProduct, type Product } from "@/features/product/model/productSlice";
import type { RootState, AppDispatch } from "@/app/store";
import { orderApi } from "@/entities/order/api/orderApi";

// Lucide Icons for Premium Dashboard
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Bell,
  Tv,
  Percent,
  BarChart2,
  User,
  Settings as SettingsIcon,
  Search,
  MessageSquare,
  TrendingUp,
  Sparkles,
  ArrowRight,
  LogOut,
  DollarSign,
  ArrowLeft
} from "lucide-react";

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
  orderNumber?: string;
  date?: string | Date;
  createdAt?: string | Date;
  customerName: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: SaleItem[];
  subtotal: number;
}

export const MerchantDashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const merchant = useSelector((state: RootState) => state.merchant.merchant);
  const isLoading = useSelector((state: RootState) => state.merchant.isLoading);
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

  // Active Tab state support for standard dashboard tabs
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null);

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

  // Profile settings states
  const [profileForm, setProfileForm] = useState({
    ownerName: "",
    phone: "",
    businessName: "",
    houseName: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    profilePic: ""
  });
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  useEffect(() => {
    if (merchant) {
      setProfileForm({
        ownerName: merchant.ownerName || "",
        phone: merchant.phone || "",
        businessName: merchant.businessName || "",
        houseName: merchant.houseName || "",
        street: merchant.street || "",
        locality: merchant.locality || "",
        city: merchant.city || "",
        state: merchant.state || "",
        zipCode: merchant.zipCode || "",
        country: merchant.country || "",
        profilePic: merchant.profilePic || ""
      });
    }
  }, [merchant]);

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
          setSalesError(error.response?.data?.message || MSG_FAILED_LOAD_SALES_HISTORY);
        } finally {
          setSalesLoading(false);
        }
      };
      fetchSales();
    }
  }, [dispatch, merchant?.status]);

  // Debounce effect for Product Listings search
  useEffect(() => {
    const handler = setTimeout(() => {
      setAppliedSearch(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // Debounce effect for Sales History search
  useEffect(() => {
    const handler = setTimeout(() => {
      setSalesAppliedSearch(salesSearchInput);
      setSalesCurrentPage(1);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [salesSearchInput]);

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

  // Format Helper for Indian Rupees
  const formatRupee = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Get Top Selling items
  const getTopSelling = () => {
    const aggregated: Record<string, { name: string; category: string; salesCount: number; revenue: number; image: string }> = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const pId = item.productId;
        if (!aggregated[pId]) {
          const prod = merchantProducts.find(p => p._id === pId);
          aggregated[pId] = {
            name: prod?.name || item.product?.name || "Product",
            category: prod?.category || "Apparel",
            salesCount: 0,
            revenue: 0,
            image: prod?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"
          };
        }
        aggregated[pId].salesCount += item.quantity;
        aggregated[pId].revenue += item.priceSnapshot * item.quantity;
      });
    });

    const sortedReal = Object.values(aggregated).sort((a, b) => b.revenue - a.revenue);

    // Mockup Demo Items matching exactly the screenshot
    const mockupItems = [
      {
        name: "Handwoven Silk Saree",
        category: "Apparel",
        salesCount: 452,
        revenue: 135600,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100&auto=format&fit=crop&q=60"
      },
      {
        name: "Genuine Leather Wallet",
        category: "Accessories",
        salesCount: 312,
        revenue: 78000,
        image: "https://images.unsplash.com/photo-1627124357773-41319dbf6f47?w=100&auto=format&fit=crop&q=60"
      },
      {
        name: "Artisan Brass Lamp",
        category: "Home Decor",
        salesCount: 189,
        revenue: 56700,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&auto=format&fit=crop&q=60"
      }
    ];

    if (sortedReal.length === 0) {
      return mockupItems;
    }

    return [...sortedReal, ...mockupItems].slice(0, 3);
  };

  // Sub-Render Methods for approved views
  const renderDashboardOverview = () => {
    const totalSalesAmount = sales.reduce((sum, s) => sum + s.subtotal, 0);
    const activeProductsCount = merchantProducts.filter(p => !p.isBlocked).length;
    const topSelling = getTopSelling();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }} className="animate-fadeIn">
        {/* Welcome Header */}
        <div>
          <h1 style={overviewTitleStyles}>Merchant Overview</h1>
          <p style={overviewSubtitleStyles}>Welcome back, {merchant.ownerName || "Rajesh"}. Here's what's happening today.</p>
        </div>

        {/* 4 Stats Cards */}
        <div style={statsGridStyles}>
          {/* Card 1 */}
          <div style={overviewCardStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={iconBoxStyles("#ecfdf5", "#10b981")}>
                <DollarSign size={20} />
              </div>
              <span style={trendTagStyles("#ecfdf5", "#10b981")}>+12.5%</span>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p style={cardLabelStyles}>Total Sales</p>
              <h3 style={cardValueStyles}>{formatRupee(totalSalesAmount || 452000)}</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div style={overviewCardStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={iconBoxStyles("#eff6ff", "#3b82f6")}>
                <ShoppingCart size={20} />
              </div>
              <span style={trendTagStyles("#eff6ff", "#3b82f6")}>+8%</span>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p style={cardLabelStyles}>Orders Today</p>
              <h3 style={cardValueStyles}>{sales.length || 128}</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div style={overviewCardStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={iconBoxStyles("#fff7ed", "#f97316")}>
                <Package size={20} />
              </div>
              <span style={trendTagStyles("#fef2f2", "#ef4444")}>-2%</span>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p style={cardLabelStyles}>Active Products</p>
              <h3 style={cardValueStyles}>{activeProductsCount || 45}</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div style={overviewCardStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={iconBoxStyles("#faf5ff", "#a855f7")}>
                <TrendingUp size={20} />
              </div>
              <span style={trendTagStyles("#ecfdf5", "#10b981")}>+0.4%</span>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <p style={cardLabelStyles}>Conversion Rate</p>
              <h3 style={cardValueStyles}>3.2%</h3>
            </div>
          </div>
        </div>

        {/* Revenue Trend Line Chart */}
        <div style={chartContainerStyles}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <div>
              <h3 style={chartTitleStyles}>Revenue Trend</h3>
              <p style={chartSubtitleStyles}>Daily revenue performance for current month</p>
            </div>
            <select style={chartSelectStyles}>
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
          </div>

          <div style={{ width: "100%", height: "260px", position: "relative" }}>
            <svg viewBox="0 0 850 250" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="40" x2="810" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="50" y1="100" x2="810" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="50" y1="160" x2="810" y2="160" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="50" y1="220" x2="810" y2="220" stroke="#e2e8f0" />

              {/* Gradient Fill under Path */}
              <path
                d="M 50 170 C 120 170, 150 190, 210 180 C 270 170, 290 140, 330 140 C 370 140, 400 185, 440 180 C 480 175, 490 120, 530 120 C 570 120, 590 190, 630 185 C 670 180, 680 80, 720 80 C 760 80, 765 220, 790 220 C 800 220, 805 150, 820 130 L 820 220 L 50 220 Z"
                fill="url(#chart-gradient)"
              />

              {/* Spline Path */}
              <path
                d="M 50 170 C 120 170, 150 190, 210 180 C 270 170, 290 140, 330 140 C 370 140, 400 185, 440 180 C 480 175, 490 120, 530 120 C 570 120, 590 190, 630 185 C 670 180, 680 80, 720 80 C 760 80, 765 220, 790 220 C 800 220, 805 150, 820 130"
                fill="none"
                stroke="#f97316"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="210" cy="180" r="5" fill="#ffffff" stroke="#f97316" strokeWidth="3" />
              <circle cx="330" cy="140" r="5" fill="#ffffff" stroke="#f97316" strokeWidth="3" />
              <circle cx="530" cy="120" r="5" fill="#ffffff" stroke="#f97316" strokeWidth="3" />
              <circle cx="720" cy="80" r="5" fill="#ffffff" stroke="#f97316" strokeWidth="3" />
            </svg>

            {/* X-axis labels overlay */}
            <div style={axisLabelContainerStyles}>
              <span>WEEK 1</span>
              <span>WEEK 2</span>
              <span>WEEK 3</span>
              <span>WEEK 4</span>
            </div>
          </div>
        </div>

        {/* Two-Column Section: Top Selling Products & Demographics */}
        <div style={twoColGridStyles}>
          {/* Top Selling Products */}
          <div style={panelContainerStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={panelTitleStyles}>Top Selling Products</h3>
              <button onClick={() => setActiveTab("listings")} style={panelLinkStyles}>View All</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={panelTableStyles}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <th style={panelThStyles}>PRODUCT</th>
                    <th style={panelThStyles}>CATEGORY</th>
                    <th style={panelThStyles}>SALES</th>
                    <th style={{ ...panelThStyles, textAlign: "right" }}>REVENUE</th>
                  </tr>
                </thead>
                <tbody>
                  {topSelling.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: idx === topSelling.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                      <td style={panelTdStyles}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <img src={item.image} alt={item.name} style={productThumbStyles} />
                          <span style={productNameTextStyles}>{item.name}</span>
                        </div>
                      </td>
                      <td style={panelTdStyles}>
                        <span style={categoryBadgeStyles}>{item.category}</span>
                      </td>
                      <td style={{ ...panelTdStyles, fontWeight: 600 }}>{item.salesCount}</td>
                      <td style={{ ...panelTdStyles, fontWeight: 700, color: "#111827", textAlign: "right" }}>
                        {formatRupee(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Demographics */}
          <div style={panelContainerStyles}>
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={panelTitleStyles}>Customer Demographics</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Row 1 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>
                  <span>Tier 1 Cities (Metro)</span>
                  <span style={{ color: "#111827", fontWeight: 700 }}>64%</span>
                </div>
                <div style={progressBarBgStyles}>
                  <div style={progressBarFillStyles("#f97316", "64%")} />
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>
                  <span>Tier 2 & 3 Cities</span>
                  <span style={{ color: "#111827", fontWeight: 700 }}>28%</span>
                </div>
                <div style={progressBarBgStyles}>
                  <div style={progressBarFillStyles("#fdba74", "28%")} />
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem" }}>
                  <span>International</span>
                  <span style={{ color: "#111827", fontWeight: 700 }}>8%</span>
                </div>
                <div style={progressBarBgStyles}>
                  <div style={progressBarFillStyles("#94a3b8", "8%")} />
                </div>
              </div>

              {/* Demographics subtext & footer */}
              <div style={demoSubtextContainerStyles}>
                <p style={demoSubtextStyles}>
                  You have <span style={{ color: "#f97316", fontWeight: 700 }}>1,240</span> new customers this month.
                </p>
                <button
                  onClick={() => setActiveTab("insights")}
                  style={demoLinkStyles}
                >
                  Detailed Insights <ArrowRight size={14} style={{ marginLeft: "0.25rem" }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListingsView = () => {
    return (
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
    );
  };

  const renderSalesView = () => {
    return (
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
                        <td style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: 700 }}>
                          <button
                            onClick={() => setSelectedOrder(sale)}
                            style={{
                              border: "none",
                              background: "none",
                              color: "#ea580c",
                              fontWeight: 700,
                              cursor: "pointer",
                              padding: 0,
                              textAlign: "left"
                            }}
                          >
                            #{sale.orderNumber || sale.orderId.substring(0, 8)}
                          </button>
                        </td>
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
    );
  };

  const renderPlaceholderView = (tab: string) => {
    const formattedName = tab.charAt(0).toUpperCase() + tab.slice(1);
    return (
      <div style={panelContainerStyles} className="animate-fadeIn">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6rem 2rem", textAlign: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem", color: "#ea580c" }}>
            <Sparkles size={32} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>{formattedName} Page</h2>
          <p style={{ fontSize: "0.95rem", color: "#64748b", maxWidth: "450px", lineHeight: 1.5 }}>
            This feature is currently under active development. You will be able to manage and analyze your {formattedName} metrics very soon!
          </p>
        </div>
      </div>
    );
  };

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
      default:
        return null;
    }
  };

  const renderOrderDetailView = (sale: Sale) => {
    const dateStr = sale.date ? new Date(sale.date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "N/A";

    return (
      <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Back navigation & Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setSelectedOrder(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "none",
              backgroundColor: "transparent",
              color: "#64748b",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
              Order #{sale.orderNumber || sale.orderId.substring(0, 8)}
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
              Placed on {dateStr} • ID: {sale.orderId}
            </p>
          </div>
          <span style={{
            padding: "0.5rem 1rem",
            borderRadius: "9999px",
            fontSize: "0.875rem",
            fontWeight: 700,
            backgroundColor: "#ecfdf5",
            color: "#059669",
            textTransform: "uppercase"
          }}>
            Paid
          </span>
        </div>

        {/* Two-Column Details */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Items Table */}
          <div style={panelContainerStyles}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
              Ordered Items
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={panelTableStyles}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <th style={panelThStyles}>PRODUCT</th>
                    <th style={panelThStyles}>UNIT PRICE</th>
                    <th style={panelThStyles}>QTY</th>
                    <th style={panelThStyles}>FULFILLMENT STATUS</th>
                    <th style={{ ...panelThStyles, textAlign: "right" }}>SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item: any, idx: number) => {
                    const currentStatus = item.status || "pending";
                    const itemSubtotal = item.priceSnapshot * item.quantity;
                    const matchedProduct = merchantProducts.find(p => p._id === item.productId);
                    const productImg = matchedProduct?.images?.[0] || item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
                    const productName = matchedProduct?.name || item.product?.name || "Product";

                    return (
                      <tr key={idx} style={{ borderBottom: idx === sale.items.length - 1 ? "none" : "1px solid #f1f5f9" }}>
                        <td style={panelTdStyles}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <img src={productImg} alt={productName} style={productThumbStyles} />
                            <div>
                              <div style={productNameTextStyles}>{productName}</div>
                              {matchedProduct?.brand && (
                                <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Brand: {matchedProduct.brand}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={panelTdStyles}>{formatRupee(item.priceSnapshot)}</td>
                        <td style={{ ...panelTdStyles, fontWeight: 600 }}>{item.quantity}</td>
                        <td style={panelTdStyles}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <select
                              value={currentStatus}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                if (newStatus === "cancelled" || newStatus === "returned") {
                                  setStatusUpdatePending({
                                    orderId: sale.orderId!,
                                    productId: item.productId,
                                    status: newStatus,
                                    productName: productName
                                  });
                                  return;
                                }
                                try {
                                  await orderApi.updateMerchantItemStatus(sale.orderId!, item.productId, newStatus);
                                  const res = await orderApi.getMerchantSales();
                                  const updatedSales = res.data as Sale[];
                                  setSales(updatedSales);
                                  const updatedSale = updatedSales.find(s => s.orderId === sale.orderId);
                                  if (updatedSale) {
                                    setSelectedOrder(updatedSale);
                                  }
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
                              ...statusBadgeColorStyles[currentStatus as keyof typeof statusBadgeColorStyles],
                              display: "inline-block",
                              width: "fit-content",
                              marginTop: "0.25rem"
                            }}>
                              {currentStatus}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...panelTdStyles, fontWeight: 700, color: "#111827", textAlign: "right" }}>
                          {formatRupee(itemSubtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "240px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#64748b" }}>
                  <span>Earning Subtotal:</span>
                  <span style={{ fontWeight: 600, color: "#1f2937" }}>{formatRupee(sale.subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1rem", fontWeight: 800, color: "#111827", marginTop: "0.5rem" }}>
                  <span>Total Earnings:</span>
                  <span style={{ color: "#ea580c" }}>{formatRupee(sale.subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Customer Contact */}
            <div style={panelContainerStyles}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
                Customer
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Name</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b" }}>{sale.customerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Phone</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1e293b" }}>{sale.customerPhone}</div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={panelContainerStyles}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
                Shipping Address
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", color: "#475569", lineHeight: 1.5 }}>
                <div style={{ fontWeight: 700, color: "#1e293b" }}>{sale.shippingAddress.fullName}</div>
                <div>{sale.shippingAddress.street}</div>
                <div>{sale.shippingAddress.city}, {sale.shippingAddress.state} {sale.shippingAddress.zipCode}</div>
                <div style={{ fontWeight: 600 }}>{sale.shippingAddress.country}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({
        ...prev,
        profilePic: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveLoading(true);
    setProfileSaveError(null);
    setProfileSaveSuccess(false);

    try {
      const res = await merchantApi.updateProfile(profileForm);
      dispatch(setMerchant(res.data.merchant));
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || MSG_FAILED_UPDATE_PROFILE;
      setProfileSaveError(msg);
    } finally {
      setProfileSaveLoading(false);
    }
  };

  const renderProfileView = () => {
    return (
      <div className="animate-fadeIn" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
            Merchant Profile
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>
            Update your business details, contact information, and upload a profile picture.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Left Column: Avatar Settings */}
          <div style={panelContainerStyles}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
              Profile Photo
            </h3>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", textAlign: "center" }}>
              <div style={{ position: "relative", width: "120px", height: "120px" }}>
                <img
                  src={profileForm.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"}
                  alt="Avatar Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--primary)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
                  }}
                />
              </div>
              <div style={{ width: "100%" }}>
                <label
                  style={{
                    display: "inline-block",
                    width: "100%",
                    padding: "0.6rem 1rem",
                    backgroundColor: "#fff7ed",
                    color: "var(--primary)",
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    textAlign: "center",
                    cursor: "pointer",
                    border: "1px dashed var(--primary)",
                    transition: "all 0.2s"
                  }}
                >
                  Choose Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    style={{ display: "none" }}
                  />
                </label>
                <p style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.5rem", lineHeight: 1.4 }}>
                  Supports PNG, JPG, or GIF.<br />Max size: 2MB.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={panelContainerStyles}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
                Basic Information
              </h3>

              {profileSaveError && (
                <div style={{ padding: "1rem", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "12px", color: "#b91c1c", fontSize: "0.85rem", fontWeight: 600, marginBottom: "1.5rem" }}>
                  {profileSaveError}
                </div>
              )}

              {profileSaveSuccess && (
                <div style={{ padding: "1rem", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px", color: "#047857", fontSize: "0.85rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                  ✓ Profile settings updated successfully!
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>OWNER NAME</label>
                  <input
                    type="text"
                    required
                    value={profileForm.ownerName}
                    onChange={(e) => setProfileForm(p => ({ ...p, ownerName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>PHONE NUMBER</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>BUSINESS NAME</label>
                  <input
                    type="text"
                    required
                    value={profileForm.businessName}
                    onChange={(e) => setProfileForm(p => ({ ...p, businessName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>GST NUMBER (READ-ONLY)</label>
                  <input
                    type="text"
                    disabled
                    value={merchant.gstNumber || "N/A"}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      fontSize: "0.9rem",
                      cursor: "not-allowed",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>EMAIL ADDRESS (READ-ONLY)</label>
                  <input
                    type="email"
                    disabled
                    value={merchant.email || "N/A"}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      backgroundColor: "#f1f5f9",
                      color: "#64748b",
                      fontSize: "0.9rem",
                      cursor: "not-allowed",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={panelContainerStyles}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1.5rem" }}>
                Business Address
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>HOUSE/BUILDING NAME</label>
                  <input
                    type="text"
                    required
                    value={profileForm.houseName}
                    onChange={(e) => setProfileForm(p => ({ ...p, houseName: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>STREET ADDRESS</label>
                  <input
                    type="text"
                    required
                    value={profileForm.street}
                    onChange={(e) => setProfileForm(p => ({ ...p, street: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>LOCALITY</label>
                  <input
                    type="text"
                    required
                    value={profileForm.locality}
                    onChange={(e) => setProfileForm(p => ({ ...p, locality: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>CITY</label>
                  <input
                    type="text"
                    required
                    value={profileForm.city}
                    onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>STATE</label>
                  <input
                    type="text"
                    required
                    value={profileForm.state}
                    onChange={(e) => setProfileForm(p => ({ ...p, state: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>ZIP CODE</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={profileForm.zipCode}
                    onChange={(e) => setProfileForm(p => ({ ...p, zipCode: e.target.value.replace(/\D/g, "") }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>COUNTRY</label>
                  <input
                    type="text"
                    required
                    value={profileForm.country}
                    onChange={(e) => setProfileForm(p => ({ ...p, country: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={profileSaveLoading}
                  style={{
                    padding: "0.75rem 2rem",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    transition: "opacity 0.2s"
                  }}
                >
                  {profileSaveLoading ? "Saving Changes..." : "Save Settings"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // If approved, render the brand-new full screen sidebar layout
  if (merchant.status === "approved") {
    return (
      <div style={layoutContainerStyles}>
        {/* Left Sidebar */}
        <aside style={sidebarStyles}>
          <div style={sidebarTopStyles}>
            <div style={sidebarLogoStyles}>
              <div style={logoIconStyles}>
                <Sparkles size={18} color="#fff" />
              </div>
              <span style={logoTextStyles}>MarketNest</span>
            </div>

            <nav style={sidebarNavStyles}>
              <button
                onClick={() => { setActiveTab("dashboard"); setSelectedOrder(null); }}
                style={activeTab === "dashboard" ? navItemActiveStyles : navItemStyles}
              >
                <LayoutDashboard size={18} style={activeTab === "dashboard" ? navIconActiveStyles : navIconStyles} />
                Dashboard
              </button>
              <button
                onClick={() => { setActiveTab("listings"); setSelectedOrder(null); }}
                style={activeTab === "listings" ? navItemActiveStyles : navItemStyles}
              >
                <Package size={18} style={activeTab === "listings" ? navIconActiveStyles : navIconStyles} />
                Products
              </button>
              <button
                onClick={() => { setActiveTab("sales"); setSelectedOrder(null); }}
                style={activeTab === "sales" ? navItemActiveStyles : navItemStyles}
              >
                <ShoppingCart size={18} style={activeTab === "sales" ? navIconActiveStyles : navIconStyles} />
                Orders
              </button>

              <div style={dividerStyles} />
            </nav>
          </div>

          <div style={sidebarBottomStyles}>
            <div style={supportCardStyles}>
              <span style={supportLabelStyles}>SUPPORT</span>
              <button style={supportButtonStyles} onClick={() => alert("Connecting to Support Help Center...")}>Help Center</button>
            </div>
            <button style={signOutButtonStyles} onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: "0.5rem" }} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Panel */}
        <div style={mainPanelStyles}>
          {/* Header */}
          <header style={headerStyles}>
            <div style={searchContainerStyles}>
              <Search size={18} style={headerSearchIconStyles} />
              <input
                type="text"
                placeholder="Search for orders, products or customers..."
                style={headerSearchInputStyles}
              />
            </div>
            <div style={headerRightStyles}>
              <div style={iconBadgeWrapperStyles}>
                <MessageSquare size={20} style={headerIconStyles} />
                <span style={badgeCountStyles}>2</span>
              </div>
              <div style={iconBadgeWrapperStyles}>
                <Bell size={20} style={headerIconStyles} />
                <span style={badgeCountStyles}>5</span>
              </div>
              <div style={headerDividerStyles} />
              <div 
                style={{ ...profileInfoStyles, cursor: "pointer" }}
                onClick={() => { setActiveTab("profile"); setSelectedOrder(null); }}
              >
                <div style={{ textAlign: "right" }}>
                  <div style={profileNameStyles}>{merchant.ownerName || "Rajesh Kumar"}</div>
                  <div style={profileBusinessStyles}>{merchant.businessName || "Global Exports Ltd."}</div>
                </div>
                <img
                  src={merchant.profilePic || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60"}
                  alt="avatar"
                  style={profileAvatarStyles}
                />
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main style={contentAreaStyles}>
            {selectedOrder ? (
              renderOrderDetailView(selectedOrder)
            ) : (
              <>
                {activeTab === "dashboard" && renderDashboardOverview()}
                {activeTab === "listings" && renderListingsView()}
                {activeTab === "sales" && renderSalesView()}
                {activeTab === "profile" && renderProfileView()}
                {activeTab !== "dashboard" && activeTab !== "listings" && activeTab !== "sales" && activeTab !== "profile" && renderPlaceholderView(activeTab)}
              </>
            )}
          </main>
        </div>

        {/* Modals */}
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
                        const updatedSales = res.data as Sale[];
                        setSales(updatedSales);

                        if (selectedOrder && selectedOrder.orderId === statusUpdatePending.orderId) {
                          const updatedSale = updatedSales.find(s => s.orderId === selectedOrder.orderId);
                          if (updatedSale) {
                            setSelectedOrder(updatedSale);
                          }
                        }
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
  }

  // Fallback for pending and rejected merchants
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

// Premium Styles
const layoutContainerStyles: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  width: "100%",
  backgroundColor: "#f8fafc",
  fontFamily: "'Inter', sans-serif",
  color: "#1e293b",
};

const sidebarStyles: React.CSSProperties = {
  width: "260px",
  backgroundColor: "#ffffff",
  borderRight: "1px solid #e2e8f0",
  padding: "1.5rem 1.25rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "sticky",
  top: 0,
  height: "100vh",
  flexShrink: 0,
};

const sidebarTopStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.75rem",
};

const sidebarLogoStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  paddingLeft: "0.5rem",
};

const logoIconStyles: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  backgroundColor: "#ea580c",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoTextStyles: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 800,
  color: "#0f172a",
  letterSpacing: "-0.025em",
};

const sidebarNavStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const navItemStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  padding: "0.75rem 1rem",
  borderRadius: "12px",
  border: "none",
  backgroundColor: "transparent",
  color: "#64748b",
  fontSize: "0.9rem",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
  transition: "all 0.2s ease",
  width: "100%",
};

const navItemActiveStyles: React.CSSProperties = {
  ...navItemStyles,
  backgroundColor: "#fff7ed",
  color: "#ea580c",
};

const navIconStyles: React.CSSProperties = {
  color: "#94a3b8",
  flexShrink: 0,
};

const navIconActiveStyles: React.CSSProperties = {
  color: "#ea580c",
  flexShrink: 0,
};

const dividerStyles: React.CSSProperties = {
  height: "1px",
  backgroundColor: "#e2e8f0",
  margin: "0.75rem 0.5rem",
};

const sidebarBottomStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const supportCardStyles: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  borderRadius: "16px",
  padding: "1.25rem",
  border: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const supportLabelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.05em",
};

const supportButtonStyles: React.CSSProperties = {
  padding: "0.625rem",
  borderRadius: "10px",
  backgroundColor: "#ea580c",
  color: "white",
  fontWeight: 700,
  fontSize: "0.875rem",
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const signOutButtonStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.75rem",
  borderRadius: "12px",
  backgroundColor: "#fef2f2",
  color: "#dc2626",
  fontWeight: 600,
  fontSize: "0.9rem",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s",
  width: "100%",
};

const mainPanelStyles: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflow: "hidden",
};

const headerStyles: React.CSSProperties = {
  height: "76px",
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 2.5rem",
  flexShrink: 0,
};

const searchContainerStyles: React.CSSProperties = {
  position: "relative",
  width: "360px",
};

const headerSearchIconStyles: React.CSSProperties = {
  position: "absolute",
  left: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#94a3b8",
};

const headerSearchInputStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 1rem 0.625rem 2.75rem",
  borderRadius: "9999px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  fontSize: "0.875rem",
  color: "#1e293b",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const headerRightStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.25rem",
};

const iconBadgeWrapperStyles: React.CSSProperties = {
  position: "relative",
  cursor: "pointer",
  padding: "4px",
  color: "#64748b",
};

const headerIconStyles: React.CSSProperties = {
  color: "#64748b",
};

const badgeCountStyles: React.CSSProperties = {
  position: "absolute",
  top: "-2px",
  right: "-2px",
  backgroundColor: "#ef4444",
  color: "white",
  fontSize: "0.65rem",
  fontWeight: 700,
  minWidth: "16px",
  height: "16px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "2px",
  border: "2px solid #ffffff",
};

const headerDividerStyles: React.CSSProperties = {
  width: "1px",
  height: "36px",
  backgroundColor: "#e2e8f0",
};

const profileInfoStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const profileNameStyles: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "#1e293b",
};

const profileBusinessStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#94a3b8",
  fontWeight: 500,
};

const profileAvatarStyles: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "2px solid #ea580c",
};

const contentAreaStyles: React.CSSProperties = {
  flex: 1,
  padding: "2.5rem",
  overflowY: "auto",
};

const overviewTitleStyles: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "#0f172a",
  marginBottom: "0.25rem",
};

const overviewSubtitleStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "#64748b",
  fontWeight: 500,
};

const statsGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1.5rem",
  marginTop: "1.5rem",
};

const overviewCardStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #f1f5f9",
  borderRadius: "20px",
  padding: "1.5rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)",
};

const cardLabelStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const cardValueStyles: React.CSSProperties = {
  fontSize: "1.75rem",
  fontWeight: 800,
  color: "#0f172a",
  marginTop: "0.25rem",
};

const chartContainerStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #f1f5f9",
  borderRadius: "24px",
  padding: "2rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)",
};

const chartTitleStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 800,
  color: "#0f172a",
};

const chartSubtitleStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#64748b",
};

const chartSelectStyles: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#1e293b",
  backgroundColor: "#ffffff",
  outline: "none",
  cursor: "pointer",
};

const axisLabelContainerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.5rem 50px 0 50px",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.05em",
};

const twoColGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.7fr 1fr",
  gap: "1.5rem",
  alignItems: "start",
};

const panelContainerStyles: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #f1f5f9",
  borderRadius: "24px",
  padding: "2rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)",
};

const panelTitleStyles: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 800,
  color: "#0f172a",
};

const panelLinkStyles: React.CSSProperties = {
  border: "none",
  backgroundColor: "transparent",
  color: "#ea580c",
  fontSize: "0.875rem",
  fontWeight: 700,
  cursor: "pointer",
};

const panelTableStyles: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const panelThStyles: React.CSSProperties = {
  padding: "0.75rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#94a3b8",
  letterSpacing: "0.05em",
  textAlign: "left",
};

const panelTdStyles: React.CSSProperties = {
  padding: "1rem 0.5rem",
  fontSize: "0.875rem",
  color: "#64748b",
};

const productThumbStyles: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  objectFit: "cover",
  backgroundColor: "#f1f5f9",
};

const productNameTextStyles: React.CSSProperties = {
  fontWeight: 700,
  color: "#1e293b",
};

const categoryBadgeStyles: React.CSSProperties = {
  padding: "0.25rem 0.5rem",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  color: "#475569",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const progressBarBgStyles: React.CSSProperties = {
  width: "100%",
  height: "8px",
  borderRadius: "9999px",
  backgroundColor: "#f1f5f9",
  overflow: "hidden",
  position: "relative",
};

const demoSubtextContainerStyles: React.CSSProperties = {
  marginTop: "1.5rem",
  paddingTop: "1.25rem",
  borderTop: "1px solid #f1f5f9",
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const demoSubtextStyles: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
};

const demoLinkStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  border: "none",
  backgroundColor: "transparent",
  color: "#ea580c",
  fontSize: "0.875rem",
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
};

const productToDeleteIdStyles: React.CSSProperties = {
  color: "#dc2626",
};

// Premium Styles CSS Utilities
const filterBarStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginBottom: "1.5rem",
  padding: "1.25rem",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
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
  color: "#94a3b8",
  pointerEvents: "none",
};

const searchInputStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 2.75rem",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  backgroundColor: "#f8fafc",
  color: "#1e293b",
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
  border: "1px solid #e2e8f0",
  backgroundColor: "#ffffff",
  color: "#1e293b",
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
  backgroundColor: "#ea580c",
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
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  border: "1px solid #e2e8f0",
  flexWrap: "wrap",
  gap: "1rem",
};

const paginationInfoStyles: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#64748b",
};

const paginationNavStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

const paginationBtnStyles: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  backgroundColor: "white",
  color: "#1e293b",
  fontSize: "0.875rem",
  fontWeight: 600,
  transition: "all 0.2s",
};

const paginationNumStyles: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
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
  border: "1px solid #e2e8f0",
  backgroundColor: "white",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  outline: "none",
};

// functional utilities for dynamic styles
const iconBoxStyles = (bgColor: string, iconColor: string): React.CSSProperties => ({
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  backgroundColor: bgColor,
  color: iconColor,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const trendTagStyles = (bgColor: string, color: string): React.CSSProperties => ({
  fontSize: "0.75rem",
  fontWeight: 700,
  color: color,
  padding: "0.125rem 0.5rem",
  borderRadius: "9999px",
  backgroundColor: bgColor,
});

const progressBarFillStyles = (color: string, width: string): React.CSSProperties => ({
  height: "100%",
  backgroundColor: color,
  borderRadius: "9999px",
  width: width,
  position: "absolute",
  top: 0,
  left: 0,
});
