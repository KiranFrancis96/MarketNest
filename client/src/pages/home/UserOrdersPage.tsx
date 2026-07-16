import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Calendar, MapPin, CheckCircle, Package } from "lucide-react";
import { orderApi } from "@/entities/order/api/orderApi";
import { Header } from "@/shared/components/Header";
import { MSG_FAILED_LOAD_PURCHASES } from "@/shared/constants/messages";

interface ClientProduct {
  images?: string[];
  name?: string;
}

interface ClientOrderItem {
  product?: ClientProduct;
  priceSnapshot: number;
  quantity: number;
}

interface ClientOrder {
  _id: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  orderNumber?: string;
  items: ClientOrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await orderApi.getUserHistory(currentPage, itemsPerPage);
        setOrders(res.data.orders);
        setTotalOrders(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error.response?.data?.message || MSG_FAILED_LOAD_PURCHASES);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentPage]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, backgroundColor: "#f8fafc", padding: "3rem 0" }}>
        <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", padding: "0 2rem" }}>
          
          <Link to="/catalog" className="back-link">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>

          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "2rem", letterSpacing: "-0.02em" }}>
            My Purchases
          </h1>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
              <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
              <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Loading transaction records...</p>
            </div>
          ) : error ? (
            <div style={{ background: "white", padding: "3rem", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--error)", marginBottom: "1rem" }}>Error Loading Purchases</h2>
              <p style={{ color: "var(--text-muted)" }}>{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ background: "white", padding: "5rem 2rem", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
              <div style={{ display: "inline-flex", background: "#f1f5f9", padding: "1rem", borderRadius: "50%", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                <Package size={40} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>No purchases yet</h3>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem auto" }}>
                You haven't ordered any premium products yet. Start exploring our catalog to fill up your library!
              </p>
              <Link to="/catalog" className="btn-primary" style={{ width: "auto", padding: "0.75rem 2rem", borderRadius: "12px", textDecoration: "none" }}>
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              {orders.map((order) => {
                const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "N/A";

                return (
                  <div key={order._id} style={{ background: "white", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                    <div style={{ backgroundColor: "#f8fafc", padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ORDER PLACED</span>
                        <span style={{ fontSize: "0.875rem", color: "var(--text-main)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar size={14} /> {dateStr}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>TOTAL AMOUNT</span>
                        <span style={{ fontSize: "1.1rem", color: "var(--primary)", fontWeight: 800 }}>₹{order.totalAmount.toFixed(2)}</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-end" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>ORDER NUMBER</span>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-main)", fontWeight: 700 }}>{order.orderNumber || "N/A"}</span>
                        <Link to={`/purchases/${order._id}`} style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700, textDecoration: "none", marginTop: "0.25rem" }}>
                          Track / Manage Order →
                        </Link>
                      </div>
                    </div>

                    <div style={{ padding: "2rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2.5rem", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                          {order.items.map((item: ClientOrderItem, idx: number) => (
                            <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                              <img
                                src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50"}
                                alt={item.product?.name}
                                style={{ width: "56px", height: "56px", borderRadius: "10px", objectFit: "cover", border: "1px solid var(--border)", backgroundColor: "#f8fafc" }}
                              />
                              <div style={{ flex: 1, overflow: "hidden" }}>
                                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {item.product?.name || "Product Listing"}
                                </h4>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                                  ₹{item.priceSnapshot} × {item.quantity}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>
                                ₹{(item.priceSnapshot * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{ background: "#f8fafc", padding: "1.25rem 1.5rem", borderRadius: "16px", border: "1px solid var(--border)", height: "fit-content" }}>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: "var(--text-main)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <MapPin size={14} color="var(--primary)" /> Delivery Coordinates
                          </h4>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
                            <strong style={{ color: "var(--text-main)" }}>{order.shippingAddress.fullName}</strong>
                            <div>{order.shippingAddress.street}</div>
                            <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</div>
                            <div style={{ marginTop: "0.25rem", fontWeight: 600 }}>Phone: {order.shippingAddress.phone}</div>
                          </div>
                        </div>

                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "2rem" }}>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      backgroundColor: currentPage === 1 ? "#f1f5f9" : "white",
                      color: currentPage === 1 ? "var(--text-muted)" : "var(--text-main)",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      transition: "all 0.2s"
                    }}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          border: isActive ? "none" : "1px solid var(--border)",
                          backgroundColor: isActive ? "var(--primary)" : "white",
                          color: isActive ? "white" : "var(--text-main)",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s"
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      backgroundColor: currentPage === totalPages ? "#f1f5f9" : "white",
                      color: currentPage === totalPages ? "var(--text-muted)" : "var(--text-main)",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      transition: "all 0.2s"
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
