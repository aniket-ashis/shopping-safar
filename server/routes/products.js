import express from "express";
import {
  getProducts,
  getProductById,
  getCategories,
} from "../controllers/productController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, getProducts);
router.get("/categories", getCategories);
router.get("/:id", optionalAuth, getProductById);

export default router;
