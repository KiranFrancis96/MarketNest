import express from "express";
import * as controller from "../controllers/admin.controller.ts";
import { adminAuth } from "@/middleware/adminAuth.middleware.ts";
import {
  ROUTE_LOGIN,
  ROUTE_FORGOT_PW,
  ROUTE_RESET_PW,
  ROUTE_RESEND_OTP,
  ROUTE_LOGOUT,
  ROUTE_USERS,
  ROUTE_MERCHANTS,
  ROUTE_MERCHANT_APPROVE,
  ROUTE_MERCHANT_REJECT,
  ROUTE_MERCHANT_BLOCK,
  ROUTE_MERCHANT_UNBLOCK,
  ROUTE_USER_BLOCK,
  ROUTE_USER_UNBLOCK,
} from "./routes.constants.ts";

const router = express.Router();

// Public routes
router.post(ROUTE_LOGIN, controller.login);
router.post(ROUTE_FORGOT_PW, controller.forgotPassword);
router.post(ROUTE_RESET_PW, controller.resetPassword);
router.post(ROUTE_RESEND_OTP, controller.resendOtp);
router.post(ROUTE_LOGOUT, controller.logout);

// Protected routes
router.use(adminAuth);

router.get(ROUTE_USERS, controller.getUsers);
router.get(ROUTE_MERCHANTS, controller.getMerchants);
router.patch(ROUTE_MERCHANT_APPROVE, controller.approveMerchant);
router.patch(ROUTE_MERCHANT_REJECT, controller.rejectMerchant);
router.patch(ROUTE_MERCHANT_BLOCK, controller.blockMerchant);
router.patch(ROUTE_MERCHANT_UNBLOCK, controller.unblockMerchant);
router.patch(ROUTE_USER_BLOCK, controller.blockUser);
router.patch(ROUTE_USER_UNBLOCK, controller.unblockUser);

export default router;
