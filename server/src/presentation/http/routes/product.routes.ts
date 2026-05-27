import express from "express";
import { productController } from "@/setup/container/shopping.container.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import { authenticateMerchant } from "@/middleware/merchantAuth.middleware.ts";
import { adminAuth } from "@/middleware/adminAuth.middleware.ts";
import { uploadProductImages } from "@/middleware/upload.middleware.ts";
import {
  ROUTE_BASE,
  ROUTE_PRODUCT_SEARCH,
  ROUTE_PRODUCT_RECOMMENDATIONS,
  ROUTE_PRODUCT_BY_ID,
  ROUTE_MERCHANT_PRODUCT_LIST,
  ROUTE_MERCHANT_PRODUCT_ADD,
  ROUTE_MERCHANT_PRODUCT_EDIT,
  ROUTE_MERCHANT_PRODUCT_DELETE,
  ROUTE_ADMIN_PRODUCT_BLOCK,
} from "./routes.constants.ts";

const router = express.Router();

router.get(ROUTE_BASE, productController.getShoppingProducts);
router.get(ROUTE_PRODUCT_SEARCH, productController.search);
router.get(ROUTE_PRODUCT_RECOMMENDATIONS, authenticate, productController.getRecommendations);
router.get(ROUTE_PRODUCT_BY_ID, productController.getById);

router.get(ROUTE_MERCHANT_PRODUCT_LIST, authenticateMerchant, productController.getMerchantProducts);
router.post(ROUTE_MERCHANT_PRODUCT_ADD, authenticateMerchant, uploadProductImages, productController.add);
router.put(ROUTE_MERCHANT_PRODUCT_EDIT, authenticateMerchant, uploadProductImages, productController.edit);
router.delete(ROUTE_MERCHANT_PRODUCT_DELETE, authenticateMerchant, productController.delete);

router.patch(ROUTE_ADMIN_PRODUCT_BLOCK, adminAuth, productController.toggleBlock);

export default router;
