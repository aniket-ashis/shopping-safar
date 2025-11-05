import {
  uploadProductMainImage,
  uploadVariantImage,
  getImageUrl,
  deleteImageFile,
} from "../utils/upload.js";
import { supabase } from "../utils/supabase.js";

// Upload product main image
export const uploadProductMain = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { productId } = req.params;
    const imageUrl = getImageUrl(productId, null, req.file.filename, false);

    // Update product with image URL
    if (productId && productId !== "temp") {
      await supabase
        .from("products")
        .update({ main_image: imageUrl })
        .eq("id", productId);
    }

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error("Upload product main image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Upload variant image
export const uploadVariantImg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { productId, variantId } = req.params;
    const imageUrl = getImageUrl(productId, variantId, req.file.filename, true);

    // Save image URL to database if variant exists
    if (variantId && variantId !== "temp") {
      const { data: existingImage } = await supabase
        .from("product_variant_images")
        .select("id")
        .eq("variant_id", variantId)
        .eq("is_primary", true)
        .single();

      const isPrimary = !existingImage;

      await supabase.from("product_variant_images").insert([
        {
          variant_id: variantId,
          image_url: imageUrl,
          is_primary: isPrimary,
          display_order: 0,
        },
      ]);
    }

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error("Upload variant image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete image
export const deleteImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required",
      });
    }

    // Delete from database if it's a variant image
    if (imageUrl.includes("/variants/")) {
      await supabase
        .from("product_variant_images")
        .delete()
        .eq("image_url", imageUrl);
    }

    // Delete file from filesystem
    const deleted = deleteImageFile(imageUrl);

    if (!deleted) {
      console.warn(`Image file not found: ${imageUrl}`);
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete variant image by ID
export const deleteVariantImageById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get image record
    const { data: image, error: fetchError } = await supabase
      .from("product_variant_images")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete from database
    await supabase.from("product_variant_images").delete().eq("id", id);

    // Delete file from filesystem
    deleteImageFile(image.image_url);

    res.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete variant image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
