import type { Order } from "@/domain/entities/order.entity.ts";
import { ProductMapper } from "./ProductMapper.ts";
import mongoose from "mongoose";

interface IOrderItemDoc {
  productId?: unknown; // Can be populated object or ObjectId string
  quantity?: number;
  priceSnapshot?: number;
  status?: string;
}

interface IOrderDoc {
  _id?: mongoose.Types.ObjectId | string;
  id?: string;
  userId?: mongoose.Types.ObjectId | string;
  items?: IOrderItemDoc[];
  totalAmount?: number;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status?: Order["status"];
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrderMapper {
  static toEntity(doc: unknown): Order | null {
    if (!doc) return null;
    const d = doc as IOrderDoc;
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
          status: (item.status as any) || "pending",
        };
      }),
      totalAmount: d.totalAmount || 0,
      shippingAddress: {
        fullName: d.shippingAddress?.fullName || "",
        phone: d.shippingAddress?.phone || "",
        street: d.shippingAddress?.street || "",
        city: d.shippingAddress?.city || "",
        state: d.shippingAddress?.state || "",
        zipCode: d.shippingAddress?.zipCode || "",
        country: d.shippingAddress?.country || ""
      },
      razorpayOrderId: d.razorpayOrderId,
      razorpayPaymentId: d.razorpayPaymentId,
      razorpaySignature: d.razorpaySignature,
      status: d.status || "pending",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  static toDocument(entity: Partial<Order>): Record<string, unknown> {
    const doc: Record<string, unknown> = {};
    if (entity.userId !== undefined) doc.userId = entity.userId;
    if (entity.items !== undefined) {
      doc.items = (entity.items || []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        status: item.status || "pending",
      }));
    }
    if (entity.totalAmount !== undefined) doc.totalAmount = entity.totalAmount;
    if (entity.shippingAddress !== undefined) {
      doc.shippingAddress = {
        fullName: entity.shippingAddress.fullName,
        phone: entity.shippingAddress.phone,
        street: entity.shippingAddress.street,
        city: entity.shippingAddress.city,
        state: entity.shippingAddress.state,
        zipCode: entity.shippingAddress.zipCode,
        country: entity.shippingAddress.country
      };
    }
    if (entity.razorpayOrderId !== undefined) doc.razorpayOrderId = entity.razorpayOrderId;
    if (entity.razorpayPaymentId !== undefined) doc.razorpayPaymentId = entity.razorpayPaymentId;
    if (entity.razorpaySignature !== undefined) doc.razorpaySignature = entity.razorpaySignature;
    if (entity.status !== undefined) doc.status = entity.status;
    return doc;
  }
}
