import type { Product } from "@/domain/entities/product.entity.ts";
import mongoose from "mongoose";

interface IProductDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  tags?: string[];
  price?: number;
  offerPrice?: number | null;
  stock?: number;
  images?: string[];
  merchantId?: mongoose.Types.ObjectId | string;
  isBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProductMapper {
  static toEntity(doc: unknown): Product | null {
    if (!doc) return null;
    const d = doc as IProductDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      name: d.name || "",
      description: d.description || "",
      category: d.category || "",
      subcategory: d.subcategory || "",
      brand: d.brand || "",
      tags: d.tags || [],
      price: d.price || 0,
      offerPrice: d.offerPrice ?? undefined,
      stock: d.stock || 0,
      images: d.images || [],
      merchantId: d.merchantId ? d.merchantId.toString() : "",
      isBlocked: d.isBlocked ?? false,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  static toDocument(entity: Product): Record<string, unknown> {
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
