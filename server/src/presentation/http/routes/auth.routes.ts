import express from "express";
import { authController } from "@/setup/container/user/controllers.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";
import {
  ROUTE_REGISTER,
  ROUTE_LOGIN,
  ROUTE_LOGOUT,
  ROUTE_VERIFY_OTP,
  ROUTE_RESEND_OTP,
  ROUTE_FORGOT_PW,
  ROUTE_RESET_PW,
  ROUTE_REFRESH,
  ROUTE_PROFILE,
  ROUTE_GOOGLE,
  ROUTE_ADDRESSES,
  ROUTE_ADDRESS_BY_ID,
} from "./routes.constants.ts";

const router = express.Router();

router.post(ROUTE_REGISTER, authController.register);
router.post(ROUTE_LOGIN, authController.login);
router.post(ROUTE_VERIFY_OTP, authController.verify);
router.get(ROUTE_PROFILE, authenticate, authController.getProfile);
router.post(ROUTE_REFRESH, authController.refresh);
router.post(ROUTE_LOGOUT, authController.logout);
router.post(ROUTE_FORGOT_PW, authController.forgotPassword);
router.post(ROUTE_RESET_PW, authController.resetPassword);
router.post(ROUTE_RESEND_OTP, authController.resendOtp);
router.post(ROUTE_GOOGLE, authController.googleAuth);

// Address Management
router.post(ROUTE_ADDRESSES, authenticate, authController.addAddress);
router.put(ROUTE_ADDRESS_BY_ID, authenticate, authController.updateAddress);
router.delete(ROUTE_ADDRESS_BY_ID, authenticate, authController.deleteAddress);

export default router;