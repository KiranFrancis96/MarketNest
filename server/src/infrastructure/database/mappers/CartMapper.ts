import type { Cart, CartItem } from "@/domain/entities/cart.entity.ts";
import { ProductMapper } from "./ProductMapper.ts";

export class CartMapper {
  static toEntity(doc: any): Cart | null {
    if (!doc) return null;
    return {
      _id: doc._id ? doc._id.toString() : doc.id,
      userId: doc.userId ? doc.userId.toString() : doc.userId,
      items: (doc.items || []).map((item: any) => {
        return {
          productId: item.productId && item.productId._id 
            ? item.productId._id.toString() 
            : (item.productId ? item.productId.toString() : item.productId),
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
          product: item.productId && item.productId.name 
            ? (ProductMapper.toEntity(item.productId) || undefined) 
            : undefined,
        };
      }),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  static toDocument(entity: Cart): any {
    return {
      userId: entity.userId,
      items: (entity.items || []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
      })),
    };
  }
}
