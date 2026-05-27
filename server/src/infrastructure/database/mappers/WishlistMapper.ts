import type { Wishlist } from "@/domain/entities/wishlist.entity.ts";
import { ProductMapper } from "./ProductMapper.ts";

export class WishlistMapper {
  static toEntity(doc: any): Wishlist | null {
    if (!doc) return null;
    const entity: Wishlist = {
      _id: doc._id ? doc._id.toString() : doc.id,
      userId: doc.userId ? doc.userId.toString() : doc.userId,
      productId: doc.productId && doc.productId._id 
        ? doc.productId._id.toString() 
        : (doc.productId ? doc.productId.toString() : doc.productId),
    };

    if (doc.productId && doc.productId.name) {
      const productEntity = ProductMapper.toEntity(doc.productId);
      if (productEntity) {
        entity.product = productEntity;
      }
    }

    return entity;
  }

  static toDocument(entity: Wishlist): any {
    return {
      userId: entity.userId,
      productId: entity.productId,
    };
  }
}
