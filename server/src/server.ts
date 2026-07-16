import express from 'express'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import authRoutes from "./presentation/http/routes/auth.routes.ts";
import merchantRoutes from "./presentation/http/routes/merchant.routes.ts";
import adminRoutes from "./presentation/http/routes/admin.routes.ts";
import productRoutes from "./presentation/http/routes/product.routes.ts";
import categoryRoutes from "./presentation/http/routes/category.routes.ts";
import cartRoutes from "./presentation/http/routes/cart.routes.ts";
import wishlistRoutes from "./presentation/http/routes/wishlist.routes.ts";
import orderRoutes from "./presentation/http/routes/order.routes.ts";
import notificationRoutes from "./presentation/http/routes/notification.routes.ts";
import userProfileRoutes from "./presentation/http/routes/userProfile.routes.ts";
import cors from "cors";
import httpLogger from './middleware/middleware.ts'
import logger from './utils/logger.ts'
import { errorHandler } from "./middleware/errorHandler.middleware.ts";
import { seedCategories, seedUsers } from "./setup/seeder.ts";
import { OrderModel } from "./infrastructure/database/models/order.model.ts";
import {
  BASE_AUTH_ROUTE,
  BASE_MERCHANT_ROUTE,
  BASE_ADMIN_ROUTE,
  BASE_PRODUCT_ROUTE,
  BASE_CATEGORY_ROUTE,
  BASE_CART_ROUTE,
  BASE_WISHLIST_ROUTE,
  BASE_ORDER_ROUTE,
  BASE_NOTIFICATION_ROUTE,
  BASE_PROFILE_ROUTE,
} from "./presentation/http/routes/routes.constants.ts";

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT) || 3000

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ limit: "5mb", extended: true }))
app.use(cookieParser());
app.use(httpLogger)
app.use("/uploads", express.static("uploads"));

app.use(BASE_AUTH_ROUTE, authRoutes);
app.use(BASE_MERCHANT_ROUTE, merchantRoutes);
app.use(BASE_ADMIN_ROUTE, adminRoutes);
app.use(BASE_PRODUCT_ROUTE, productRoutes);
app.use(BASE_CATEGORY_ROUTE, categoryRoutes);
app.use(BASE_CART_ROUTE, cartRoutes);
app.use(BASE_WISHLIST_ROUTE, wishlistRoutes);
app.use(BASE_ORDER_ROUTE, orderRoutes);
app.use(BASE_NOTIFICATION_ROUTE, notificationRoutes);
app.use(BASE_PROFILE_ROUTE, userProfileRoutes);

app.use(errorHandler);


mongoose.connect(process.env.MONGO_URI!).then(async () => {
  logger.info("DB connected");
  await seedCategories();
  await seedUsers();

  // Drop stale unique index on orderNumber (schema no longer enforces unique, but old index may still exist in MongoDB)
  try {
    await OrderModel.collection.dropIndex("orderNumber_1");
    logger.info("Dropped stale unique index on orderNumber.");
  } catch (_e) {
    // Index may not exist — that's fine
  }

  // Auto-migrate: assign sequential orderNumbers to all PAID orders sorted by creation date (oldest = 1)
  try {
    const paidOrders = await OrderModel.find({ status: "paid" }).sort({ createdAt: 1 }).lean();
    for (let i = 0; i < paidOrders.length; i++) {
      await OrderModel.updateOne(
        { _id: paidOrders[i]._id },
        { $set: { orderNumber: String(i + 1) } }
      );
    }
    if (paidOrders.length > 0) {
      logger.info(`Order number migration: renumbered ${paidOrders.length} paid orders from 1 in date order.`);
    }
  } catch (err) {
    logger.warn("Order number migration failed: " + (err as Error).message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`server started running at : http://localhost:${PORT}`)
  })
});
