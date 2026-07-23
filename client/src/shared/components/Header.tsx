import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart, Heart, Store, LogOut, Wallet } from "lucide-react";
import type { RootState, AppDispatch } from "@/app/store";
import { logout } from "@/entities/user/model/userSlice";
import { userApi } from "@/entities/user/api/userApi";
import { fetchCart } from "@/features/cart/model/cartSlice";
import { fetchWishlist } from "@/features/wishlist/model/wishlistSlice";
import { NotificationBell } from "@/features/notification/ui/NotificationBell";
import { WalletHistoryModal } from "@/features/wallet";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const cart = useSelector((state: RootState) => state.cart.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = wishlistItems?.length || 0;

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (e) {
      console.error(e);
    }
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header style={headerStyles}>
      <div style={headerContainerStyles}>
        <Link to="/" style={logoStyles}>
          <Store size={26} color="var(--primary)" />
          <span>MarketNest</span>
        </Link>

        <nav style={navStyles}>
          <Link
            to="/"
            style={{
              ...navLinkStyles,
              color: location.pathname === "/" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: location.pathname === "/" ? 700 : 500,
            }}
          >
            Home
          </Link>
          <Link
            to="/catalog"
            style={{
              ...navLinkStyles,
              color: location.pathname === "/catalog" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: location.pathname === "/catalog" ? 700 : 500,
            }}
          >
            Shop Catalog
          </Link>
          <Link
            to="/purchases"
            style={{
              ...navLinkStyles,
              color: location.pathname === "/purchases" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: location.pathname === "/purchases" ? 700 : 500,
            }}
          >
            My Purchases
          </Link>
          <Link
            to="/profile"
            style={{
              ...navLinkStyles,
              color: location.pathname === "/profile" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: location.pathname === "/profile" ? 700 : 500,
            }}
          >
            My Profile
          </Link>
        </nav>

        <div style={actionsContainerStyles}>
          <Link to="/wishlist" style={iconBtnWrapperStyles} title="Wishlist">
            <Heart size={20} color="var(--text-main)" />
            {wishlistCount > 0 && (
              <span style={badgeStyles}>{wishlistCount}</span>
            )}
          </Link>

          <Link to="/cart" style={iconBtnWrapperStyles} title="Cart">
            <ShoppingCart size={20} color="var(--text-main)" />
            {cartCount > 0 && (
              <span style={{ ...badgeStyles, backgroundColor: "var(--primary)" }}>{cartCount}</span>
            )}
          </Link>

          {user && (
            <button
              onClick={() => setIsWalletModalOpen(true)}
              style={{ ...iconBtnWrapperStyles, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              title="Wallet History"
            >
              <Wallet size={20} color="var(--primary)" />
            </button>
          )}

          <NotificationBell />

          <span style={emailStyles}>{user?.email?.split("@")[0]}</span>

          <button onClick={handleLogout} style={logoutBtnStyles} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <WalletHistoryModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </header>
  );
};

const headerStyles: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid var(--border)",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
};

const headerContainerStyles: React.CSSProperties = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "1rem 2rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const logoStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
  textDecoration: "none",
  fontSize: "1.45rem",
  fontWeight: 800,
  color: "var(--text-main)",
  letterSpacing: "-0.02em",
};

const navStyles: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
};

const navLinkStyles: React.CSSProperties = {
  textDecoration: "none",
  fontSize: "0.95rem",
  transition: "color 0.2s ease",
};

const actionsContainerStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

const iconBtnWrapperStyles: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "0.4rem",
  borderRadius: "50%",
  transition: "background-color 0.2s ease",
};

const badgeStyles: React.CSSProperties = {
  position: "absolute",
  top: "-4px",
  right: "-6px",
  backgroundColor: "#ef4444",
  color: "white",
  fontSize: "0.7rem",
  fontWeight: 700,
  borderRadius: "9999px",
  minWidth: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 0.25rem",
};

const emailStyles: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "var(--text-muted)",
};

const logoutBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.4rem",
  borderRadius: "50%",
  transition: "all 0.2s ease",
};
