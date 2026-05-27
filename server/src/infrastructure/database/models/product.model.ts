import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, default: "" },
  brand: { type: String, required: true, index: true },
  tags: [{ type: String, index: true }],
  price: { type: Number, required: true },
  offerPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String, required: true }],
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant", required: true, index: true },
  isBlocked: { type: Boolean, default: false, index: true },
}, { timestamps: true });

// Create a compound text index for optimized text search
productSchema.index({
  name: "text",
  description: "text",
  category: "text",
  subcategory: "text",
  brand: "text",
  tags: "text"
});

export const ProductModel = mongoose.model("Product", productSchema, "products");
