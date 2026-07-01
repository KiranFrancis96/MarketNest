import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchShoppingFeed } from "@/features/product/model/productSlice";
import { ProductCard } from "@/shared/components/ProductCard";
import { Header } from "@/shared/components/Header";
import type { RootState, AppDispatch } from "@/app/store";
import { ArrowRight, Sparkles, Flame, Percent, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.user.user);
  const shoppingFeed = useSelector((state: RootState) => state.product.shoppingFeed);
  const loading = useSelector((state: RootState) => state.product.loading);

  useEffect(() => {
    dispatch(fetchShoppingFeed());
  }, [dispatch]);

  const userName = user?.email ? user.email.split("@")[0] : "Shopper";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <section style={heroSectionStyles}>
          <div style={heroContentStyles}>
            <span style={heroSubtitleStyles}>MarketNest Premium Experience</span>
            <h1 style={heroTitleStyles}>Discover Unique Creations Crafted Just For You</h1>
            <p style={heroDescriptionStyles}>
              Hello, <strong>{userName}</strong>! Explore thousands of bespoke items and support
              independent, passionate merchants. Live a tailored shopping experience designed statically for your interests.
            </p>
            <Link to="/catalog" className="btn-primary" style={heroBtnStyles}>
              Explore Catalog <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {loading && !shoppingFeed ? (
          <div style={spinnerContainerStyles}>
            <div className="animate-spin" style={spinnerStyles}></div>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>
              Tailoring your personalized recommendations...
            </p>
          </div>
        ) : (
          <div style={sectionsWrapperStyles}>
            {shoppingFeed?.recommendedForYou && shoppingFeed.recommendedForYou.length > 0 && (
              <section style={sectionStyles}>
                <div style={sectionHeaderStyles}>
                  <div style={sectionTitleWrapperStyles}>
                    <Sparkles size={22} color="var(--primary)" />
                    <h2 style={sectionTitleStyles}>Recommended For You</h2>
                  </div>
                  <Link to="/catalog" style={viewAllLinkStyles}>View All</Link>
                </div>
                <div className="product-grid">
                  {shoppingFeed.recommendedForYou.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {shoppingFeed?.dealsYouMayLike && shoppingFeed.dealsYouMayLike.length > 0 && (
              <section style={sectionStyles}>
                <div style={sectionHeaderStyles}>
                  <div style={sectionTitleWrapperStyles}>
                    <Percent size={22} color="#ef4444" />
                    <h2 style={sectionTitleStyles}>Deals You May Like</h2>
                  </div>
                  <Link to="/catalog?sort=lowToHigh" style={viewAllLinkStyles}>View More Deals</Link>
                </div>
                <div className="product-grid">
                  {shoppingFeed.dealsYouMayLike.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {shoppingFeed?.trendingProducts && shoppingFeed.trendingProducts.length > 0 && (
              <section style={sectionStyles}>
                <div style={sectionHeaderStyles}>
                  <div style={sectionTitleWrapperStyles}>
                    <Flame size={22} color="#f59e0b" />
                    <h2 style={sectionTitleStyles}>Trending Products</h2>
                  </div>
                  <Link to="/catalog?sort=popular" style={viewAllLinkStyles}>View Trending</Link>
                </div>
                <div className="product-grid">
                  {shoppingFeed.trendingProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {shoppingFeed?.basedOnShoppingStyle && shoppingFeed.basedOnShoppingStyle.length > 0 && (
              <section style={{ ...sectionStyles, borderBottom: "none" }}>
                <div style={sectionHeaderStyles}>
                  <div style={sectionTitleWrapperStyles}>
                    <HeartHandshake size={22} color="#10b981" />
                    <h2 style={sectionTitleStyles}>Based On Your Shopping Style</h2>
                  </div>
                  <Link to="/catalog" style={viewAllLinkStyles}>Explore Style</Link>
                </div>
                <div className="product-grid">
                  {shoppingFeed.basedOnShoppingStyle.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const heroSectionStyles: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
  padding: "5rem 2rem",
  color: "white",
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const heroContentStyles: React.CSSProperties = {
  maxWidth: "800px",
  margin: "0 auto",
};

const heroSubtitleStyles: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 700,
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  color: "#a5b4fc",
  display: "block",
  marginBottom: "1rem",
};

const heroTitleStyles: React.CSSProperties = {
  fontSize: "3rem",
  fontWeight: 800,
  lineHeight: "1.2",
  marginBottom: "1.5rem",
  letterSpacing: "-0.02em",
};

const heroDescriptionStyles: React.CSSProperties = {
  fontSize: "1.15rem",
  color: "#e0e7ff",
  lineHeight: "1.6",
  marginBottom: "2.5rem",
};

const heroBtnStyles: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "white",
  color: "var(--primary)",
  padding: "0.85rem 2rem",
  borderRadius: "14px",
  textDecoration: "none",
  fontWeight: 700,
  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  transition: "all 0.2s ease",
  marginTop: 0,
  width: "auto",
};

const spinnerContainerStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
};

const spinnerStyles: React.CSSProperties = {
  width: "40px",
  height: "40px",
  border: "4px solid #e2e8f0",
  borderTopColor: "var(--primary)",
  borderRadius: "50%",
};

const sectionsWrapperStyles: React.CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "3rem 2rem",
  display: "flex",
  flexDirection: "column",
  gap: "4rem",
};

const sectionStyles: React.CSSProperties = {
  paddingBottom: "3rem",
  borderBottom: "1px solid var(--border)",
};

const sectionHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
};

const sectionTitleWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 800,
  color: "var(--text-main)",
  letterSpacing: "-0.01em",
  margin: 0,
};

const viewAllLinkStyles: React.CSSProperties = {
  fontSize: "0.925rem",
  fontWeight: 700,
  color: "var(--primary)",
  textDecoration: "none",
};