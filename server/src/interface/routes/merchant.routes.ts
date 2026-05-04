import express from "express";
import * as controller from "../controllers/merchant.controller.ts";
import { authenticateMerchant } from "@/middleware/merchantAuth.middleware.ts";

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.post("/verify-otp", controller.verifyOtp);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/resend-otp", controller.resendOtp);

// Protected routes
router.get("/me", authenticateMerchant, controller.getProfile);

export default router;
