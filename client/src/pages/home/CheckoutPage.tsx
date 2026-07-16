import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, ShieldAlert } from "lucide-react";
import type { RootState, AppDispatch } from "@/app/store";
import { orderApi } from "@/entities/order/api/orderApi";
import { userApi } from "@/entities/user/api/userApi";
import { Header } from "@/shared/components/Header";
import { fetchCart } from "@/features/cart/model/cartSlice";
import { setUser } from "@/entities/user/model/userSlice";
import { MSG_FAILED_INIT_CHECKOUT, MSG_FAILED_SAVE_ADDRESS } from "@/shared/constants/messages";

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const user = useSelector((state: RootState) => state.user.user);

  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);

  // Form states inside the checkout modal
  const [modalFullName, setModalFullName] = useState("");
  const [modalPhone, setModalPhone] = useState("");
  const [modalStreet, setModalStreet] = useState("");
  const [modalCity, setModalCity] = useState("");
  const [modalState, setModalState] = useState("");
  const [modalZipCode, setModalZipCode] = useState("");
  const [modalCountry, setModalCountry] = useState("India");
  const [modalIsDefault, setModalIsDefault] = useState(false);
  const [modalError, setModalError] = useState("");

  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "razorpay">("razorpay");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [fundsAmount, setFundsAmount] = useState("1000");
  const [fundsError, setFundsError] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalAmount, setSuccessModalAmount] = useState(0);

  // Initialize selectedAddressId to default or first address
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      }
    }
  }, [user, selectedAddressId]);

  // Synchronize fields when selectedAddressId changes
  useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && selectedAddressId) {
      const activeAddr = user.addresses.find((a: any) => a._id === selectedAddressId);
      if (activeAddr) {
        setFullName(activeAddr.fullName);
        setPhone(activeAddr.phone);
        setStreet(activeAddr.street);
        setCity(activeAddr.city);
        setState(activeAddr.state);
        setZipCode(activeAddr.zipCode);
        setCountry(activeAddr.country);
      }
    }
  }, [user, selectedAddressId]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

interface RazorpayInstance {
  open(): void;
}

