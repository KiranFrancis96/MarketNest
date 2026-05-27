import type { Category } from "@/domain/entities/category.entity.ts";

export class CategoryMapper {
  static toEntity(doc: any): Category | null {
    if (!doc) return null;
    return {
      _id: doc._id ? doc._id.toString() : doc.id,
      name: doc.name,
      subcategories: doc.subcategories || [],
    };
  }

  static toDocument(entity: Category): any {
    return {
      name: entity.name,
      subcategories: entity.subcategories,
    };
  }
}
