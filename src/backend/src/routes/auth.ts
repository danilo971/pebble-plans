import { Router } from "express";
import { register, login, refreshToken, getProfile, updateProfile, logout } from "../controllers/auth-controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);
router.post("/logout", logout);

export default router;