interface RazorpayWindow {
  Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
}

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as unknown as RazorpayWindow).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        setScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);

  if (items.length === 0 && !loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Your cart is empty</h2>
          <Link to="/catalog" className="btn-primary" style={{ width: "auto", padding: "0.5rem 1.5rem", textDecoration: "none" }}>
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddFundsAndRetry = async (amount: number) => {
    try {
      setLoading(true);
      await orderApi.addWalletFunds(amount);
      
      const profileRes = await userApi.getProfile();
      dispatch(setUser(profileRes.data));

      setIsAddFundsModalOpen(false);
      setFundsError("");
      setPaymentError(null);
      setSuccessModalAmount(amount);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Wallet checkout top-up error:", err);
      setFundsError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !street || !city || !state || !zipCode || !country) {
      alert("Please fill in all shipping fields.");
      return;
    }

    setLoading(true);
    setPaymentError(null);

    let createdOrderId = failedOrderId;

    try {
      // 1. Create order if not already created (or reuse failed order ID)
      if (!createdOrderId) {
        if (saveAddressToProfile && (!user?.addresses || user.addresses.length === 0)) {
          try {
            const res = await userApi.addAddress({
              fullName,
              phone,
              street,
              city,
              state,
              zipCode,
              country,
              isDefault: true,
            });
            dispatch(setUser(res.data.user));
          } catch (err) {
            console.error("Failed to save address to profile automatically", err);
          }
        }

        const res = await orderApi.create({
          fullName,
          phone,
          street,
          city,
          state,
          zipCode,
          country
        });
        createdOrderId = res.data.order._id;
        setFailedOrderId(createdOrderId);
      }

      // 2. Perform wallet payment
      if (paymentMethod === "wallet") {
        try {
          await orderApi.payWithWallet(createdOrderId!);
          
          // Sync user's profile to update wallet balance in state
          const profileRes = await userApi.getProfile();
          dispatch(setUser(profileRes.data));

          navigate(`/order-success/${createdOrderId}`);
        } catch (err: any) {
          const message = err.response?.data?.message || "Wallet payment failed";
          setPaymentError(message);
          setLoading(false);
        }
      } else {
        // 3. Perform Razorpay payment
        const isScriptReady = await loadScript();
        if (!isScriptReady) {
          setPaymentError("Failed to load Razorpay checkout script. Check your network connection.");
          setLoading(false);
          return;
        }

        const res = await orderApi.create({
          fullName,
          phone,
          street,
          city,
          state,
          zipCode,
          country
        });
        const { keyId, razorpayOrder } = res.data;

        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "MarketNest",
          description: "Order Payment Checkout",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100",
          order_id: razorpayOrder.id,
          handler: async (response: any) => {
            setLoading(true);
            try {
              const verifyRes = await orderApi.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              navigate(`/order-success/${verifyRes.data.order._id}`);
            } catch (err: any) {
              const message = err.response?.data?.message || "Payment verification failed";
              setPaymentError(message);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: fullName,
            email: user?.email,
            contact: phone
          },
          theme: {
            color: "#4f46e5"
          },
          modal: {
            ondismiss: async () => {
              setLoading(false);
              setPaymentError("Razorpay payment cancelled or dismissed. The order has been marked as failed.");
              try {
                await orderApi.markAsFailed(createdOrderId!);
              } catch (err) {
                console.error("Failed to mark order as failed in database", err);
              }
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      const message = err.response?.data?.message || MSG_FAILED_INIT_CHECKOUT;
      setPaymentError(message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, backgroundColor: "#f8fafc", padding: "3rem 0" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
          <Link to="/cart" className="back-link">
            <ArrowLeft size={16} /> Back to Cart
          </Link>

          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", letterSpacing: "-0.02em" }}>
            Secure Checkout
          </h1>

          <div style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            
            <div style={{ flex: 1.4, minWidth: "320px" }}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Shipping Details</h2>
                  {user?.addresses && user.addresses.length > 0 && (
                    <button
                      onClick={() => {
                        setEditingAddress(null);
                        setModalFullName("");
                        setModalPhone("");
                        setModalStreet("");
                        setModalCity("");
                        setModalState("");
                        setModalZipCode("");
                        setModalCountry("India");
                        setModalIsDefault(false);
                        setModalError("");
                        setIsModalOpen(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      + Add New Address
                    </button>
                  )}
                </div>

                {user?.addresses && user.addresses.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      {user.addresses.map((addr: any) => {
                        const isSelected = addr._id === selectedAddressId;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => setSelectedAddressId(addr._id)}
                            style={{
                              padding: "1rem",
                              borderRadius: "16px",
                              border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                              backgroundColor: isSelected ? "rgba(99, 102, 241, 0.02)" : "white",
                              cursor: "pointer",
                              position: "relative",
                              transition: "all 0.2s",
                            }}
                          >
                            {addr.isDefault && (
                              <span style={{
                                position: "absolute",
                                top: "0.75rem",
                                right: "0.75rem",
                                fontSize: "0.6rem",
                                fontWeight: 800,
                                color: "var(--primary)",
                                backgroundColor: "#e0e7ff",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "6px",
                              }}>
                                DEFAULT
                              </span>
                            )}
                            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.5rem 0", color: "var(--text-main)" }}>
                              {addr.fullName}
                            </h4>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.25rem 0" }}>
                              {addr.street}
                            </p>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.25rem 0" }}>
                              {addr.city}, {addr.state} - {addr.zipCode}
                            </p>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.5rem 0" }}>
                              {addr.country}
                            </p>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-main)", fontWeight: 600, margin: 0 }}>
                              Phone: {addr.phone}
                            </p>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddress(addr);
                                setModalFullName(addr.fullName);
                                setModalPhone(addr.phone);
                                setModalStreet(addr.street);
                                setModalCity(addr.city);
                                setModalState(addr.state);
                                setModalZipCode(addr.zipCode);
                                setModalCountry(addr.country);
                                setModalIsDefault(addr.isDefault);
                                setModalError("");
                                setIsModalOpen(true);
                              }}
                              style={{
                                position: "absolute",
                                bottom: "0.75rem",
                                right: "0.75rem",
                                background: "none",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              Edit
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handlePayment} style={{ marginTop: "1rem" }}>
                      <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid var(--border)", marginBottom: "1.5rem" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: "0 0 0.5rem 0", textTransform: "uppercase", color: "var(--text-muted)" }}>
                          Selected Delivery Location
                        </h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 600, margin: "0 0 0.25rem 0" }}>
                          {fullName} — {phone}
                        </p>
                        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", margin: 0 }}>
                          {street}, {city}, {state} - {zipCode}, {country}
                        </p>
                      </div>

                    {/* Payment Method Selector */}
                    <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginBottom: "1rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-main)" }}>Select Payment Method</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* Wallet Payment Method */}
                        <label 
                          style={{
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            padding: "0.85rem 1rem", 
                            borderRadius: "12px", 
                            border: paymentMethod === "wallet" ? "2px solid var(--primary)" : "1px solid var(--border)",
                            backgroundColor: paymentMethod === "wallet" ? "rgba(79, 70, 229, 0.03)" : "transparent",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="wallet" 
                              checked={paymentMethod === "wallet"}
                              onChange={() => { setPaymentMethod("wallet"); setPaymentError(null); }}
                              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>MarketNest Wallet</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                Balance: ₹{(user?.walletBalance || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: (user?.walletBalance || 0) < subtotal ? "#dc2626" : "#10b981", fontWeight: 700 }}>
                            {(user?.walletBalance || 0) < subtotal ? "Insufficient Balance" : "Available"}
                          </span>
                        </label>

                        {/* Razorpay Payment Method */}
                        <label 
                          style={{
                            display: "flex", 
                            alignItems: "center", 
                            padding: "0.85rem 1rem", 
                            borderRadius: "12px", 
                            border: paymentMethod === "razorpay" ? "2px solid var(--primary)" : "1px solid var(--border)",
                            backgroundColor: paymentMethod === "razorpay" ? "rgba(79, 70, 229, 0.03)" : "transparent",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="razorpay" 
                              checked={paymentMethod === "razorpay"}
                              onChange={() => { setPaymentMethod("razorpay"); setPaymentError(null); }}
                              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Cards, NetBanking, UPI (Razorpay)</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Pay securely using Razorpay gateway</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Payment Error Card for Failed Payment Scenario */}
                    {paymentError && (
                      <div 
                        style={{
                          marginTop: "1.5rem",
                          padding: "1rem",
                          borderRadius: "12px",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fee2e2",
                          color: "#991b1b",
                          marginBottom: "1rem"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <ShieldAlert size={18} color="#dc2626" />
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>Payment Attempt Failed</span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#b91c1c", margin: "0 0 1rem 0", lineHeight: 1.4 }}>{paymentError}</p>
                        
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {paymentMethod === "wallet" && (
                            <button
                              type="button"
                              onClick={() => {
                                const deficit = Math.max(1, Math.ceil(subtotal - (user?.walletBalance || 0)));
                                setFundsAmount(String(deficit));
                                setFundsError("");
                                setIsAddFundsModalOpen(true);
                              }}
                              style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#10b981",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              Top Up Wallet
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentError(null);
                              setPaymentMethod("razorpay");
                            }}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "8px",
                              border: "1px solid #334155",
                              backgroundColor: "#1e293b",
                              color: "#cbd5e1",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Switch to Razorpay
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                        height: "48px",
                        borderRadius: "12px",
                        width: "100%",
                        marginTop: 0,
                      }}
                    >
                      <CreditCard size={18} />
                      {loading ? "Processing Payment..." : `Pay ₹${subtotal.toFixed(2)}`}
                    </button>
                  </form>
                  </div>
                ) : (
                  <form onSubmit={handlePayment}>
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-input"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          placeholder="9876543210"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Country *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          required
                          placeholder="India"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Street Address *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        required
                        placeholder="Flat/House No, Building, Area"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                          placeholder="Mumbai"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">State *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                          placeholder="Maharashtra"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">ZIP / Postal Code *</label>
                        <input
                          type="text"
                          className="form-input"
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          required
                          placeholder="400001"
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
                      <input
                        type="checkbox"
                        id="saveAddressProfileChk"
                        checked={saveAddressToProfile}
                        onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <label htmlFor="saveAddressProfileChk" style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, cursor: "pointer" }}>
                        Save this address to my profile address book
                      </label>
                    </div>

                    {/* Payment Method Selector */}
                    <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text-main)" }}>Select Payment Method</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {/* Wallet Payment Method */}
                        <label 
                          style={{
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            padding: "0.85rem 1rem", 
                            borderRadius: "12px", 
                            border: paymentMethod === "wallet" ? "2px solid var(--primary)" : "1px solid var(--border)",
                            backgroundColor: paymentMethod === "wallet" ? "rgba(79, 70, 229, 0.03)" : "transparent",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="wallet" 
                              checked={paymentMethod === "wallet"}
                              onChange={() => { setPaymentMethod("wallet"); setPaymentError(null); }}
                              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>MarketNest Wallet</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                Balance: ₹{(user?.walletBalance || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <span style={{ fontSize: "0.75rem", color: (user?.walletBalance || 0) < subtotal ? "#dc2626" : "#10b981", fontWeight: 700 }}>
                            {(user?.walletBalance || 0) < subtotal ? "Insufficient Balance" : "Available"}
                          </span>
                        </label>

                        {/* Razorpay Payment Method */}
                        <label 
                          style={{
                            display: "flex", 
                            alignItems: "center", 
                            padding: "0.85rem 1rem", 
                            borderRadius: "12px", 
                            border: paymentMethod === "razorpay" ? "2px solid var(--primary)" : "1px solid var(--border)",
                            backgroundColor: paymentMethod === "razorpay" ? "rgba(79, 70, 229, 0.03)" : "transparent",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <input 
                              type="radio" 
                              name="paymentMethod" 
                              value="razorpay" 
                              checked={paymentMethod === "razorpay"}
                              onChange={() => { setPaymentMethod("razorpay"); setPaymentError(null); }}
                              style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Cards, NetBanking, UPI (Razorpay)</span>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Pay securely using Razorpay gateway</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Payment Error Card for Failed Payment Scenario */}
                    {paymentError && (
                      <div 
                        style={{
                          marginTop: "1.5rem",
                          padding: "1rem",
                          borderRadius: "12px",
                          backgroundColor: "#fef2f2",
                          border: "1px solid #fee2e2",
                          color: "#991b1b"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                          <ShieldAlert size={18} color="#dc2626" />
                          <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>Payment Attempt Failed</span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#b91c1c", margin: "0 0 1rem 0", lineHeight: 1.4 }}>{paymentError}</p>
                        
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          {paymentMethod === "wallet" && (
                            <button
                              type="button"
                              onClick={() => {
                                const deficit = Math.max(1, Math.ceil(subtotal - (user?.walletBalance || 0)));
                                setFundsAmount(String(deficit));
                                setFundsError("");
                                setIsAddFundsModalOpen(true);
                              }}
                              style={{
                                padding: "0.4rem 0.8rem",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#10b981",
                                color: "white",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              Top Up Wallet
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentError(null);
                              setPaymentMethod("razorpay");
                            }}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "8px",
                              border: "1px solid #334155",
                              backgroundColor: "#1e293b",
                              color: "#cbd5e1",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              cursor: "pointer"
                            }}
                          >
                            Switch to Razorpay
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                      style={{
                        marginTop: "1.5rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                        height: "48px",
                        borderRadius: "12px",
                        width: "100%"
                      }}
                    >
                      <CreditCard size={18} />
                      {loading ? "Processing..." : `Pay ₹${subtotal.toFixed(2)}`}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div style={{ flex: 0.9, minWidth: "300px", position: "sticky", top: "100px" }}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.5rem" }}>Order Items</h2>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "240px", overflowY: "auto", paddingRight: "0.5rem", marginBottom: "1.5rem" }}>
                  {items.map((item) => (
                    <div key={item.productId} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <img
                        src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50"}
                        alt={item.product?.name}
                        style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                      />
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.product?.name}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                          Qty: {item.quantity} × ₹{item.priceSnapshot}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-main)" }}>
                        ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    <span>Shipping</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>FREE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, marginTop: "0.75rem" }}>
                    <span>Total Due</span>
                    <span style={{ color: "var(--primary)" }}>₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2rem", color: "var(--text-muted)", fontSize: "0.75rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "10px" }}>
                  <ShieldCheck size={18} color="#10b981" />
                  <span>Payments are secure and processed directly via Razorpay.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Dynamic Address Management Modal */}
      {isModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "500px", width: "90%", borderRadius: "24px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>
                {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}>&times;</button>
            </div>

            {modalError && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "12px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                <ShieldAlert size={18} style={{ marginRight: "0.5rem", flexShrink: 0 }} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!modalFullName || !modalPhone || !modalStreet || !modalCity || !modalState || !modalZipCode || !modalCountry) {
                setModalError("All fields are required.");
                return;
              }
              const payload = {
                fullName: modalFullName,
                phone: modalPhone,
                street: modalStreet,
                city: modalCity,
                state: modalState,
                zipCode: modalZipCode,
                country: modalCountry,
                isDefault: modalIsDefault
              };
              try {
                let res;
                if (editingAddress) {
                  res = await userApi.updateAddress(editingAddress._id, payload);
                } else {
                  res = await userApi.addAddress(payload);
                }
                dispatch(setUser(res.data.user));
                setIsModalOpen(false);
                // Automatically set this newly created/edited address as selected
                const addresses = res.data.user.addresses || [];
                if (addresses.length > 0) {
                  // Find the one we just added/edited
                  const matched = addresses.find((a: any) => a.street === modalStreet && a.fullName === modalFullName) || addresses[addresses.length - 1];
                  if (matched) {
                    setSelectedAddressId(matched._id);
                  }
                }
              } catch (err: any) {
                setModalError(err.response?.data?.message || MSG_FAILED_SAVE_ADDRESS);
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={modalFullName}
                  onChange={(e) => setModalFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Flat/House No, Building, Area"
                  value={modalStreet}
                  onChange={(e) => setModalStreet(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Mumbai"
                    value={modalCity}
                    onChange={(e) => setModalCity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Maharashtra"
                    value={modalState}
                    onChange={(e) => setModalState(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="400001"
                    value={modalZipCode}
                    onChange={(e) => setModalZipCode(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="India"
                    value={modalCountry}
                    onChange={(e) => setModalCountry(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="modalIsDefaultAddress"
                  checked={modalIsDefault}
                  disabled={editingAddress?.isDefault}
                  onChange={(e) => setModalIsDefault(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="modalIsDefaultAddress" style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 600, cursor: "pointer" }}>
                  Set as default shipping address
                </label>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", width: "auto" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", width: "auto", marginTop: 0 }}
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Wallet Funds Modal */}
      {isAddFundsModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "400px", width: "90%", borderRadius: "24px", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>Add Funds to Wallet</h3>
              <button 
                onClick={() => setIsAddFundsModalOpen(false)} 
                style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--text-muted)" }}
              >
                &times;
              </button>
            </div>

            {fundsError && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "12px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", fontSize: "0.875rem", fontWeight: 600, display: "flex", alignItems: "center", marginBottom: "1rem" }}>
                <ShieldAlert size={18} style={{ marginRight: "0.5rem", flexShrink: 0 }} />
                <span>{fundsError}</span>
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const amt = parseFloat(fundsAmount);
                if (isNaN(amt) || amt <= 0) {
                  setFundsError("Please enter a valid positive amount.");
                  return;
                }
                handleAddFundsAndRetry(amt);
              }}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div className="form-group">
                <label className="form-label">Enter Amount (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  step="any"
                  placeholder="e.g. 500"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setIsAddFundsModalOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", width: "auto" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", width: "auto", marginTop: 0 }}
                >
                  {loading ? "Processing..." : "Confirm Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {isSuccessModalOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "420px", width: "90%", padding: "2rem", borderRadius: "24px", textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#ecfdf5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
              border: "2px solid #a7f3d0"
            }}>
              <ShieldCheck size={36} color="#10b981" />
            </div>

            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              Funds Added!
            </h3>

            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 1.75rem 0" }}>
              Successfully added <strong style={{ color: "var(--text-main)" }}>₹{successModalAmount.toLocaleString()}</strong> to your MarketNest Wallet.
              <br />
              New Balance: <strong style={{ color: "var(--primary)" }}>₹{(user?.walletBalance || 0).toLocaleString()}</strong>
            </p>

            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="btn-primary"
              style={{ width: "100%", padding: "0.75rem", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, marginTop: 0 }}
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
