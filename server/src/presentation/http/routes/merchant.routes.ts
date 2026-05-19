import express from "express";
import { merchantController } from "@/setup/container/merchant/controllers.ts";
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
  ROUTE_GOOGLE,
  ROUTE_MERCHANT_COMPLETE_PROFILE,
} from "./routes.constants.ts";

const router = express.Router();

router.post(ROUTE_REGISTER, merchantController.register);
router.post(ROUTE_LOGIN, merchantController.login);
router.post(ROUTE_LOGOUT, merchantController.logout);
router.post(ROUTE_VERIFY_OTP, merchantController.verifyOtp);
router.post(ROUTE_FORGOT_PW, merchantController.forgotPassword);
router.post(ROUTE_RESET_PW, merchantController.resetPassword);
router.post(ROUTE_RESEND_OTP, merchantController.resendOtp);
router.post(ROUTE_GOOGLE, merchantController.googleAuth);

// Protected routes
router.get(ROUTE_MERCHANT_ME, authenticateMerchant, merchantController.getProfile);
router.patch(ROUTE_MERCHANT_REAPPLY, authenticateMerchant, merchantController.reapply);
router.post(ROUTE_MERCHANT_COMPLETE_PROFILE, authenticateMerchant, merchantController.completeProfile);

export default router;
