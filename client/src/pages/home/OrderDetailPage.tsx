import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, CreditCard, ShieldCheck, ShieldAlert, Package, AlertTriangle } from "lucide-react";
import { orderApi } from "@/entities/order/api/orderApi";
import { Header } from "@/shared/components/Header";
import { MSG_FAILED_LOAD_ORDER_DETAILS } from "@/shared/constants/messages";

interface OrderItem {
  productId: string;
  product?: {
    name?: string;
    images?: string[];
  };
  priceSnapshot: number;
  quantity: number;
  status: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  orderNumber?: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal confirm states
  const [actionItem, setActionItem] = useState<{ productId: string; productName: string; type: "cancelled" | "returned" } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await orderApi.getById(id);
      setOrder(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || MSG_FAILED_LOAD_ORDER_DETAILS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!order || !actionItem) return;
    try {
      setActionLoading(true);
      const res = await orderApi.updateUserItemStatus(order._id, actionItem.productId, actionItem.type);
      setOrder(res.data.order);
      setActionItem(null);
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to update status to ${actionItem.type}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    const defaultStyles = {
      padding: "0.25rem 0.75rem",
      borderRadius: "12px",
      fontSize: "0.75rem",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.02em",
    };

    switch (status.toLowerCase()) {
      case "pending":
        return { ...defaultStyles, backgroundColor: "#fef3c7", color: "#d97706" };
      case "processing":
        return { ...defaultStyles, backgroundColor: "#e0f2fe", color: "#0284c7" };
      case "shipped":
        return { ...defaultStyles, backgroundColor: "#ede9fe", color: "#7c3aed" };
      case "completed":
        return { ...defaultStyles, backgroundColor: "#d1fae5", color: "#059669" };
      case "cancelled":
        return { ...defaultStyles, backgroundColor: "#fee2e2", color: "#dc2626" };
      case "returned":
        return { ...defaultStyles, backgroundColor: "#f1f5f9", color: "#475569" };
      default:
        return { ...defaultStyles, backgroundColor: "#f1f5f9", color: "#64748b" };
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "4rem" }}>
          <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Retrieving order invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div style={{ width: "100%", maxWidth: "800px", margin: "4rem auto", padding: "0 2rem", textAlign: "center" }}>
          <div style={{ background: "white", padding: "3rem", borderRadius: "24px", border: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--error)", marginBottom: "1rem" }}>Error Loading Order</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{error || "Order not found."}</p>
            <Link to="/purchases" className="btn-primary" style={{ width: "auto", padding: "0.5rem 1.5rem", textDecoration: "none" }}>
              Back to My Purchases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "N/A";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, backgroundColor: "#f8fafc", padding: "3rem 0" }}>
        <div style={{ width: "100%", maxWidth: "950px", margin: "0 auto", padding: "0 2rem" }}>
          
          <Link to="/purchases" className="back-link" style={{ marginBottom: "1.5rem" }}>
            <ArrowLeft size={16} /> Back to Purchases
          </Link>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Order Details</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
                Order Placed on {dateStr}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>ORDER NUMBER</span>
              <span style={{ fontSize: "1rem", color: "var(--text-main)", fontWeight: 800 }}>{order.orderNumber || "N/A"}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "2rem", alignItems: "flex-start" }}>
            
            {/* Left side: Items lists */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ background: "white", padding: "2rem", borderRadius: "24px", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Package size={18} color="var(--primary)" /> Shipment Items
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  {order.items.map((item) => {
                    const subtotal = item.priceSnapshot * item.quantity;
                    const itemStatus = item.status || "pending";
                    const isPendingOrProcessing = itemStatus === "pending" || itemStatus === "processing";
                    const isShippedOrCompleted = itemStatus === "shipped" || itemStatus === "completed";

                    return (
                      <div key={item.productId} style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", borderBottom: "1px solid #f1f5f9", paddingBottom: "1.5rem" }}>
                        <img
                          src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                          alt={item.product?.name || "Product image"}
                          style={{ width: "72px", height: "72px", borderRadius: "12px", objectFit: "cover", border: "1px solid var(--border)", backgroundColor: "#f8fafc" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                              {item.product?.name || "Premium Product"}
                            </h3>
                            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-main)" }}>
                              ₹{subtotal.toFixed(2)}
                            </span>
                          </div>

                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0 0 0.75rem 0" }}>
                            ₹{item.priceSnapshot} × {item.quantity}
                          </p>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Status:</span>
                              <span style={getStatusBadgeStyles(itemStatus)}>{itemStatus}</span>
                            </div>

                            {/* Actions inside individual items */}
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              {isPendingOrProcessing && (
                                <button
                                  onClick={() => setActionItem({
                                    productId: item.productId,
                                    productName: item.product?.name || "Product",
                                    type: "cancelled"
                                  })}
                                  style={cancelBtnStyles}
                                >
                                  Cancel Item
                                </button>
                              )}
                              {isShippedOrCompleted && (
                                <button
                                  onClick={() => setActionItem({
                                    productId: item.productId,
                                    productName: item.product?.name || "Product",
                                    type: "returned"
                                  })}
                                  style={returnBtnStyles}
                                >
                                  Return Item
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: Address & Payment Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "100px" }}>
              {/* Delivery Details */}
              <div style={{ background: "white", padding: "1.75rem", borderRadius: "24px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--text-main)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <MapPin size={16} color="var(--primary)" /> Shipping Address
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.6" }}>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.9rem" }}>
                    {order.shippingAddress.fullName}
                  </strong>
                  <div style={{ marginTop: "0.25rem" }}>{order.shippingAddress.street}</div>
                  <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</div>
                  <div>{order.shippingAddress.country}</div>
                  <div style={{ marginTop: "0.5rem", fontWeight: 600, color: "var(--text-main)" }}>
                    Phone: {order.shippingAddress.phone}
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div style={{ background: "white", padding: "1.75rem", borderRadius: "24px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--text-main)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <CreditCard size={16} color="var(--primary)" /> Payment Details
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <span>Items Subtotal</span>
                    <span style={{ fontWeight: 600, color: "var(--text-main)" }}>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <span>Shipping Charges</span>
                    <span style={{ fontWeight: 700, color: "#10b981" }}>FREE</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.05rem", fontWeight: 800, marginTop: "1rem" }}>
                  <span>Total Amount Paid</span>
                  <span style={{ color: "var(--primary)" }}>₹{order.totalAmount.toFixed(2)}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.5rem", color: "var(--text-muted)", fontSize: "0.75rem", background: "#f8fafc", padding: "0.75rem", borderRadius: "12px" }}>
                  <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0 }} />
                  <span>Secure checkout transaction via Razorpay.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {actionItem && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "440px", width: "90%", padding: "2rem", borderRadius: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <div style={actionItem.type === "cancelled" ? warningIconContainerStyles : returnIconContainerStyles}>
                <AlertTriangle size={28} color={actionItem.type === "cancelled" ? "#dc2626" : "var(--primary)"} />
              </div>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-main)", marginTop: "1.25rem", marginBottom: "0.5rem" }}>
                {actionItem.type === "cancelled" ? "Cancel Order Item?" : "Return Order Item?"}
              </h3>

              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 1.75rem 0" }}>
                {actionItem.type === "cancelled" ? (
                  <>Are you sure you want to cancel <strong>"{actionItem.productName}"</strong>? This action will halt fulfillment and cannot be undone.</>
                ) : (
                  <>Are you sure you want to return <strong>"{actionItem.productName}"</strong>? This will create a return request with the merchant.</>
                )}
              </p>

              <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                <button
                  onClick={() => setActionItem(null)}
                  disabled={actionLoading}
                  className="modal-btn modal-btn-secondary"
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={actionLoading}
                  className="modal-btn"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "12px",
                    backgroundColor: actionItem.type === "cancelled" ? "#dc2626" : "var(--primary)",
                    color: "white",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.2s"
                  }}
                >
                  {actionLoading ? "Processing..." : actionItem.type === "cancelled" ? "Cancel Product" : "Request Return"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const cancelBtnStyles: React.CSSProperties = {
  padding: "0.4rem 0.9rem",
  borderRadius: "10px",
  backgroundColor: "white",
  color: "#dc2626",
  border: "1px solid #fee2e2",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const returnBtnStyles: React.CSSProperties = {
  padding: "0.4rem 0.9rem",
  borderRadius: "10px",
  backgroundColor: "white",
  color: "var(--primary)",
  border: "1px solid #e0e7ff",
  fontSize: "0.8rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
};

const warningIconContainerStyles: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: "#fee2e2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const returnIconContainerStyles: React.CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  backgroundColor: "#e0e7ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
