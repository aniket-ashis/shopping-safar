import express from "express";
import { authenticate } from "../middleware/auth.js";
import { supabase } from "../utils/supabase.js";

const router = express.Router();

router.use(authenticate);

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .eq("id", req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    const { name, email } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .update({ name, email })
      .eq("id", req.user.userId)
      .select("id, name, email, role")
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
