import type { Cart, CartItem } from "@/domain/entities/cart.entity.ts";
import { ProductMapper } from "./ProductMapper.ts";
import mongoose from "mongoose";

interface ICartItemDoc {
  productId?: unknown; // Can be populating object or string ObjectId
  quantity?: number;
  priceSnapshot?: number;
}

interface ICartDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  userId?: mongoose.Types.ObjectId | string;
  items?: ICartItemDoc[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class CartMapper {
  static toEntity(doc: unknown): Cart | null {
    if (!doc) return null;
    const d = doc as ICartDoc;
    return {
      _id: d._id ? d._id.toString() : d.id,
      userId: d.userId ? d.userId.toString() : "",
      items: (d.items || []).map((item) => {
        const productIdRaw = item.productId;
        const isPopulatedProduct = productIdRaw && typeof productIdRaw === "object" && "_id" in productIdRaw;
        const populatedProduct = isPopulatedProduct ? productIdRaw : null;

        return {
          productId: populatedProduct && populatedProduct._id 
            ? populatedProduct._id.toString() 
            : (productIdRaw ? productIdRaw.toString() : ""),
          quantity: item.quantity || 0,
          priceSnapshot: item.priceSnapshot || 0,
          product: populatedProduct && populatedProduct.name 
            ? (ProductMapper.toEntity(populatedProduct) || undefined) 
            : undefined,
        };
      }),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  static toDocument(entity: Cart): Record<string, unknown> {
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
