import express from "express";
import * as controller from "../controllers/auth.controller.ts";
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
} from "./routes.constants.ts";

const router = express.Router();

router.post(ROUTE_REGISTER, controller.register);
router.post(ROUTE_LOGIN, controller.login);
router.post(ROUTE_VERIFY_OTP, controller.verify);
router.get(ROUTE_PROFILE, authenticate, controller.getProfile);
router.post(ROUTE_REFRESH, controller.refresh);
router.post(ROUTE_LOGOUT, controller.logout);
router.post(ROUTE_FORGOT_PW, controller.forgotPassword);
router.post(ROUTE_RESET_PW, controller.resetPassword);
router.post(ROUTE_RESEND_OTP, controller.resendOtp);

export default router;