import express from "express";
import { categoryController } from "@/setup/container/shopping.container.ts";
import { adminOrMerchantAuth } from "@/middleware/adminOrMerchantAuth.middleware.ts";
import { ROUTE_BASE, ROUTE_SUBCATEGORY } from "./routes.constants.ts";

const router = express.Router();

router.get(ROUTE_BASE, categoryController.getAll);

router.post(ROUTE_BASE, adminOrMerchantAuth, categoryController.create);
router.post(ROUTE_SUBCATEGORY, adminOrMerchantAuth, categoryController.addSubcategory);

export default router;
