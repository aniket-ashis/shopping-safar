import { supabase } from "../utils/supabase.js";

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select("*, users(id, name, email)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate average rating
    const avgRating =
      reviews?.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      data: {
        reviews: reviews || [],
        averageRating: avgRating,
        totalReviews: reviews?.length || 0,
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create review
export const createReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user already reviewed
    const { data: existing } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const { data: review, error } = await supabase
      .from("product_reviews")
      .insert([
        {
          product_id: productId,
          user_id: userId,
          rating,
          title: title || null,
          comment: comment || null,
        },
      ])
      .select("*, users(id, name, email)")
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update review
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    // Verify review belongs to user
    const { data: existing } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const { data: review, error } = await supabase
      .from("product_reviews")
      .update({
        rating: rating || undefined,
        title: title !== undefined ? title : undefined,
        comment: comment !== undefined ? comment : undefined,
      })
      .eq("id", id)
      .select("*, users(id, name, email)")
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete review
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Verify review belongs to user
    const { data: existing } = await supabase
      .from("product_reviews")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const { error } = await supabase
      .from("product_reviews")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
