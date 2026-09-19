import express from "express";
import {
    createHospital
} from "../controllers/hospitalController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("PLATFORM_ADMIN"),
    createHospital
);

export default router;
