import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";
import { ProductMapper } from "./ProductMapper.ts";
import mongoose from "mongoose";

interface IWishlistDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  userId?: mongoose.Types.ObjectId | string;
  productId?: unknown; // Can be populated product object or string ObjectId
}

export class WishlistMapper {
  static toEntity(doc: unknown): Wishlist | null {
    if (!doc) return null;
    const d = doc as IWishlistDoc;
    const productIdRaw = d.productId;
    const isPopulatedProduct = productIdRaw && typeof productIdRaw === "object" && "_id" in productIdRaw;
    const populatedProduct = isPopulatedProduct ? productIdRaw : null;

    const entity: Wishlist = {
      _id: d._id ? d._id.toString() : d.id,
      userId: d.userId ? d.userId.toString() : "",
      productId: populatedProduct && populatedProduct._id 
        ? populatedProduct._id.toString() 
        : (productIdRaw ? productIdRaw.toString() : ""),
    };

    if (populatedProduct && populatedProduct.name) {
      const productEntity = ProductMapper.toEntity(populatedProduct);
      if (productEntity) {
        entity.product = productEntity;
      }
    }

    return entity;
  }

  static toDocument(entity: Wishlist): Record<string, unknown> {
    return {
      userId: entity.userId,
      productId: entity.productId,
    };
  }
}
