import { supabase } from "../utils/supabase.js";

export const getProducts = async (req, res) => {
  try {
    let query = supabase.from("products").select("*");

    // Filter by category if provided
    if (req.query.category) {
      query = query.eq("category", req.query.category);
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
          .select("id, stock, price, is_default")
          .eq("product_id", product.id);

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
      .select("*")
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

// Admin: Create product
export const createProduct = async (req, res) => {
  try {
    const { name, description, base_price, category, brand, main_image } =
      req.body;

    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          base_price,
          category,
          brand,
          main_image,
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
    const { name, description, base_price, category, brand, main_image } =
      req.body;

    const { data: product, error } = await supabase
      .from("products")
      .update({
        name,
        description,
        base_price,
        category,
        brand,
        main_image,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

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
