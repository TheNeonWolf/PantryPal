import express from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    getMe
} from "../controllers/auth.controllers.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);
router.get("/me", protect, getMe);

export default router;