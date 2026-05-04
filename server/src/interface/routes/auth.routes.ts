import express from "express";
import * as controller from "../controllers/auth.controller.ts";
import { authenticate } from "@/middleware/auth.middleware.ts";

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/verify-otp", controller.verify);
router.get("/profile", authenticate, controller.getProfile);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/resend-otp", controller.resendOtp);

export default router;