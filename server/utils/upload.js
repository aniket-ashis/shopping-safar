import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create upload directories if they don't exist
const uploadsBaseDir = join(__dirname, "..", "public", "uploads");
const productsDir = join(uploadsBaseDir, "products");

// Ensure directories exist
const ensureDirectories = () => {
  if (!fs.existsSync(uploadsBaseDir)) {
    fs.mkdirSync(uploadsBaseDir, { recursive: true });
  }
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
};

ensureDirectories();

// Storage configuration for product main images
const productMainStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = req.params.productId || req.body.productId || "temp";
    const productDir = join(productsDir, productId, "main");

    // Create directory if it doesn't exist
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    cb(null, productDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-uuid-originalname
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 15);
    const ext = file.originalname.split(".").pop();
    const filename = `${timestamp}-${uuid}.${ext}`;
    cb(null, filename);
  },
});

// Storage configuration for variant images
const variantImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const productId = req.params.productId || req.body.productId || "temp";
    const variantId = req.params.variantId || req.body.variantId || "temp";
    const variantDir = join(productsDir, productId, "variants", variantId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(variantDir)) {
      fs.mkdirSync(variantDir, { recursive: true });
    }

    cb(null, variantDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-uuid-originalname
    const timestamp = Date.now();
    const uuid = Math.random().toString(36).substring(2, 15);
    const ext = file.originalname.split(".").pop();
    const filename = `${timestamp}-${uuid}.${ext}`;
    cb(null, filename);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer configuration for product main images
export const uploadProductMainImage = multer({
  storage: productMainStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Multer configuration for variant images
export const uploadVariantImage = multer({
  storage: variantImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to get image URL
export const getImageUrl = (
  productId,
  variantId,
  filename,
  isVariant = false
) => {
  if (isVariant && variantId) {
    return `/uploads/products/${productId}/variants/${variantId}/${filename}`;
  }
  return `/uploads/products/${productId}/main/${filename}`;
};

// Helper function to delete image file
export const deleteImageFile = (filePath) => {
  try {
    const fullPath = join(__dirname, "..", "public", filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting image file:", error);
    return false;
  }
};

// Helper function to delete directory and all contents
export const deleteDirectory = (dirPath) => {
  try {
    const fullPath = join(__dirname, "..", "public", dirPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting directory:", error);
    return false;
  }
};
