import express from 'express'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import authRoutes from "./interface/routes/auth.routes.ts";
import merchantRoutes from "./interface/routes/merchant.routes.ts";
import adminRoutes from "./interface/routes/admin.routes.ts";
import cors from "cors";
import httpLogger from './middleware/middleware.ts'
import logger from './utils/logger.ts'
import { ApiError } from './utils/apiError.ts';
import type { NextFunction, Request, Response } from 'express';

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

app.use("/api/auth", authRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/admin", adminRoutes);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error(err, "Unhandled API error");
  res.status(500).json({ message: "Internal server error" });
});

mongoose.connect(process.env.MONGO_URI!).then(() => {
    logger.info("DB connected");
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`server started running at : http://localhost:${PORT}`)
  })
});
