import type { Category } from "@/domain/entities/category.entity.ts";
import mongoose from "mongoose";

interface ICategoryDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  name?: string;
  subcategories?: string[];
}

export class CategoryMapper {
  static toEntity(doc: unknown): Category | null {
    if (!doc) return null;
    const d = doc as ICategoryDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      name: d.name || "",
      subcategories: d.subcategories || [],
    };
  }

  static toDocument(entity: Category): Record<string, unknown> {
    return {
      name: entity.name,
      subcategories: entity.subcategories,
    };
  }
}
