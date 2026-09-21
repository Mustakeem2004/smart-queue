import express from "express";
import {
    createQueue,
    getQueues,
    getQueueById,
    closeQueue,
    joinQueue,
    nextPatient,
    completePatient,
    skipPatient,
    getDoctorQueue,
    doctorNextPatient,
    doctorCompletePatient,
    doctorSkipPatient,
    rotateDoctorAccessToken
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



router.get(
    "/doctor/:token",
    doctorRateLimit,
    getDoctorQueue
);


router.post(
    "/doctor/:token/next",
    doctorRateLimit,
    doctorNextPatient
);

router.patch(
    "/doctor/:token/complete/:visitId",
    doctorRateLimit,
    doctorCompletePatient
);

router.patch(
    "/doctor/:token/skip/:visitId",
    doctorRateLimit,
    doctorSkipPatient
);


router.patch(
    "/:queueId/doctor-token/rotate",
    protect,
    authorize(
        "PLATFORM_ADMIN",
        "HOSPITAL_ADMIN",
        "RECEPTIONIST"
    ),
    rotateDoctorAccessToken
);

export default router;