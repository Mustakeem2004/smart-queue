import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deactivateDoctor,
} from "../controllers/doctorController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("PLATFORM_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  createDoctor,
);

router.get(
  "/",
  protect,
  authorize("PLATFORM_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  getDoctors,
);

router.get(
  "/:id",
  protect,
  authorize("PLATFORM_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  getDoctorById,
);

router.patch(
  "/:id",
  protect,
  authorize("PLATFORM_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  updateDoctor,
);

router.patch(
  "/:id/deactivate",
  protect,
  authorize("PLATFORM_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  deactivateDoctor,
);

export default router;
