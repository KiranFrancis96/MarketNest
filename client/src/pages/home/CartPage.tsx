import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateCartQuantity, removeFromCart, clearCart } from "@/features/cart/model/cartSlice";
import { Header } from "@/shared/components/Header";
import type { RootState, AppDispatch } from "@/app/store";
import { Trash2, Plus, Minus, ArrowLeft, CreditCard, ShoppingCart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const cartState = useSelector((state: RootState) => state.cart);
  const { cart, loading } = cartState;
  const [isClearCartConfirmOpen, setIsClearCartConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = (productId: string, currentQty: number, change: number, maxStock?: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) {
      dispatch(removeFromCart(productId));
      return;
    }
    if (maxStock !== undefined && newQty > maxStock) {
      alert(`Cannot increase quantity. Only ${maxStock} items available in stock.`);
      return;
    }
    dispatch(updateCartQuantity({ productId, quantity: newQty }));
  };

  const handleRemoveItem = (productId: string) => {
    if (window.confirm("Remove item from cart?")) {
      dispatch(removeFromCart(productId));
    }
  };

  const handleClearCart = () => {
    setIsClearCartConfirmOpen(true);
  };

  const items = cart?.items || [];
  const itemCounts = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  
  const totalOriginal = items.reduce((sum, item) => {
    const originalPrice = item.product?.price || item.priceSnapshot;
    return sum + originalPrice * item.quantity;
  }, 0);
  const totalSavings = totalOriginal - subtotal;

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={mainContentStyles}>
        <div style={containerStyles}>
          <h1 style={titleStyles}>Shopping Cart</h1>

          {loading && !cart ? (
            <div style={spinnerContainerStyles}>
              <div className="animate-spin" style={spinnerStyles}></div>
              <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Loading your cart...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div style={emptyCartStyles}>
              <ShoppingCart size={64} color="var(--text-muted)" />
              <h3 style={{ marginTop: "1.5rem", fontSize: "1.25rem", fontWeight: 700 }}>Your cart is empty</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", marginBottom: "2rem" }}>
                Browse our premium catalog to add unique products to your checkout.
              </p>
              <Link to="/catalog" className="btn-primary" style={{ width: "auto", padding: "0.75rem 2rem", borderRadius: "12px", textDecoration: "none" }}>
                Explore Products
              </Link>
            </div>
          ) : (
            <div style={cartLayoutStyles}>
              <div style={itemsListWrapperStyles}>
                <div style={itemsHeaderStyles}>
                  <span>Cart Items ({itemCounts})</span>
                  <button onClick={handleClearCart} style={clearCartBtnStyles}>
                    Clear Cart
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {items.map((item) => {
                    const product = item.product;
                    const name = product?.name || "Product Item";
                    const brand = product?.brand || "Merchant Brand";
                    const thumbnail = product?.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
                    const price = item.priceSnapshot;
                    const originalPrice = product?.price || price;
                    const stock = product?.stock || 0;

                    return (
                      <div key={item.productId} style={cartItemRowStyles}>
                        <img src={thumbnail} alt={name} style={thumbnailStyles} />
                        
                        <div style={itemDetailsStyles}>
                          <span style={brandStyles}>{brand}</span>
                          <h3 style={itemNameStyles}>{name}</h3>
                          <div style={priceWrapperStyles}>
                            <span style={priceStyles}>₹{price}</span>
                            {originalPrice > price && (
                              <span style={originalPriceStrikedStyles}>₹{originalPrice}</span>
                            )}
                          </div>
                        </div>

                        <div style={qtyControlsStyles}>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, -1)}
                            style={qtyBtnStyles}
                          >
                            <Minus size={14} />
                          </button>
                          <span style={qtyValueStyles}>{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity, 1, stock)}
                            style={qtyBtnStyles}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div style={rowActionsStyles}>
                          <span style={totalPriceStyles}>₹{(price * item.quantity).toFixed(2)}</span>
                          <button onClick={() => handleRemoveItem(item.productId)} style={deleteBtnStyles}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link to="/catalog" style={continueShoppingStyles}>
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
              </div>

              <div style={summaryCardStyles}>
                <h2 style={summaryTitleStyles}>Order Summary</h2>
                
                <div style={summaryRowStyles}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{totalOriginal.toFixed(2)}</span>
                </div>

                {totalSavings > 0 && (
                  <div style={summaryRowStyles}>
                    <span style={{ color: "#10b981" }}>Offer Savings</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>-₹{totalSavings.toFixed(2)}</span>
                  </div>
                )}

                <div style={summaryRowStyles}>
                  <span>Shipping</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>FREE</span>
                </div>

                <div style={{ ...summaryRowStyles, borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "1rem" }}>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>Total Due</span>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--primary)" }}>
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <button onClick={handleCheckout} className="btn-primary" style={checkoutBtnStyles}>
                  <CreditCard size={18} /> Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      {/* Clear Cart Confirmation Modal */}
      {isClearCartConfirmOpen && (
        <div className="modal-overlay animate-fadeIn">
          <div className="modal-container" style={{ maxWidth: "420px", width: "90%", padding: "2rem", borderRadius: "24px", textAlign: "center" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem auto",
              border: "2px solid #fee2e2"
            }}>
              <Trash2 size={30} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-main)", marginBottom: "0.5rem" }}>
              Clear Shopping Cart?
            </h3>

            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 2rem 0" }}>
              Are you sure you want to remove all items from your shopping cart? This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setIsClearCartConfirmOpen(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearCart());
                  setIsClearCartConfirmOpen(false);
                }}
                className="btn-primary"
                style={{ flex: 1, padding: "0.75rem", borderRadius: "12px", fontSize: "0.95rem", fontWeight: 700, backgroundColor: "#dc2626", border: "none", color: "white", marginTop: 0 }}
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

const mainContentStyles: React.CSSProperties = {
  flex: 1,
  backgroundColor: "#f8fafc",
  padding: "3rem 0",
};

const containerStyles: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 2rem",
};

const titleStyles: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: 800,
  marginBottom: "2rem",
  letterSpacing: "-0.02em",
};

const spinnerContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "300px",
};

const spinnerStyles: React.CSSProperties = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
};

const emptyCartStyles: React.CSSProperties = {
  background: "var(--surface)",
  padding: "4rem 2rem",
  borderRadius: "20px",
  border: "1px solid var(--border)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
};

const cartLayoutStyles: React.CSSProperties = {
  display: "flex",
  gap: "2.5rem",
  alignItems: "flex-start",
};

const itemsListWrapperStyles: React.CSSProperties = {
  flex: 1.6,
};

const itemsHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: "1rem",
  borderBottom: "1px solid var(--border)",
  marginBottom: "1.5rem",
  fontSize: "1.1rem",
  fontWeight: 700,
};

const clearCartBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#ef4444",
  fontWeight: 600,
  fontSize: "0.875rem",
  cursor: "pointer",
};

const cartItemRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
  background: "var(--surface)",
  padding: "1.25rem",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 6px rgba(0,0,0,0.01)",
};

const thumbnailStyles: React.CSSProperties = {
  width: "80px",
  height: "80px",
  borderRadius: "10px",
  objectFit: "cover",
  backgroundColor: "#e5e7eb",
};

const itemDetailsStyles: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const brandStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "var(--primary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const itemNameStyles: React.CSSProperties = {
  fontSize: "1rem",
  fontWeight: 700,
  margin: 0,
};

const priceWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "0.25rem",
};

const priceStyles: React.CSSProperties = {
  fontWeight: 700,
  color: "var(--text-main)",
};

const originalPriceStrikedStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  textDecoration: "line-through",
  color: "var(--text-muted)",
};

const qtyControlsStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "0.25rem",
  backgroundColor: "#f9fafb",
};

const qtyBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0.4rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text-muted)",
};

const qtyValueStyles: React.CSSProperties = {
  padding: "0 0.75rem",
  fontWeight: 700,
  minWidth: "24px",
  textAlign: "center",
};

const rowActionsStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

const totalPriceStyles: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1.1rem",
  minWidth: "75px",
  textAlign: "right",
};

const deleteBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  padding: "0.4rem",
  borderRadius: "6px",
  transition: "all 0.2s ease",
};

const continueShoppingStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  marginTop: "2rem",
  textDecoration: "none",
  fontWeight: 700,
  color: "var(--primary)",
  fontSize: "0.925rem",
};

const summaryCardStyles: React.CSSProperties = {
  flex: 0.9,
  background: "var(--surface)",
  borderRadius: "20px",
  padding: "2rem",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  position: "sticky",
  top: "100px",
};

const summaryTitleStyles: React.CSSProperties = {
  fontSize: "1.3rem",
  fontWeight: 800,
  marginBottom: "1.5rem",
  letterSpacing: "-0.01em",
};

const summaryRowStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.95rem",
  marginBottom: "0.85rem",
  color: "var(--text-muted)",
};

const checkoutBtnStyles: React.CSSProperties = {
  width: "100%",
  marginTop: "1.5rem",
  padding: "0.85rem",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5rem",
};
