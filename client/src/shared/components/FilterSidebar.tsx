import React, { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import { fetchCategories } from "@/features/product/model/productSlice";

interface FilterState {
  category: string;
  subcategory: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  sort: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const categoriesList = useSelector((state: RootState) => state.product.categories);

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCategorySelect = (categoryName: string) => {
    const isSelected = localFilters.category === categoryName;
    const newFilters = {
      ...localFilters,
      category: isSelected ? "" : categoryName,
      subcategory: "", // reset subcategory on category change
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSubcategorySelect = (subName: string) => {
    const isSelected = localFilters.subcategory === subName;
    const newFilters = {
      ...localFilters,
      subcategory: isSelected ? "" : subName,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTextChange = (field: keyof FilterState, value: string | number) => {
    const newFilters = {
      ...localFilters,
      [field]: value,
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters = {
      category: "",
      subcategory: "",
      brand: "",
      minPrice: 0,
      maxPrice: 10000,
      sort: "new",
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Get active subcategories list based on selected category
  const activeCategory = categoriesList.find((c) => c.name === localFilters.category);
  const subcategoriesToDisplay = activeCategory ? activeCategory.subcategories : [];

  // Extract unique brands for filtering (Hardcoded common brands as fallback or options)
  const brandsList = ["Nike", "Adidas", "Apple", "Samsung", "Sony", "Dell", "Bose", "Puma"];

  if (!isOpen) return null;

  return (
    <div style={overlayStyles}>
      <div style={sidebarContainerStyles}>
        <div style={headerStyles}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Filters</h2>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={handleReset} style={resetBtnStyles} title="Reset Filters">
              <RefreshCw size={16} />
            </button>
            <button onClick={onClose} style={closeBtnStyles}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={scrollContainerStyles}>
          {/* Sorting */}
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>Sort By</h3>
            <select
              value={localFilters.sort}
              onChange={(e) => handleTextChange("sort", e.target.value)}
              style={selectStyles}
            >
              <option value="new">Newest Arrivals</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
              <option value="popular">Popularity / Stock</option>
            </select>
          </div>

          {/* Categories */}
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>Categories</h3>
            <div style={listStyles}>
              {categoriesList.map((cat) => (
                <label key={cat._id} style={itemLabelStyles}>
                  <input
                    type="checkbox"
                    checked={localFilters.category === cat.name}
                    onChange={() => handleCategorySelect(cat.name)}
                    style={checkboxStyles}
                  />
                  <span>{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Subcategories (Visible only when category is selected) */}
          {localFilters.category && subcategoriesToDisplay.length > 0 && (
            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>Subcategories</h3>
              <div style={listStyles}>
                {subcategoriesToDisplay.map((sub) => (
                  <label key={sub} style={itemLabelStyles}>
                    <input
                      type="checkbox"
                      checked={localFilters.subcategory === sub}
                      onChange={() => handleSubcategorySelect(sub)}
                      style={checkboxStyles}
                    />
                    <span>{sub}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Brands */}
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>Popular Brands</h3>
            <div style={listStyles}>
              {brandsList.map((brand) => (
                <label key={brand} style={itemLabelStyles}>
                  <input
                    type="checkbox"
                    checked={localFilters.brand === brand}
                    onChange={() => handleTextChange("brand", localFilters.brand === brand ? "" : brand)}
                    style={checkboxStyles}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div style={sectionStyles}>
            <h3 style={sectionTitleStyles}>Price Range</h3>
            <div style={priceInputsWrapperStyles}>
              <div>
                <span style={inputLabelStyles}>Min (₹)</span>
                <input
                  type="number"
                  value={localFilters.minPrice}
                  onChange={(e) => handleTextChange("minPrice", Number(e.target.value))}
                  style={priceInputStyles}
                />
              </div>
              <div>
                <span style={inputLabelStyles}>Max (₹)</span>
                <input
                  type="number"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleTextChange("maxPrice", Number(e.target.value))}
                  style={priceInputStyles}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={footerStyles}>
          <button onClick={onClose} className="btn-primary" style={{ marginTop: 0, width: "100%", borderRadius: "12px" }}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Glassmorphic side panel styling
const overlayStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(6px)",
  zIndex: 100,
  display: "flex",
  justifyContent: "flex-end",
};

const sidebarContainerStyles: React.CSSProperties = {
  width: "350px",
  height: "100%",
  backgroundColor: "var(--surface)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
  animation: "slideInLeft 0.3s ease-out forwards",
};

const headerStyles: React.CSSProperties = {
  padding: "1.5rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const resetBtnStyles: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  padding: "0.5rem",
  borderRadius: "8px",
  cursor: "pointer",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const closeBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--text-muted)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const scrollContainerStyles: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "1.5rem",
};

const sectionStyles: React.CSSProperties = {
  marginBottom: "1.75rem",
  paddingBottom: "1.5rem",
  borderBottom: "1px solid var(--border)",
};

const sectionTitleStyles: React.CSSProperties = {
  fontSize: "0.95rem",
  fontWeight: 700,
  marginBottom: "0.75rem",
  color: "var(--text-main)",
};

const selectStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  backgroundColor: "var(--background)",
  outline: "none",
  fontWeight: 500,
};

const listStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.6rem",
};

const itemLabelStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontSize: "0.9rem",
  fontWeight: 500,
  cursor: "pointer",
  color: "var(--text-main)",
};

const checkboxStyles: React.CSSProperties = {
  width: "16px",
  height: "16px",
  borderRadius: "4px",
  accentColor: "var(--primary)",
  cursor: "pointer",
};

const priceInputsWrapperStyles: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
};

const inputLabelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted)",
  display: "block",
  marginBottom: "0.25rem",
  fontWeight: 600,
};

const priceInputStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  fontSize: "0.9rem",
  outline: "none",
};

const footerStyles: React.CSSProperties = {
  padding: "1.5rem",
  borderTop: "1px solid var(--border)",
};
