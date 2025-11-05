import express from "express";
import { authenticate } from "../middleware/auth.js";
import { supabase } from "../utils/supabase.js";

const router = express.Router();

router.use(authenticate);

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users return basic info
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.json({
        success: true,
        data: {
          id: userId,
          name: "Guest",
          email: null,
          phone: null,
          role: "guest",
        },
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, phone, role, created_at")
      .eq("id", userId)
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
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users cannot update profile
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register to update your profile",
      });
    }

    const { name, email, phone } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .update({ name, email, phone })
      .eq("id", userId)
      .select("id, name, email, phone, role")
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

// Get user addresses
router.get("/addresses", async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users don't have addresses
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const { data: addresses, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: addresses || [],
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Add new address
router.post("/addresses", async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users cannot add addresses
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register to add addresses",
      });
    }

    const { name, phone, street, city, state, zip, country, isDefault } =
      req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    const { data: address, error } = await supabase
      .from("user_addresses")
      .insert([
        {
          user_id: userId,
          name: name || null,
          phone: phone || null,
          street,
          city,
          state,
          zip,
          country: country || "United States",
          is_default: isDefault || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      data: address,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Update address
router.put("/addresses/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;

    // Guest users cannot update addresses
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register to manage addresses",
      });
    }

    // Verify address belongs to user
    const { data: existingAddress } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const { name, phone, street, city, state, zip, country, isDefault } =
      req.body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", userId)
        .neq("id", id);
    }

    const { data: address, error } = await supabase
      .from("user_addresses")
      .update({
        name: name || null,
        phone: phone || null,
        street,
        city,
        state,
        zip,
        country: country || "United States",
        is_default: isDefault || false,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    res.json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Delete address
router.delete("/addresses/:id", async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;

    // Guest users cannot delete addresses
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register to manage addresses",
      });
    }

    // Verify address belongs to user
    const { data: existingAddress } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Set default address
router.put("/addresses/:id/set-default", async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { id } = req.params;

    // Guest users cannot set default addresses
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register to manage addresses",
      });
    }

    // Verify address belongs to user
    const { data: existingAddress } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Unset all other defaults
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    // Set this address as default
    const { data: address, error } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Default address updated",
      data: address,
    });
  } catch (error) {
    console.error("Set default address error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set default address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
