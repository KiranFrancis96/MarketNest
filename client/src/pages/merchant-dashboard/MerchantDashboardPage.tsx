import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { setMerchant, logoutMerchant } from "@/entities/merchant/model/merchantSlice";
import { useNavigate } from "react-router-dom";
import { ProductTable } from "@/shared/components/ProductTable";
import { AddProductModal } from "@/features/product/ui/AddProductModal";
import { fetchMerchantProducts, deleteProduct, type Product } from "@/features/product/model/productSlice";
import type { RootState, AppDispatch } from "@/app/store";

export const MerchantDashboardPage = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const navigate   = useNavigate();
  const merchant   = useSelector((state: any) => state.merchant.merchant);
  const isLoading  = useSelector((state: any) => state.merchant.isLoading);
  const merchantProducts = useSelector((state: RootState) => state.product.merchantProducts);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isReapplying, setIsReapplying] = useState(false);
  const [reapplyError, setReapplyError] = useState("");
  const [reapplySuccess, setReapplySuccess] = useState(false);
  const [reapplyErrors, setReapplyErrors] = useState<Record<string, string>>({});

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
      } catch (err) {
        dispatch(logoutMerchant());
        navigate("/merchant/auth");
      }
    };

    fetchProfile();

    // Set up polling if the merchant is pending
    let intervalId: any;
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
    }
  }, [dispatch, merchant?.status]);

  const handleLogout = async () => {
    try {
      await merchantApi.logout();
    } catch (e) {
      console.error(e);
    }
    dispatch(logoutMerchant());
    navigate("/merchant/auth");
  };

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
                    } catch (err: any) {
                      setReapplyError(err?.response?.data?.message ?? "Reapplication failed. Please try again.");
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
                <h3 className="stat-value">₹0.00</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Orders</p>
                <h3 className="stat-value">0</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Products</p>
                <h3 className="stat-value">{merchantProducts.length}</h3>
              </div>
            </div>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Your Listings</h2>
              <button 
                className="btn-primary" 
                onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                style={{ width: "auto", marginTop: 0, padding: "0.625rem 1.25rem", borderRadius: "10px" }}
              >
                + Add Product
              </button>
            </div>

            <ProductTable 
              products={merchantProducts} 
              mode="merchant"
              onEdit={(prod) => {
                setEditingProduct(prod);
                setIsModalOpen(true);
              }}
              onDelete={(id) => {
                if (window.confirm("Are you sure you want to delete this product listing? This action is permanent.")) {
                  dispatch(deleteProduct(id));
                }
              }}
            />

            <AddProductModal 
              isOpen={isModalOpen} 
              onClose={() => {
                setIsModalOpen(false);
                setEditingProduct(null);
              }} 
              productToEdit={editingProduct} 
            />
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
