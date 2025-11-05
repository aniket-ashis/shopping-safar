import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate); // All cart routes require authentication

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:itemId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
