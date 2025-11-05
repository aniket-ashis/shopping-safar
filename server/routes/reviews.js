import express from "express";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { optionalAuth } from "../middleware/auth.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Public route
router.get("/product/:productId", optionalAuth, getProductReviews);

// Authenticated routes
router.post("/product/:productId", authenticate, createReview);
router.put("/:id", authenticate, updateReview);
router.delete("/:id", authenticate, deleteReview);

export default router;
