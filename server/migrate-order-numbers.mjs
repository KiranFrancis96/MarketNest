import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  totalAmount: Number,
  status: String,
  orderNumber: String,
  razorpayOrderId: String,
  createdAt: Date,
}, { timestamps: true });

const OrderModel = mongoose.model("Order", orderSchema, "orders");

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URL;
  if (!uri) {
    console.error("❌ No MongoDB URI found in .env (tried MONGODB_URI, MONGO_URI, DB_URL)");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log("✅ Connected.");

  const orders = await OrderModel.find({}).sort({ createdAt: 1 }).lean();
  console.log(`📦 Found ${orders.length} total orders.`);

  let migrated = 0;
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    if (!order.orderNumber) {
      await OrderModel.updateOne({ _id: order._id }, { $set: { orderNumber: String(i + 1) } });
      migrated++;
      console.log(`  ✏️  Order ${order._id} → orderNumber = "${i + 1}"`);
    } else {
      console.log(`  ✓  Order ${order._id} already has orderNumber = "${order.orderNumber}"`);
    }
  }

  console.log(`\n🎉 Migration complete! ${migrated} orders updated out of ${orders.length} total.`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
