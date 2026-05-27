import express from "express";
import { cartController } from "@/setup/container/shopping.container.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import { ROUTE_BASE, ROUTE_PRODUCT_ID_PARAM } from "./routes.constants.ts";

const router = express.Router();

router.get(ROUTE_BASE, authenticate, cartController.get);
router.post(ROUTE_BASE, authenticate, cartController.add);
router.put(ROUTE_BASE, authenticate, cartController.updateQuantity);
router.delete(ROUTE_PRODUCT_ID_PARAM, authenticate, cartController.remove);
router.delete(ROUTE_BASE, authenticate, cartController.clear);

export default router;
