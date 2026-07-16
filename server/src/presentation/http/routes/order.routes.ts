import express from "express";
import { orderController } from "@/setup/container/order/controllers.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import { authenticateMerchant } from "@/middleware/merchantAuth.middleware.ts";
import { adminAuth } from "@/middleware/adminAuth.middleware.ts";
import {
  ROUTE_ORDER_BASE,
  ROUTE_ORDER_MERCHANT_SALES,
  ROUTE_ORDER_MERCHANT_ITEM_STATUS,
  ROUTE_ORDER_USER_ITEM_STATUS,
  ROUTE_ORDER_ADMIN_USER,
  ROUTE_ORDER_ADMIN_MERCHANT,
  ROUTE_ORDER_VERIFY,
  ROUTE_ORDER_WALLET_PAY,
  ROUTE_ORDER_FAIL,
  ROUTE_ORDER_WALLET_ADD,
  ROUTE_ORDER_MIGRATE_NUMBERS,
  ROUTE_ORDER_BY_ID,
} from "./routes.constants.ts";

const router = express.Router();

router.get(ROUTE_ORDER_BASE, authenticate, orderController.getUserHistory);
router.get(ROUTE_ORDER_MERCHANT_SALES, authenticateMerchant, orderController.getMerchantSalesHistory);
router.patch(ROUTE_ORDER_MERCHANT_ITEM_STATUS, authenticateMerchant, orderController.updateMerchantItemStatus);
router.patch(ROUTE_ORDER_USER_ITEM_STATUS, authenticate, orderController.updateUserItemStatus);
router.get(ROUTE_ORDER_ADMIN_USER, adminAuth, orderController.getAdminUserHistory);
router.get(ROUTE_ORDER_ADMIN_MERCHANT, adminAuth, orderController.getAdminMerchantHistory);

router.post(ROUTE_ORDER_BASE, authenticate, orderController.create);
router.post(ROUTE_ORDER_VERIFY, authenticate, orderController.verify);
router.post(ROUTE_ORDER_WALLET_PAY, authenticate, orderController.payWithWallet);
router.post(ROUTE_ORDER_FAIL, authenticate, orderController.markAsFailed);
router.post(ROUTE_ORDER_WALLET_ADD, authenticate, orderController.addWalletFunds);
router.post(ROUTE_ORDER_MIGRATE_NUMBERS, orderController.migrateOrderNumbers);

router.get(ROUTE_ORDER_BY_ID, authenticate, orderController.getById);

export default router;
