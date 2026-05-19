import express from "express";
import * as controller from "../controllers/merchant.controller.ts";
import { authenticateMerchant } from "@/middleware/merchantAuth.middleware.ts";
import {
  ROUTE_REGISTER,
  ROUTE_LOGIN,
  ROUTE_LOGOUT,
  ROUTE_VERIFY_OTP,
  ROUTE_FORGOT_PW,
  ROUTE_RESET_PW,
  ROUTE_RESEND_OTP,
  ROUTE_MERCHANT_ME,
  ROUTE_MERCHANT_REAPPLY,
} from "./routes.constants.ts";

const router = express.Router();

router.post(ROUTE_REGISTER, controller.register);
router.post(ROUTE_LOGIN, controller.login);
router.post(ROUTE_LOGOUT, controller.logout);
router.post(ROUTE_VERIFY_OTP, controller.verifyOtp);
router.post(ROUTE_FORGOT_PW, controller.forgotPassword);
router.post(ROUTE_RESET_PW, controller.resetPassword);
router.post(ROUTE_RESEND_OTP, controller.resendOtp);

// Protected routes
router.get(ROUTE_MERCHANT_ME, authenticateMerchant, controller.getProfile);
router.patch(ROUTE_MERCHANT_REAPPLY, authenticateMerchant, controller.reapply);

export default router;
