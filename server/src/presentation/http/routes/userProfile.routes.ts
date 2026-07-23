import express from "express";

import { authenticate } from "@/middleware/auth.middleware.ts";

import { userProfileController } from "@/setup/container/userProfile/controllers.ts";

import {
    ROUTE_PROFILE_BASE,
} from "./routes.constants.ts";

const router = express.Router();



router.post(
    ROUTE_PROFILE_BASE,
    authenticate,
    userProfileController.createProfile
);

router.get(
    ROUTE_PROFILE_BASE,
    authenticate,
    userProfileController.getProfile
);

router.put(
    ROUTE_PROFILE_BASE,
    authenticate,
    userProfileController.updateProfile
);


export default router;