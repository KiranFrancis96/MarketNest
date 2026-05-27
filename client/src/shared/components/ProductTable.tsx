import React from "react";
import { Edit2, Trash2, ShieldAlert, ShieldCheck } from "lucide-react";
import type { Product } from "@/features/product/model/productSlice";

interface ProductTableProps {
  products: Product[];
  mode: "merchant" | "admin";
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  onToggleBlock?: (id: string, isBlocked: boolean) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  mode,
  onEdit,
  onDelete,
  onToggleBlock,
}) => {
  return (
    <div style={tableWrapperStyles}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={headerRowStyles}>
            <th style={thStyles}>Product</th>
            <th style={thStyles}>Category</th>
            <th style={thStyles}>Brand</th>
            <th style={thStyles}>Price</th>
            <th style={thStyles}>Stock</th>
            {mode === "admin" && <th style={thStyles}>Status</th>}
            <th style={{ ...thStyles, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={mode === "admin" ? 7 : 6} style={emptyCellStyles}>
                No products found. Start by listing a product!
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const image = product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100";
              const hasDiscount = product.offerPrice && product.offerPrice < product.price;

              return (
                <tr key={product._id} style={rowStyles}>
                  <td style={tdStyles}>
                    <div style={productInfoWrapperStyles}>
                      <img src={image} alt={product.name} style={thumbnailStyles} />
                      <div>
                        <div style={nameStyles}>{product.name}</div>
                        <div style={descStyles}>{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyles}>
                    <span style={badgeStyles}>{product.category}</span>
                    <span style={subBadgeStyles}>{product.subcategory}</span>
                  </td>
                  <td style={tdStyles}>
                    <span style={{ fontWeight: 600 }}>{product.brand}</span>
                  </td>
                  <td style={tdStyles}>
                    {hasDiscount ? (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={offerPriceStyles}>₹{product.offerPrice}</span>
                        <span style={originalPriceStyles}>₹{product.price}</span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: 600 }}>₹{product.price}</span>
                    )}
                  </td>
                  <td style={tdStyles}>
                    <span
                      style={{
                        ...stockBadgeStyles,
                        backgroundColor: product.stock > 0 ? (product.stock <= 5 ? "#fffbeb" : "#f0fdf4") : "#fef2f2",
                        color: product.stock > 0 ? (product.stock <= 5 ? "#d97706" : "#166534") : "#991b1b",
                      }}
                    >
                      {product.stock} items
                    </span>
                  </td>
                  {mode === "admin" && (
                    <td style={tdStyles}>
                      <span
                        style={{
                          ...statusBadgeStyles,
                          backgroundColor: product.isBlocked ? "#fef2f2" : "#f0fdf4",
                          color: product.isBlocked ? "#b91c1c" : "#166534",
                        }}
                      >
                        {product.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                  )}
                  <td style={{ ...tdStyles, textAlign: "right" }}>
                    <div style={actionsWrapperStyles}>
                      {mode === "merchant" && (
                        <>
                          <button
                            onClick={() => onEdit?.(product)}
                            style={actionBtnStyles}
                            title="Edit Product"
                          >
                            <Edit2 size={16} color="var(--primary)" />
                          </button>
                          <button
                            onClick={() => onDelete?.(product._id)}
                            style={{ ...actionBtnStyles, borderColor: "#fecaca" }}
                            title="Delete Product"
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </>
                      )}
                      {mode === "admin" && (
                        <button
                          onClick={() => onToggleBlock?.(product._id, !product.isBlocked)}
                          style={{
                            ...actionBtnStyles,
                            borderColor: product.isBlocked ? "#bbf7d0" : "#fecaca",
                            backgroundColor: product.isBlocked ? "#f0fdf4" : "#fef2f2",
                          }}
                          title={product.isBlocked ? "Unblock Product" : "Block Product"}
                        >
                          {product.isBlocked ? (
                            <ShieldCheck size={16} color="#166534" />
                          ) : (
                            <ShieldAlert size={16} color="#b91c1c" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

// Sleek and modern CSS-in-JS properties for fully isolated rendering
const tableWrapperStyles: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  backgroundColor: "var(--surface)",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
};

const headerRowStyles: React.CSSProperties = {
  backgroundColor: "#f9fafb",
  borderBottom: "1px solid var(--border)",
};

const thStyles: React.CSSProperties = {
  textAlign: "left",
  padding: "1rem 1.25rem",
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const rowStyles: React.CSSProperties = {
  borderBottom: "1px solid #f3f4f6",
  transition: "background-color 0.2s ease",
};

const tdStyles: React.CSSProperties = {
  padding: "1rem 1.25rem",
  fontSize: "0.925rem",
  color: "var(--text-main)",
  verticalAlign: "middle",
};

const productInfoWrapperStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  maxWidth: "320px",
};

const thumbnailStyles: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "8px",
  objectFit: "cover",
  backgroundColor: "#e5e7eb",
};

const nameStyles: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.95rem",
};

const descStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--text-muted)",
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const badgeStyles: React.CSSProperties = {
  display: "inline-block",
  padding: "0.2rem 0.5rem",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 600,
  backgroundColor: "rgba(79, 70, 229, 0.08)",
  color: "var(--primary)",
  marginRight: "0.3rem",
};

const subBadgeStyles: React.CSSProperties = {
  display: "inline-block",
  padding: "0.2rem 0.5rem",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 500,
  backgroundColor: "#f3f4f6",
  color: "var(--text-muted)",
};

const offerPriceStyles: React.CSSProperties = {
  fontWeight: 700,
  color: "#ef4444",
};

const originalPriceStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  textDecoration: "line-through",
  color: "var(--text-muted)",
};

const stockBadgeStyles: React.CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.6rem",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: 600,
};

const statusBadgeStyles: React.CSSProperties = {
  display: "inline-block",
  padding: "0.25rem 0.6rem",
  borderRadius: "20px",
  fontSize: "0.75rem",
  fontWeight: 700,
};

const actionsWrapperStyles: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  justifyContent: "flex-end",
};

const actionBtnStyles: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  padding: "0.4rem",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};

const emptyCellStyles: React.CSSProperties = {
  textAlign: "center",
  padding: "3rem",
  color: "var(--text-muted)",
  fontStyle: "italic",
};
