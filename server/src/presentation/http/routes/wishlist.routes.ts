import express from "express";
import { wishlistController } from "@/setup/container/wishlist/controllers.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import { ROUTE_BASE, ROUTE_PRODUCT_ID_PARAM } from "./routes.constants.ts";

const router = express.Router();

router.get(ROUTE_BASE, authenticate, wishlistController.get);
router.post(ROUTE_BASE, authenticate, wishlistController.add);
router.delete(ROUTE_PRODUCT_ID_PARAM, authenticate, wishlistController.remove);

export default router;
