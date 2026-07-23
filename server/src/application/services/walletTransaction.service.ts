import { WalletTransactionModel } from "@/infrastructure/database/models/walletTransaction.model.ts";
import mongoose from "mongoose";

export async function recordWalletTransaction({
  userId,
  type,
  amount,
  description,
  balanceAfter,
  orderId,
}: {
  userId: string | mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  balanceAfter: number;
  orderId?: string | mongoose.Types.ObjectId;
}) {
  try {
    const userObjId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;
    const orderObjId = orderId ? (typeof orderId === "string" ? new mongoose.Types.ObjectId(orderId) : orderId) : undefined;

    const doc = await WalletTransactionModel.create({
      userId: userObjId,
      type,
      amount,
      description,
      balanceAfter,
      orderId: orderObjId || undefined,
    });
    return doc;
  } catch (err) {
    console.error("CRITICAL: Failed to record wallet transaction:", err);
    throw err;
  }
}
