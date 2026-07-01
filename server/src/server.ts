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
import cors from "cors";
import httpLogger from './middleware/middleware.ts'
import logger from './utils/logger.ts'
import { errorHandler } from "./middleware/errorHandler.middleware.ts";
import { seedCategories, seedUsers } from "./setup/seeder.ts";
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
} from "./presentation/http/routes/routes.constants.ts";

dotenv.config()

const app = express()

const PORT = Number(process.env.PORT) || 3000

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json())
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

app.use(errorHandler);

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI!).then(async () => {
  logger.info("DB connected");
  await seedCategories();
  await seedUsers();
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`server started running at : http://localhost:${PORT}`)
  })
});
