import express from "express";
import { adminController } from "@/setup/container/admin/controllers.ts";
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
  ROUTE_USER_UPDATE,
} from "./routes.constants.ts";

const router = express.Router();

// Public routes
router.post(ROUTE_LOGIN, adminController.login);
router.post(ROUTE_FORGOT_PW, adminController.forgotPassword);
router.post(ROUTE_RESET_PW, adminController.resetPassword);
router.post(ROUTE_RESEND_OTP, adminController.resendOtp);
router.post(ROUTE_LOGOUT, adminController.logout);

// Protected routes
router.use(adminAuth);

router.get(ROUTE_USERS, adminController.getUsers);
router.get(ROUTE_MERCHANTS, adminController.getMerchants);
router.patch(ROUTE_MERCHANT_APPROVE, adminController.approveMerchant);
router.patch(ROUTE_MERCHANT_REJECT, adminController.rejectMerchant);
router.patch(ROUTE_MERCHANT_BLOCK, adminController.blockMerchant);
router.patch(ROUTE_MERCHANT_UNBLOCK, adminController.unblockMerchant);
router.patch(ROUTE_USER_BLOCK, adminController.blockUser);
router.patch(ROUTE_USER_UNBLOCK, adminController.unblockUser);
router.patch(ROUTE_USER_UPDATE, adminController.updateUser);

export default router;
