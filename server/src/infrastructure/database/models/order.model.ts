import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  priceSnapshot: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "shipped", "completed", "cancelled", "returned"],
    default: "pending"
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
  status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  orderNumber: { type: String }
}, { timestamps: true });

export const OrderModel = mongoose.model("Order", orderSchema, "orders");
