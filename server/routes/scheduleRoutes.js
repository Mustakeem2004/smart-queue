import express from "express";

import {
    createSchedule,
    getSchedules,
    getScheduleById,
    updateSchedule,
    deactivateSchedule,
    activateSchedule
} from "../controllers/scheduleController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    createSchedule
);

router.get(
    "/",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    getSchedules
);


router.get(
    "/:id",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    getScheduleById
);


router.patch(
    "/:id",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN"
    ),
    updateSchedule
);


router.patch(
    "/:id/deactivate",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN"
    ),
    deactivateSchedule
);


router.patch(
    "/:id/activate",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN"
    ),
    activateSchedule
);

export default router;