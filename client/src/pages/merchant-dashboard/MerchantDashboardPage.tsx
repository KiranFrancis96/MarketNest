import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { merchantApi } from "@/entities/merchant/api/merchantApi";
import { setMerchant, logoutMerchant } from "@/entities/merchant/model/merchantSlice";
import { useNavigate } from "react-router-dom";

export const MerchantDashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const merchant = useSelector((state: any) => state.merchant.merchant);
  const isLoading = useSelector((state: any) => state.merchant.isLoading);

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
    let intervalId: NodeJS.Timeout;
    if (merchant?.status === "pending") {
      intervalId = setInterval(fetchProfile, 10000); // Poll every 10 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dispatch, navigate, merchant?.status]);

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
          <div className="status-page-container" style={{ borderColor: "#fecaca" }}>
            <div className="status-icon-container status-icon-rejected">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <h2 className="status-title" style={{ color: "#dc2626" }}>Approval Failed</h2>
            <div className="rejection-box">
              <span className="rejection-label">Reason for Rejection:</span>
              <p className="rejection-text">"{merchant.rejectionReason || "Reason not specified."}"</p>
            </div>
            <p className="status-description">
              Unfortunately, your merchant account approval has <strong>Failed</strong>. 
              Please address the issues above or contact support.
            </p>
            <button className="btn-primary" style={{ maxWidth: "250px", margin: "0 auto" }}>Contact Support</button>
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
                <h3 className="stat-value">$0.00</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Orders</p>
                <h3 className="stat-value">0</h3>
              </div>
              <div className="stat-card">
                <p className="stat-label">Products</p>
                <h3 className="stat-value">0</h3>
              </div>
            </div>

            <div style={{ marginTop: "3rem", padding: "3rem", background: "white", borderRadius: "24px", border: "1px dashed #cbd5e1", textAlign: "center" }}>
              <p style={{ color: "#64748b", fontWeight: "600" }}>Your store is live! Start by adding your first product.</p>
              <button className="btn-primary" style={{ maxWidth: "200px", margin: "1.5rem auto 0" }}>+ Add Product</button>
            </div>
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
