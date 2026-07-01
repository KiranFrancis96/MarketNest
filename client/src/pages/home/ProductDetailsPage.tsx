import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Heart, ShoppingBag, Star, RefreshCw, AlertTriangle } from "lucide-react";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchProductById, clearCurrentProduct } from "@/features/product/model/productSlice";
import { addToCart, updateCartQuantity } from "@/features/cart/model/cartSlice";
import { addToWishlist, removeFromWishlist } from "@/features/wishlist/model/wishlistSlice";
import { Header } from "@/shared/components/Header";

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const product = useSelector((state: RootState) => state.product.currentProduct);
  const loading = useSelector((state: RootState) => state.product.loading);
  const error = useSelector((state: RootState) => state.product.error);

  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const cartItems = useSelector((state: RootState) => state.cart.cart?.items || []);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [localQty, setLocalQty] = useState(1);

  const isWishlisted = wishlistItems.some((item) => item.productId === id);
  const cartItem = cartItems.find((item) => item.productId === id);
  const isInCart = !!cartItem;
  const currentCartQty = cartItem?.quantity || 0;

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setLocalQty(1);
  }, [product]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div className="details-loading-wrapper">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-gray-500 mt-4 font-medium">Fetching product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <div className="details-page-wrapper details-error-wrapper">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load product</h2>
          <p className="text-gray-500 mb-6">{error || "Product not found or has been removed."}</p>
          <Link to="/catalog" className="back-link" style={{ justifyContent: "center" }}>
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  let discountPercent = 0;
  if (product.offerPrice && product.offerPrice < product.price) {
    discountPercent = Math.round(((product.price - product.offerPrice) / product.price) * 100);
  }

  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await dispatch(removeFromWishlist(product._id)).unwrap();
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
      }
    } catch (err: unknown) {
      alert(typeof err === "string" ? err : (err instanceof Error ? err.message : "Failed to update wishlist"));
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    setAddingToCart(true);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: localQty })).unwrap();
    } catch (err: unknown) {
      alert(typeof err === "string" ? err : (err instanceof Error ? err.message : "Failed to add product to cart"));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleUpdateCartQuantity = async (newQty: number) => {
    if (newQty < 1) {
      try {
        await dispatch(updateCartQuantity({ productId: product._id, quantity: 0 })).unwrap();
      } catch (err: unknown) {
        alert(typeof err === "string" ? err : (err instanceof Error ? err.message : "Failed to remove item from cart"));
      }
      return;
    }

    if (newQty > product.stock) {
      alert(`Cannot add more. Only ${product.stock} items left in stock.`);
      return;
    }

    try {
      await dispatch(updateCartQuantity({ productId: product._id, quantity: newQty })).unwrap();
    } catch (err: unknown) {
      alert(typeof err === "string" ? err : (err instanceof Error ? err.message : "Failed to update cart quantity"));
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"];

  const mainImageUrl = images[selectedImageIndex] || images[0];

  const getStockStatus = () => {
    if (product.stock <= 0) return { label: "Out of Stock", class: "outofstock" };
    if (product.stock <= 5) return { label: `Only ${product.stock} Left`, class: "lowstock" };
    return { label: "In Stock", class: "instock" };
  };
  const stockStatus = getStockStatus();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main className="details-page-wrapper">
        <Link to="/catalog" className="back-link">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>

        <div className="product-details-grid">
          <div className="details-gallery">
            <div className="main-image-container">
              {discountPercent > 0 && (
                <span style={{
                  position: "absolute",
                  top: "1rem",
                  left: "1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  padding: "0.3rem 0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  zIndex: 5
                }}>
                  {discountPercent}% OFF
                </span>
              )}
              <img src={mainImageUrl} alt={product.name} />
            </div>

            {images.length > 1 && (
              <div className="thumbnails-list">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`thumbnail-btn ${index === selectedImageIndex ? "active" : ""}`}
                  >
                    <img src={imgUrl} alt={`${product.name} - thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="details-info">
            <span className="details-brand">{product.brand}</span>
            <h1 className="details-name">{product.name}</h1>

            <div className="details-meta-row">
              <div className="details-rating">
                <Star size={16} fill="#fbbf24" stroke="none" />
                <span>4.5</span>
                <span className="details-rating-count">(120 reviews)</span>
              </div>
              <span className={`details-stock-badge ${stockStatus.class}`}>
                {stockStatus.label}
              </span>
            </div>

            <div className="details-price-row">
              {product.offerPrice ? (
                <>
                  <span className="details-price-offer">₹{product.offerPrice}</span>
                  <span className="details-price-original">₹{product.price}</span>
                  <span className="details-discount-badge">Save ₹{product.price - product.offerPrice} ({discountPercent}%)</span>
                </>
              ) : (
                <span className="details-price-offer" style={{ color: "var(--text-main)" }}>
                  ₹{product.price}
                </span>
              )}
            </div>

            <h3 className="details-desc-title">Product Description</h3>
            <p className="details-desc">{product.description}</p>

            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="details-desc-title" style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Keywords</h3>
                <div className="details-tags-list">
                  {product.tags.map((tag) => (
                    <span key={tag} className="details-tag-pill">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="details-actions-panel">
              {product.stock > 0 && (
                <>
                  {isInCart ? (
                    <div style={{ display: "flex", gap: "1rem", flexGrow: 1, alignItems: "center" }}>
                      <div className="quantity-control">
                        <button
                          onClick={() => handleUpdateCartQuantity(currentCartQty - 1)}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="qty-val">{currentCartQty}</span>
                        <button
                          onClick={() => handleUpdateCartQuantity(currentCartQty + 1)}
                          className="qty-btn"
                          aria-label="Increase quantity"
                          disabled={currentCartQty >= product.stock}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => navigate("/cart")}
                        className="btn-primary details-btn-cart"
                        style={{
                          backgroundColor: "#10b981",
                        }}
                      >
                        <ShoppingBag size={18} />
                        Go to Cart
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "1rem", flexGrow: 1, alignItems: "center" }}>
                      <div className="quantity-control">
                        <button
                          onClick={() => setLocalQty((prev) => Math.max(1, prev - 1))}
                          className="qty-btn"
                          disabled={localQty <= 1}
                        >
                          -
                        </button>
                        <span className="qty-val">{localQty}</span>
                        <button
                          onClick={() => setLocalQty((prev) => Math.min(product.stock, prev + 1))}
                          className="qty-btn"
                          disabled={localQty >= product.stock}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="btn-primary details-btn-cart"
                      >
                        <ShoppingBag size={18} />
                        {addingToCart ? "Adding..." : "Add to Cart"}
                      </button>
                    </div>
                  )}
                </>
              )}

              {product.stock <= 0 && (
                <button className="btn-primary details-btn-cart" disabled style={{ flexGrow: 1 }}>
                  Sold Out
                </button>
              )}

              <button
                onClick={handleWishlistToggle}
                className={`details-btn-wishlist ${isWishlisted ? "active" : ""}`}
                disabled={wishlistLoading}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={20} fill={isWishlisted ? "#ef4444" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
