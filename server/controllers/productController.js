import { supabase } from "../utils/supabase.js";

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
        const { data: variants } = await supabase
          .from("product_variants")
          .select("id, name, stock, price, sku, is_default, attributes")
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

        const totalStock =
          variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        const defaultVariant =
          variants?.find((v) => v.is_default) || variants?.[0];
        const minPrice = variants?.length
          ? Math.min(...variants.map((v) => parseFloat(v.price)))
          : parseFloat(product.base_price);

        return {
          ...product,
          totalStock,
          variantCount: variants?.length || 0,
          minPrice,
          defaultVariantId: defaultVariant?.id,
          variants: variantsWithImages, // Include full variant data with images
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

    const productSlug = slug || generateSlug(name);

    // Check if slug already exists
    const { data: existingSlug } = await supabase
      .from("products")
      .select("id")
      .eq("slug", productSlug)
      .single();

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

// Admin: Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;

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
