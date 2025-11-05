import express from "express";
import {
  uploadProductMain,
  uploadVariantImg,
  deleteImage,
  deleteVariantImageById,
} from "../controllers/uploadController.js";
import { uploadProductMainImage, uploadVariantImage } from "../utils/upload.js";
import { authenticate } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";

const router = express.Router();

// All upload routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Upload product main image
router.post(
  "/product/:productId/main",
  uploadProductMainImage.single("image"),
  uploadProductMain
);

// Upload variant image
router.post(
  "/product/:productId/variant/:variantId",
  uploadVariantImage.single("image"),
  uploadVariantImg
);

// Delete image
router.delete("/image", deleteImage);

// Delete variant image by ID
router.delete("/variant-image/:id", deleteVariantImageById);

export default router;
