import express from "express";
import {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { optionalAuth } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.get("/", optionalAuth, getBrands);
router.get("/:id", optionalAuth, getBrandById);

// Admin routes
router.post("/", authenticate, requireAdmin, createBrand);
router.put("/:id", authenticate, requireAdmin, updateBrand);
router.delete("/:id", authenticate, requireAdmin, deleteBrand);

export default router;
