import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "@/features/wishlist/model/wishlistSlice";
import { ProductCard } from "@/shared/components/ProductCard";
import { Header } from "@/shared/components/Header";
import type { RootState, AppDispatch } from "@/app/store";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const WishlistPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Clean items list by filtering only valid populated products
  const validProducts = items
    .map((item) => item.product)
    .filter((prod): prod is NonNullable<typeof prod> => !!prod);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={mainContentStyles}>
        <div style={containerStyles}>
          <h1 style={titleStyles}>My Wishlist</h1>

          {loading && items.length === 0 ? (
            <div style={spinnerContainerStyles}>
              <div className="animate-spin" style={spinnerStyles}></div>
              <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Loading bookmarks...
              </p>
            </div>
          ) : validProducts.length === 0 ? (
            <div style={emptyWishlistStyles}>
              <Heart size={64} color="var(--text-muted)" />
              <h3 style={{ marginTop: "1.5rem", fontSize: "1.25rem", fontWeight: 700 }}>Your wishlist is empty</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem", marginBottom: "2rem" }}>
                Add items to your wishlist while shopping to keep track of creations you love!
              </p>
              <Link to="/catalog" className="btn-primary" style={{ width: "auto", padding: "0.75rem 2rem", borderRadius: "12px", textDecoration: "none" }}>
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="product-grid" style={{ minHeight: "450px" }}>
              {validProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Premium visual wishlist dashboard layout styles
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
  marginBottom: "2.5rem",
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

const emptyWishlistStyles: React.CSSProperties = {
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
