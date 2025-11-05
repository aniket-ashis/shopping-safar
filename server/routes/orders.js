import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/orderController.js";
import {
  getAllOrders,
  getOrderByIdAdmin,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/adminOrderController.js";
import { authenticate, optionalAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// Order creation allows optional auth (for guest checkout)
router.post("/", optionalAuth, createOrder);

// Getting orders requires authentication (user's own orders)
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrderById);

// Admin routes (require admin role)
router.get("/admin/all", authenticate, requireAdmin, getAllOrders);
router.get("/admin/:id", authenticate, requireAdmin, getOrderByIdAdmin);
router.put("/admin/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.put("/admin/:id/cancel", authenticate, requireAdmin, cancelOrder);

export default router;
