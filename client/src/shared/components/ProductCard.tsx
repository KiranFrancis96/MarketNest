import React from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import type { Product } from "@/features/product/model/productSlice";
import { addToCart } from "@/features/cart/model/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/features/wishlist/model/wishlistSlice";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const cartItems = useSelector((state: RootState) => state.cart.cart?.items || []);

  const isWishlisted = wishlistItems.some((item) => item.productId === product._id);
  const cartItem = cartItems.find((item) => item.productId === product._id);
  const quantityInCart = cartItem?.quantity || 0;

  // Calculate discount percentage
  let discountPercent = 0;
  if (product.offerPrice && product.offerPrice < product.price) {
    discountPercent = Math.round(((product.price - product.offerPrice) / product.price) * 100);
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isWishlisted) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist(product._id));
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.stock <= quantityInCart) {
      alert(`Cannot add more. Stock limit of ${product.stock} items reached.`);
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  // Cloudinary fallback image
  const displayImage = product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60";

  return (
    <div className="product-card">
      <div className="product-image" style={imageContainerStyles}>
        {discountPercent > 0 && (
          <span style={discountBadgeStyles}>{discountPercent}% OFF</span>
        )}
        <button
          onClick={handleWishlistToggle}
          style={{
            ...wishlistButtonStyles,
            color: isWishlisted ? "#ef4444" : "var(--text-muted)",
            backgroundColor: isWishlisted ? "#fef2f2" : "rgba(255, 255, 255, 0.9)",
          }}
        >
          <Heart size={18} fill={isWishlisted ? "#ef4444" : "none"} />
        </button>
        <img src={displayImage} alt={product.name} />
      </div>

      <div className="product-info">
        <span style={brandStyles}>{product.brand}</span>
        <h3 className="product-title" style={titleStyles}>{product.name}</h3>
        <p style={descStyles}>{product.description}</p>
        
        <div style={priceStockContainerStyles}>
          <div style={pricesWrapperStyles}>
            {product.offerPrice ? (
              <>
                <span style={offerPriceStyles}>₹{product.offerPrice}</span>
                <span style={originalPriceStrikedStyles}>₹{product.price}</span>
              </>
            ) : (
              <span style={regularPriceStyles}>₹{product.price}</span>
            )}
          </div>
          <span style={{
            ...stockStyles,
            color: product.stock > 0 ? (product.stock <= 5 ? "#d97706" : "#10b981") : "#ef4444"
          }}>
            {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left` : "In Stock") : "Out of Stock"}
          </span>
        </div>

        <button
          className="btn-primary"
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          style={{
            ...btnStyles,
            backgroundColor: product.stock <= 0 ? "#cbd5e1" : "var(--primary)"
          }}
        >
          <ShoppingBag size={16} />
          {product.stock <= 0 ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
};

// Elegant Inline styles for custom properties
const imageContainerStyles: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
};

const discountBadgeStyles: React.CSSProperties = {
  position: "absolute",
  top: "0.75rem",
  left: "0.75rem",
  backgroundColor: "#ef4444",
  color: "white",
  padding: "0.25rem 0.6rem",
  borderRadius: "8px",
  fontSize: "0.75rem",
  fontWeight: 700,
  zIndex: 10,
};

const wishlistButtonStyles: React.CSSProperties = {
  position: "absolute",
  top: "0.75rem",
  right: "0.75rem",
  border: "none",
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  transition: "all 0.2s ease",
  zIndex: 10,
};

const brandStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  color: "var(--primary)",
  letterSpacing: "0.05em",
  marginBottom: "0.25rem",
};

const titleStyles: React.CSSProperties = {
  fontSize: "1rem",
  marginBottom: "0.5rem",
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const descStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--text-muted)",
  marginBottom: "1rem",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  lineHeight: "1.4",
};

const priceStockContainerStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "auto",
  marginBottom: "1rem",
};

const pricesWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "baseline",
  gap: "0.5rem",
};

const offerPriceStyles: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "#ef4444",
};

const originalPriceStrikedStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  textDecoration: "line-through",
  color: "var(--text-muted)",
};

const regularPriceStyles: React.CSSProperties = {
  fontSize: "1.2rem",
  fontWeight: 700,
  color: "var(--text-main)",
};

const stockStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 600,
};

const btnStyles: React.CSSProperties = {
  marginTop: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem",
  borderRadius: "12px",
};
