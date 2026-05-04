import express from "express";
import * as controller from "../controllers/admin.controller.ts";
import { adminAuth } from "@/middleware/adminAuth.middleware.ts";

const router = express.Router();

// Public routes
router.post("/login", controller.login);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/resend-otp", controller.resendOtp);
router.post("/logout", controller.logout);

// Protected routes
router.use(adminAuth);

router.get("/users", controller.getUsers);
router.get("/merchants", controller.getMerchants);
router.patch("/merchants/:id/approve", controller.approveMerchant);
router.patch("/merchants/:id/reject", controller.rejectMerchant);
router.patch("/merchants/:id/block", controller.blockMerchant);
router.patch("/merchants/:id/unblock", controller.unblockMerchant);
router.patch("/users/:id/block", controller.blockUser);
router.patch("/users/:id/unblock", controller.unblockUser);

export default router;
