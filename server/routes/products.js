import express from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductActive,
} from "../controllers/productController.js";
import { optionalAuth } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// Public routes
router.get("/", optionalAuth, getProducts);
router.get("/categories", getCategories);
router.get("/:id", optionalAuth, getProductById);

// Admin routes
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.put(
  "/:id/toggle-active",
  authenticate,
  requireAdmin,
  toggleProductActive
);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;
