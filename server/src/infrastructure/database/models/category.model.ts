import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subcategories: [{ type: String }]
}, { timestamps: true });

export const CategoryModel = mongoose.model("Category", categorySchema, "categories");
