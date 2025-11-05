import { supabase } from "../utils/supabase.js";

export const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if user is admin
    if (userRole !== "admin") {
      // Double-check in database
      const { data: user } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!user || user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify admin access",
    });
  }
};
