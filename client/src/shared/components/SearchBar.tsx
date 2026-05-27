import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search for products...",
  initialValue = "",
}) => {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} style={searchBarContainerStyles}>
      <div style={inputWrapperStyles}>
        <Search size={18} style={searchIconStyles} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={inputStyles}
        />
      </div>
      <button type="submit" className="btn-primary" style={buttonStyles}>
        Search
      </button>
    </form>
  );
};

// Sleek Inline Styles for Modern Glassmorphic Look
const searchBarContainerStyles: React.CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto 1.5rem",
};

const inputWrapperStyles: React.CSSProperties = {
  position: "relative",
  flex: 1,
  display: "flex",
  alignItems: "center",
};

const searchIconStyles: React.CSSProperties = {
  position: "absolute",
  left: "1rem",
  color: "var(--text-muted)",
  pointerEvents: "none",
};

const inputStyles: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem 0.75rem 2.5rem",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "0.95rem",
  backgroundColor: "var(--surface)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
  outline: "none",
  transition: "all 0.2s ease",
};

const buttonStyles: React.CSSProperties = {
  marginTop: 0,
  width: "auto",
  padding: "0.75rem 1.5rem",
  borderRadius: "12px",
  whiteSpace: "nowrap",
};
