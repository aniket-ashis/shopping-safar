import express from "express";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate); // All favorites routes require authentication

router.get("/", getFavorites);
router.post("/", addToFavorites);
router.get("/check/:productId", checkFavorite);
router.delete("/:productId", removeFromFavorites);

export default router;
