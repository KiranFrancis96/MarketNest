import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, Truck, Calendar, MapPin } from "lucide-react";
import { orderApi } from "@/entities/order/api/orderApi";
import { Header } from "@/shared/components/Header";

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
  razorpayPaymentId?: string;
  createdAt?: string;
  totalAmount: number;
  status: string;
  items: ClientOrderItem[];
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

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        const res = await orderApi.getById(id);
        setOrder(res.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        setError(error.response?.data?.message || "Failed to load order confirmation details.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, backgroundColor: "#f8fafc", padding: "4rem 0" }}>
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto", padding: "0 2rem" }}>
          
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem" }}>
              <div className="animate-spin" style={{ width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTopColor: "var(--primary)", borderRadius: "50%" }}></div>
              <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>Loading confirmation details...</p>
            </div>
          ) : error || !order ? (
            <div style={{ background: "white", padding: "3rem", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--error)", marginBottom: "1rem" }}>Error Loading Order</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{error || "Order details could not be found."}</p>
              <Link to="/catalog" className="btn-primary" style={{ width: "auto", padding: "0.5rem 1.5rem", textDecoration: "none" }}>
                Return to Shop
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ background: "white", padding: "3rem 2rem", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyItems: "center", background: "#ecfdf5", padding: "0.75rem", borderRadius: "50%", color: "#10b981", marginBottom: "1.5rem" }}>
                  <CheckCircle size={48} />
                </div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>Order Confirmed!</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Thank you for shopping with us. Your transaction was processed successfully.</p>
                
                <div style={{ marginTop: "2rem", display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem", background: "#f8fafc", padding: "1rem 2rem", borderRadius: "16px", border: "1px solid var(--border)", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)" }}>
                  <div>Order ID: <span style={{ color: "var(--text-main)", fontWeight: 700 }}>#{order._id}</span></div>
                  <div>Payment ID: <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{order.razorpayPaymentId}</span></div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ background: "white", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ShoppingBag size={18} color="var(--primary)" /> Shipment Items
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {order.items.map((item: ClientOrderItem, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: idx < order.items.length - 1 ? "1px solid #f1f5f9" : "none", paddingBottom: idx < order.items.length - 1 ? "1rem" : "0" }}>
                        <img
                          src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=50"}
                          alt={item.product?.name}
                          style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                        />
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <h4 style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.product?.name || "Product Item"}
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
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  <div style={{ background: "white", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Truck size={18} color="var(--primary)" /> Delivery Details
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <MapPin size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <strong style={{ color: "var(--text-main)" }}>{order.shippingAddress.fullName}</strong>
                          <div style={{ marginTop: "0.25rem" }}>{order.shippingAddress.street}</div>
                          <div>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</div>
                          <div>{order.shippingAddress.country}</div>
                          <div style={{ marginTop: "0.4rem", fontWeight: 600 }}>Phone: {order.shippingAddress.phone}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: "white", padding: "2rem", borderRadius: "20px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>Billing Breakdown</h3>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                      <span>Status</span>
                      <span style={{ color: "#10b981", fontWeight: 700, textTransform: "uppercase" }}>Paid</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800, borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                      <span>Amount Paid</span>
                      <span style={{ color: "var(--primary)" }}>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>

              <Link to="/catalog" className="btn-primary" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", textDecoration: "none", height: "48px", borderRadius: "12px", width: "100%", marginTop: "1rem" }}>
                Continue Shopping
              </Link>

            </div>
          )}

        </div>
      </main>
    </div>
  );
};
