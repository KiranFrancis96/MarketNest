import React, { useState, useEffect } from "react";
import { X, Upload, Trash } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/app/store";
import type { Product } from "../model/productSlice";
import { addProduct, editProduct, fetchCategories, createCategory, addSubcategory } from "../model/productSlice";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const categoriesList = useSelector((state: RootState) => state.product.categories);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [stock, setStock] = useState("");
  
  // Images
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [remainingImageUrls, setRemainingImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setSubcategory(productToEdit.subcategory);
      setBrand(productToEdit.brand);
      setTags(productToEdit.tags?.join(", ") || "");
      setPrice(productToEdit.price.toString());
      setOfferPrice(productToEdit.offerPrice?.toString() || "");
      setStock(productToEdit.stock.toString());
      setRemainingImageUrls(productToEdit.images || []);
      setNewImageFiles([]);
      
      const categoryExists = categoriesList.some((c) => c.name === productToEdit.category);
      setIsCustomCategory(!categoryExists && !!productToEdit.category);
      
      const activeCat = categoriesList.find((c) => c.name === productToEdit.category);
      const subcategoryExists = activeCat ? activeCat.subcategories.includes(productToEdit.subcategory) : false;
      setIsCustomSubcategory(!subcategoryExists && !!productToEdit.subcategory);
    } else {
      setName("");
      setDescription("");
      setCategory("");
      setSubcategory("");
      setBrand("");
      setTags("");
      setPrice("");
      setOfferPrice("");
      setStock("");
      setRemainingImageUrls([]);
      setNewImageFiles([]);
      setIsCustomCategory(false);
      setIsCustomSubcategory(false);
    }
  }, [productToEdit, isOpen, categoriesList]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Max 5 images total
      const totalImages = remainingImageUrls.length + newImageFiles.length + filesArray.length;
      if (totalImages > 5) {
        alert("You can upload a maximum of 5 images per product.");
        return;
      }
      setNewImageFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeNewFile = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeRemainingUrl = (urlToRemove: string) => {
    setRemainingImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !brand || !price || !stock) {
      alert("Please fill in all core fields");
      return;
    }

    if (remainingImageUrls.length + newImageFiles.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("subcategory", subcategory);
    formData.append("brand", brand);
    
    // Tags parsed
    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    formData.append("tags", JSON.stringify(tagsArray));
    
    formData.append("price", price);
    if (offerPrice) {
      formData.append("offerPrice", offerPrice);
    }
    formData.append("stock", stock);

    // Append files
    newImageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      if (isCustomCategory && category) {
        const categoryExists = categoriesList.some(
          (c) => c.name.toLowerCase() === category.toLowerCase()
        );
        if (!categoryExists) {
          try {
            await dispatch(createCategory({
              name: category,
              subcategories: subcategory ? [subcategory] : []
            })).unwrap();
          } catch (err) {}
        } else if (subcategory) {
          const existingCat = categoriesList.find(
            (c) => c.name.toLowerCase() === category.toLowerCase()
          );
          if (existingCat && !existingCat.subcategories.some(sub => sub.toLowerCase() === subcategory.toLowerCase())) {
            try {
              await dispatch(addSubcategory({
                name: existingCat.name,
                subcategoryName: subcategory
              })).unwrap();
            } catch (err) {}
          }
        }
      } else if (!isCustomCategory && category && isCustomSubcategory && subcategory) {
        const existingCat = categoriesList.find(
          (c) => c.name.toLowerCase() === category.toLowerCase()
        );
        if (existingCat && !existingCat.subcategories.some(sub => sub.toLowerCase() === subcategory.toLowerCase())) {
          try {
            await dispatch(addSubcategory({
              name: existingCat.name,
              subcategoryName: subcategory
            })).unwrap();
          } catch (err) {}
        }
      }

      if (productToEdit) {
        formData.append("remainingImages", JSON.stringify(remainingImageUrls));
        await dispatch(editProduct({ id: productToEdit._id, formData })).unwrap();
      } else {
        await dispatch(addProduct(formData)).unwrap();
      }
      onClose();
    } catch (err: any) {
      alert(err || "Failed to save product. Please check form constraints.");
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = categoriesList.find((c) => c.name === category);
  const subcategoriesToDisplay = activeCategory ? activeCategory.subcategories : [];

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: "650px", width: "90%" }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {productToEdit ? "Edit Product" : "Add Product listing"}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                style={{ minHeight: "80px", fontFamily: "inherit" }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label className="form-label" style={{ margin: 0 }}>Category *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newIsCustom = !isCustomCategory;
                      setIsCustomCategory(newIsCustom);
                      setCategory("");
                      setSubcategory("");
                      if (newIsCustom) {
                        setIsCustomSubcategory(true);
                      } else {
                        setIsCustomSubcategory(false);
                      }
                    }}
                    style={customToggleStyles}
                  >
                    {isCustomCategory ? "Select Existing" : "Create Custom"}
                  </button>
                </div>
                {isCustomCategory ? (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter custom category..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                ) : (
                  <select
                    className="form-input"
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setSubcategory("");
                      setIsCustomSubcategory(false);
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categoriesList.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label className="form-label" style={{ margin: 0 }}>Subcategory</label>
                  {!isCustomCategory && category && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSubcategory(!isCustomSubcategory);
                        setSubcategory("");
                      }}
                      style={customToggleStyles}
                    >
                      {isCustomSubcategory ? "Select Existing" : "Create Custom"}
                    </button>
                  )}
                  {isCustomCategory && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>Custom Input</span>
                  )}
                </div>
                {isCustomSubcategory || isCustomCategory ? (
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter subcategory..."
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  />
                ) : (
                  <select
                    className="form-input"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={!category}
                  >
                    <option value="">Select Subcategory</option>
                    {subcategoriesToDisplay.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <input
                  type="text"
                  className="form-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. running, sports, red"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Offer Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  step="0.01"
                  placeholder="Optional discount price"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Image Upload section */}
            <div className="form-group">
              <label className="form-label">Product Images * (Up to 5 total)</label>
              
              <div style={uploadDropStyles}>
                <Upload size={24} style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Drag & Drop or Click to upload
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={fileInputHiddenStyles}
                />
              </div>

              {/* Display existing images to delete */}
              {remainingImageUrls.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4 style={subLabelStyles}>Existing Images</h4>
                  <div style={imagePreviewGridStyles}>
                    {remainingImageUrls.map((url, i) => (
                      <div key={url} style={thumbnailWrapperStyles}>
                        <img src={url} alt={`img-${i}`} style={thumbnailStyles} />
                        <button
                          type="button"
                          onClick={() => removeRemainingUrl(url)}
                          style={deleteBtnStyles}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display new files to upload */}
              {newImageFiles.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <h4 style={subLabelStyles}>New Images to Upload</h4>
                  <div style={imagePreviewGridStyles}>
                    {newImageFiles.map((file, i) => {
                      const objectUrl = URL.createObjectURL(file);
                      return (
                        <div key={i} style={thumbnailWrapperStyles}>
                          <img src={objectUrl} alt={`new-${i}`} style={thumbnailStyles} />
                          <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            style={deleteBtnStyles}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-success"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              disabled={loading}
            >
              {loading ? "Processing..." : productToEdit ? "Save Changes" : "List Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Styles for multi-step Modal
const uploadDropStyles: React.CSSProperties = {
  border: "2px dashed var(--border)",
  borderRadius: "12px",
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  position: "relative",
  backgroundColor: "#f9fafb",
  transition: "all 0.2s ease",
};

const fileInputHiddenStyles: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};

const subLabelStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "var(--text-muted)",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const imagePreviewGridStyles: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
};

const thumbnailWrapperStyles: React.CSSProperties = {
  position: "relative",
  width: "64px",
  height: "64px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid var(--border)",
};

const thumbnailStyles: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const deleteBtnStyles: React.CSSProperties = {
  position: "absolute",
  top: 2,
  right: 2,
  backgroundColor: "rgba(239, 68, 68, 0.9)",
  color: "white",
  border: "none",
  borderRadius: "4px",
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
};

const customToggleStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--primary)",
  fontSize: "0.75rem",
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
  textDecoration: "underline",
};
