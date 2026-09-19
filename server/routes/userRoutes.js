import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createUser
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);

router.get("/profile", protect, (req, res) => {
    res.json({
        message: "Authenticated successfully",
        user: req.user
    });
});

export default router;