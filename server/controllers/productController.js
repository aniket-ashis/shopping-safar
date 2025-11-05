import { supabase } from "../utils/supabase.js";
import { validatePrice, validateStock } from "../utils/validation.js";

export const getProducts = async (req, res) => {
  try {
    let query = supabase.from("products").select(`
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, logo)
      `);

    // Filter by category if provided (supports both category_id and category name/slug)
    if (req.query.category) {
      // Try to find category by slug or name
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .or(`slug.eq.${req.query.category},name.ilike.%${req.query.category}%`)
        .single();

      if (category) {
        query = query.eq("category_id", category.id);
      }
    }

    // Search functionality
    if (req.query.search) {
      query = query.ilike("name", `%${req.query.search}%`);
    }

    const { data: products, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw error;
    }

    // Get variants for each product to calculate total stock
    const productsWithVariants = await Promise.all(
      (products || []).map(async (product) => {
        // Only get active variants for stock calculation, but include all variants for admin
        const { data: variants } = await supabase
          .from("product_variants")
          .select(
            "id, name, stock, price, sku, is_default, is_active, attributes"
          )
          .eq("product_id", product.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: true });

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

        // Calculate total stock only from active variants
        const activeVariants =
          variants?.filter((v) => v.is_active !== false) || [];
        const totalStock =
          activeVariants.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

        // Find default variant (prefer active default variant)
        const defaultVariant =
          activeVariants.find((v) => v.is_default) ||
          variants?.find((v) => v.is_default) ||
          activeVariants[0] ||
          variants?.[0];

        // Calculate min price from active variants only
        const minPrice = activeVariants.length
          ? Math.min(...activeVariants.map((v) => parseFloat(v.price)))
          : parseFloat(product.base_price);

        return {
          ...product,
          totalStock,
          variantCount: variants?.length || 0,
          activeVariantCount: activeVariants.length,
          minPrice,
          defaultVariantId: defaultVariant?.id,
          variants: variantsWithImages, // Include full variant data with images
          // Check if product is active (default to true if field doesn't exist)
          isActive: product.is_active !== false,
        };
      })
    );

    res.json({
      success: true,
      data: productsWithVariants,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:categories(id, name, slug),
        brand:brands(id, name, logo)
      `
      )
      .eq("id", id)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get variants with images
    const { data: variants, error: variantsError } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    if (variantsError) {
      console.error("Error fetching variants:", variantsError);
    }

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

    // Get reviews
    const { data: reviews } = await supabase
      .from("product_reviews")
      .select("*, users(name, email)")
      .eq("product_id", id)
      .order("created_at", { ascending: false });

    const avgRating =
      reviews?.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      data: {
        ...product,
        variants: variantsWithImages,
        reviews: reviews || [],
        averageRating: avgRating,
        reviewCount: reviews?.length || 0,
        isActive: product.is_active !== false,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Note: getCategories moved to categoryController.js
// This endpoint is kept for backward compatibility
export const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: categories || [],
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Admin: Create product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      base_price,
      category_id,
      brand_id,
      main_image,
      slug,
      meta_title,
      meta_description,
      meta_keywords,
    } = req.body;

    if (!name || !base_price) {
      return res.status(400).json({
        success: false,
        message: "Product name and base price are required",
      });
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Validate price
    if (base_price !== undefined && base_price !== null) {
      const priceValidation = validatePrice(base_price);
      if (!priceValidation.valid) {
        return res.status(400).json({
          success: false,
          message: priceValidation.error,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Product price is required",
      });
    }

    // Validate category if provided
    if (category_id) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .single();

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    // Validate brand if provided
    if (brand_id) {
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brand_id)
        .single();

      if (!brand) {
        return res.status(400).json({
          success: false,
          message: "Invalid brand ID",
        });
      }
    }

    const productSlug = slug || generateSlug(name);

    // Check if slug already exists
    const { data: existingSlug } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .maybeSingle();

    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists",
      });
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description: description || null,
          base_price,
          category_id: category_id || null,
          brand_id: brand_id || null,
          main_image: main_image || null,
          slug: productSlug,
          meta_title: meta_title || null,
          meta_description: meta_description || null,
          meta_keywords: meta_keywords || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Admin: Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      base_price,
      category_id,
      brand_id,
      main_image,
      slug,
      meta_title,
      meta_description,
      meta_keywords,
    } = req.body;

    // Check if product exists
    const { data: existing } = await supabase
      .from("products")
      .select("id, name, slug")
      .eq("id", id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Validate price if provided
    if (base_price !== undefined && base_price !== null) {
      const priceValidation = validatePrice(base_price);
      if (!priceValidation.valid) {
        return res.status(400).json({
          success: false,
          message: priceValidation.error,
        });
      }
    }

    // Validate category if provided
    if (category_id !== undefined && category_id !== null) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("id", category_id)
        .single();

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }
    }

    // Validate brand if provided
    if (brand_id !== undefined && brand_id !== null) {
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("id", brand_id)
        .single();

      if (!brand) {
        return res.status(400).json({
          success: false,
          message: "Invalid brand ID",
        });
      }
    }

    // Handle slug update
    let productSlug = slug || existing.slug;
    if (name && !slug) {
      productSlug = generateSlug(name);
    }

    // Check if slug is being changed and if new slug exists
    if (productSlug !== existing.slug) {
      const { data: slugExists } = await supabase
        .from("products")
        .select("id")
        .eq("slug", productSlug)
        .neq("id", id)
        .single();

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Product with this slug already exists",
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (category_id !== undefined) updateData.category_id = category_id;
    if (brand_id !== undefined) updateData.brand_id = brand_id;
    if (main_image !== undefined) updateData.main_image = main_image;
    if (productSlug) updateData.slug = productSlug;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined)
      updateData.meta_description = meta_description;
    if (meta_keywords !== undefined) updateData.meta_keywords = meta_keywords;

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Admin: Toggle product active status
export const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (typeof is_active !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "is_active must be a boolean value",
      });
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update active status
    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // If deactivating product, also deactivate all variants
    if (!is_active) {
      await supabase
        .from("product_variants")
        .update({ is_active: false })
        .eq("product_id", id);
    }

    res.json({
      success: true,
      message: `Product ${
        is_active ? "activated" : "deactivated"
      } successfully`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Toggle product active error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle product active status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Admin: Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", id)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if product has active orders (not cancelled)
    const { data: activeOrders } = await supabase
      .from("order_items")
      .select("order_id")
      .eq("product_id", id)
      .limit(1);

    if (activeOrders && activeOrders.length > 0) {
      // Check if any of these orders are not cancelled
      const orderIds = activeOrders.map((item) => item.order_id);
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status")
        .in("id", orderIds)
        .neq("status", "cancelled")
        .limit(1);

      if (orders && orders.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete product with active orders. Please cancel or complete all orders first.",
          activeOrdersCount: orders.length,
        });
      }
    }

    // Check if product is in any active carts
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (cartItems && cartItems.length > 0) {
      // Warn but allow deletion (carts will show error when user tries to checkout)
      console.warn(
        `Product ${id} is in ${cartItems.length} cart(s). Deleting anyway.`
      );
    }

    // Check if product has variants
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", id)
      .limit(1);

    if (variants && variants.length > 0) {
      // Delete variants first (cascade delete should handle this, but we'll do it explicitly)
      const { error: variantsError } = await supabase
        .from("product_variants")
        .delete()
        .eq("product_id", id);

      if (variantsError) {
        console.error("Error deleting product variants:", variantsError);
        return res.status(500).json({
          success: false,
          message: "Failed to delete product variants. Please try again.",
        });
      }
    }

    // Delete product
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      // Handle foreign key constraint errors
      if (error.code === "23503" || error.message?.includes("foreign key")) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete product. It is referenced by other records (orders, variants, etc.).",
        });
      }
      throw error;
    }

    // Log deletion (for audit trail)
    console.log(`Product ${id} (${product.name}) deleted by admin`);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
