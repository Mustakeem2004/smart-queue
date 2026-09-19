import express from "express";
import {
    createShift,
    getShifts,
    getShiftById,
    updateShift,
    openShift,
    closeShift
} from "../controllers/shiftController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN"
    ),
    createShift
);


router.get(
    "/",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    getShifts
);

router.get(
    "/:id",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    getShiftById
);


router.patch(
    "/:id",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN"
    ),
    updateShift
);


router.patch(
    "/:id/open",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    openShift
);


router.patch(
    "/:id/close",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    closeShift
);

export default router;