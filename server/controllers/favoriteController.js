import { supabase } from "../utils/supabase.js";

// Get user's favorites
export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: favorites, error } = await supabase
      .from("favorites")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: favorites || [],
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch favorites",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Add to favorites
export const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return res.json({
        success: true,
        message: "Product already in favorites",
        data: existing,
      });
    }

    const { data: favorite, error } = await supabase
      .from("favorites")
      .insert([
        {
          user_id: userId,
          product_id: productId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: favorite,
    });
  } catch (error) {
    console.error("Add to favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Remove from favorites
export const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove from favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from favorites",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check if product is favorited
export const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const { data: favorite, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
      },
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check favorite status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
