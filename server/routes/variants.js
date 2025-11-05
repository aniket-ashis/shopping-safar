import express from "express";
import {
  getVariantsByProduct,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
  toggleVariantActive,
} from "../controllers/variantController.js";
import { optionalAuth } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", optionalAuth, getVariantsByProduct);
router.get("/:id", optionalAuth, getVariantById);

// Admin routes
router.post("/product/:productId", authenticate, requireAdmin, createVariant);
router.put("/:id", authenticate, requireAdmin, updateVariant);
router.put(
  "/:id/toggle-active",
  authenticate,
  requireAdmin,
  toggleVariantActive
);
router.delete("/:id", authenticate, requireAdmin, deleteVariant);

export default router;
