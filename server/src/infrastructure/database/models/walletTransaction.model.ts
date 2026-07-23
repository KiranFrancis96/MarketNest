import mongoose from "mongoose";

export interface IWalletTransactionDoc extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  orderId?: mongoose.Types.ObjectId;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const WalletTransactionModel = mongoose.model<IWalletTransactionDoc>(
  "WalletTransaction",
  walletTransactionSchema,
  "walletTransactions"
);
