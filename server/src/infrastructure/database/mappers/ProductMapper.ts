import type { Product } from "@/domain/entities/product.entity.ts";

export class ProductMapper {
  static toEntity(doc: any): Product | null {
    if (!doc) return null;
    return {
      _id: doc._id ? doc._id.toString() : doc.id,
      name: doc.name,
      description: doc.description,
      category: doc.category,
      subcategory: doc.subcategory,
      brand: doc.brand,
      tags: doc.tags || [],
      price: doc.price,
      offerPrice: doc.offerPrice ?? undefined,
      stock: doc.stock,
      images: doc.images || [],
      merchantId: doc.merchantId ? doc.merchantId.toString() : doc.merchantId,
      isBlocked: doc.isBlocked ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toDocument(entity: Product): any {
    return {
      name: entity.name,
      description: entity.description,
      category: entity.category,
      subcategory: entity.subcategory,
      brand: entity.brand,
      tags: entity.tags,
      price: entity.price,
      offerPrice: entity.offerPrice,
      stock: entity.stock,
      images: entity.images,
      merchantId: entity.merchantId,
      isBlocked: entity.isBlocked,
    };
  }
}
