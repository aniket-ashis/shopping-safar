import { supabase } from "../utils/supabase.js";

// Get variants for a product
export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: variants, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("is_default", { ascending: false });

    if (error) throw error;

    // Get images for each variant
    const variantsWithImages = await Promise.all(
      (variants || []).map(async (variant) => {
        const { data: images } = await supabase
          .from("product_variant_images")
          .select("*")
          .eq("variant_id", variant.id)
          .order("is_primary", { ascending: false })
          .order("display_order", { ascending: true });

        return {
          ...variant,
          images: images || [],
        };
      })
    );

    res.json({
      success: true,
      data: variantsWithImages,
    });
  } catch (error) {
    console.error("Get variants error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch variants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get single variant by ID
export const getVariantById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: variant, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // Get images
    const { data: images } = await supabase
      .from("product_variant_images")
      .select("*")
      .eq("variant_id", id)
      .order("is_primary", { ascending: false })
      .order("display_order", { ascending: true });

    res.json({
      success: true,
      data: {
        ...variant,
        images: images || [],
      },
    });
  } catch (error) {
    console.error("Get variant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch variant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create variant (Admin only)
export const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, sku, price, stock, attributes, isDefault, images } = req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("product_variants")
        .update({ is_default: false })
        .eq("product_id", productId);
    }

    const { data: variant, error } = await supabase
      .from("product_variants")
      .insert([
        {
          product_id: productId,
          name,
          sku,
          price,
          stock,
          attributes: attributes || {},
          is_default: isDefault || false,
          is_active: true, // New variants are active by default
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Add images if provided
    if (images && images.length > 0) {
      const imageRecords = images.map((img, index) => ({
        variant_id: variant.id,
        image_url: img.url,
        is_primary: index === 0,
        display_order: index,
      }));

      await supabase.from("product_variant_images").insert(imageRecords);
    }

    res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Create variant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create variant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update variant (Admin only)
export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, stock, attributes, isDefault, images } = req.body;

    // Get variant to check product_id
    const { data: existingVariant } = await supabase
      .from("product_variants")
      .select("product_id")
      .eq("id", id)
      .single();

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("product_variants")
        .update({ is_default: false })
        .eq("product_id", existingVariant.product_id)
        .neq("id", id);
    }

    const { data: variant, error } = await supabase
      .from("product_variants")
      .update({
        name,
        sku,
        price,
        stock,
        attributes: attributes || {},
        is_default: isDefault || false,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await supabase
        .from("product_variant_images")
        .delete()
        .eq("variant_id", id);

      // Insert new images
      if (images.length > 0) {
        const imageRecords = images.map((img, index) => ({
          variant_id: id,
          image_url: img.url,
          is_primary: index === 0,
          display_order: index,
        }));

        await supabase.from("product_variant_images").insert(imageRecords);
      }
    }

    res.json({
      success: true,
      message: "Variant updated successfully",
      data: variant,
    });
  } catch (error) {
    console.error("Update variant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update variant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete variant (Admin only)
// Admin: Toggle variant active status
export const toggleVariantActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Variant ID is required",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value",
      });
    }

    // Check if variant exists
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id, name, product_id")
      .eq("id", id)
      .single();

    if (variantError || !variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    // Check if product is active - cannot activate variant if product is inactive
    if (is_active) {
      const { data: product } = await supabase
        .from("products")
        .select("is_active")
        .eq("id", variant.product_id)
        .single();

      if (product && product.is_active === false) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot activate variant. Product is inactive. Please activate the product first.",
        });
      }
    }

    // Update active status
    const { data: updatedVariant, error } = await supabase
      .from("product_variants")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `Variant ${
        is_active ? "activated" : "deactivated"
      } successfully`,
      data: updatedVariant,
    });
  } catch (error) {
    console.error("Toggle variant active error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle variant active status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Variant deleted successfully",
    });
  } catch (error) {
    console.error("Delete variant error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete variant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
