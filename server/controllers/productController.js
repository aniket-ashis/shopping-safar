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

    res.json({
      success: true,
      data: products || [],
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

    res.json({
      success: true,
      data: product,
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
