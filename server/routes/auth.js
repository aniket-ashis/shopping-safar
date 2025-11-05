import express from "express";
import {
  register,
  login,
  guestLogin,
  logout,
  verify,
} from "../controllers/authController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/guest", guestLogin);
router.post("/logout", authenticate, logout);
router.get("/verify", authenticate, verify);

export default router;
