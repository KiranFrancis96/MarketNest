import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCatalog } from "@/features/product/model/productSlice";
import { ProductCard } from "@/shared/components/ProductCard";
import { FilterSidebar } from "@/shared/components/FilterSidebar";
import { SearchBar } from "@/shared/components/SearchBar";
import { Header } from "@/shared/components/Header";
import type { RootState, AppDispatch } from "@/app/store";
import { SlidersHorizontal, ArrowLeft, ArrowRight, Layers } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export const ProductCatalogPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected filters in local / search state
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const brand = searchParams.get("brand") || "";
  const minPrice = Number(searchParams.get("min")) || 0;
  const maxPrice = Number(searchParams.get("max")) || 10000;
  const sort = searchParams.get("sort") || "new";
  const page = Number(searchParams.get("page")) || 1;

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const catalogFeed = useSelector((state: RootState) => state.product.catalogFeed);
  const loading = useSelector((state: RootState) => state.product.loading);

  useEffect(() => {
    // Dispatch catalog fetch with all current filters
    dispatch(
      fetchCatalog({
        q: q || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        brand: brand || undefined,
        min: minPrice || undefined,
        max: maxPrice || undefined,
        sort: sort || undefined,
        page,
        limit: 8,
      })
    );
  }, [dispatch, q, category, subcategory, brand, minPrice, maxPrice, sort, page]);

  const handleSearch = (query: string) => {
    setSearchParams((prev) => {
      if (query) prev.set("q", query);
      else prev.delete("q");
      prev.set("page", "1");
      return prev;
    });
  };

  const handleFilterChange = (newFilters: any) => {
    setSearchParams((prev) => {
      if (newFilters.category) prev.set("category", newFilters.category);
      else prev.delete("category");

      if (newFilters.subcategory) prev.set("subcategory", newFilters.subcategory);
      else prev.delete("subcategory");

      if (newFilters.brand) prev.set("brand", newFilters.brand);
      else prev.delete("brand");

      if (newFilters.minPrice) prev.set("min", newFilters.minPrice.toString());
      else prev.delete("min");

      if (newFilters.maxPrice) prev.set("max", newFilters.maxPrice.toString());
      else prev.delete("max");

      if (newFilters.sort) prev.set("sort", newFilters.sort);
      else prev.delete("sort");

      prev.set("page", "1");
      return prev;
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (catalogFeed && newPage > catalogFeed.pages)) return;
    setSearchParams((prev) => {
      prev.set("page", newPage.toString());
      return prev;
    });
  };

  const activeFiltersCount = [category, subcategory, brand, minPrice > 0 ? "min" : "", maxPrice < 10000 ? "max" : ""].filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={mainContentStyles}>
        <div style={containerStyles}>
          {/* Header Controls */}
          <div style={catalogHeaderStyles}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>Browse Shop Catalog</h1>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Discover {catalogFeed?.total || 0} unique items listed by trusted merchants
              </p>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterOpen(true)}
              style={{
                ...filterToggleBtnStyles,
                borderColor: activeFiltersCount > 0 ? "var(--primary)" : "var(--border)",
                backgroundColor: activeFiltersCount > 0 ? "rgba(79, 70, 229, 0.05)" : "var(--surface)",
              }}
            >
              <SlidersHorizontal size={18} color={activeFiltersCount > 0 ? "var(--primary)" : "var(--text-main)"} />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>
          </div>

          {/* Search bar section */}
          <SearchBar onSearch={handleSearch} initialValue={q} placeholder="Search product titles, brands, categories..." />

          {/* Active Filter Tags */}
          {activeFiltersCount > 0 && (
            <div style={filterTagsWrapperStyles}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>Active Filters:</span>
              {category && <span style={tagStyles}>{category}</span>}
              {subcategory && <span style={tagStyles}>{subcategory}</span>}
              {brand && <span style={tagStyles}>{brand}</span>}
              {minPrice > 0 && <span style={tagStyles}>&gt; ₹{minPrice}</span>}
              {maxPrice < 10000 && <span style={tagStyles}>&lt; ₹{maxPrice}</span>}
              <button
                onClick={() => handleFilterChange({ category: "", subcategory: "", brand: "", minPrice: 0, maxPrice: 10000, sort: "new" })}
                style={clearFiltersBtnStyles}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Catalog grid */}
          {loading ? (
            <div style={spinnerContainerStyles}>
              <div className="animate-spin" style={spinnerStyles}></div>
              <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Refreshing listings...
              </p>
            </div>
          ) : !catalogFeed || catalogFeed.products.length === 0 ? (
            <div style={noProductsStyles}>
              <Layers size={48} color="var(--text-muted)" />
              <h3 style={{ marginTop: "1rem", fontSize: "1.25rem", fontWeight: 700 }}>No products found</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
                Try relaxing your search terms or expanding your filter ranges.
              </p>
            </div>
          ) : (
            <>
              <div className="product-grid" style={{ minHeight: "450px" }}>
                {catalogFeed.products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {catalogFeed.pages > 1 && (
                <div style={paginationWrapperStyles}>
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    style={pageBtnStyles}
                  >
                    <ArrowLeft size={16} /> Previous
                  </button>
                  <span style={pageIndicatorStyles}>
                    Page <strong>{page}</strong> of {catalogFeed.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === catalogFeed.pages}
                    style={pageBtnStyles}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={{ category, subcategory, brand, minPrice, maxPrice, sort }}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

// Premium Styles for Search and Filter Sidebar
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

const catalogHeaderStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "2rem",
};

const filterToggleBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const filterTagsWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "0.5rem",
  marginBottom: "2rem",
};

const tagStyles: React.CSSProperties = {
  padding: "0.25rem 0.6rem",
  backgroundColor: "#f1f5f9",
  borderRadius: "6px",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-muted)",
};

const clearFiltersBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "0.825rem",
  fontWeight: 700,
  color: "var(--primary)",
  cursor: "pointer",
  marginLeft: "0.5rem",
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

const noProductsStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "400px",
  textAlign: "center",
};

const paginationWrapperStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: "1.5rem",
  marginTop: "4rem",
};

const pageBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--surface)",
  cursor: "pointer",
  fontWeight: 600,
  transition: "all 0.2s ease",
};

const pageIndicatorStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  color: "var(--text-muted)",
};
