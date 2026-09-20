import express from "express";
import {
    createQueue,
    getQueues,
    getQueueById,
    closeQueue,
    joinQueue,
    nextPatient,
    completePatient,
    skipPatient
} from "../controllers/queueController.js";

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
    createQueue
);

router.get(
    "/",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    getQueues
);

router.get(
    "/:id",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    getQueueById
);


router.patch(
    "/:id/close",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    closeQueue
);


router.post(
    "/:queueId/join",
    joinQueue
);


router.post(
    "/:queueId/next",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    nextPatient
);


router.patch(
    "/:queueId/complete/:visitId",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    completePatient
);


router.patch(
    "/:queueId/skip/:visitId",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    skipPatient
);

export default router;