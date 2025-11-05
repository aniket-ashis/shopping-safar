import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../controllers/orderController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate); // All order routes require authentication

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);

export default router;
