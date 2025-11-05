import { supabase } from "../utils/supabase.js";

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const { data: brands, error } = await supabase
      .from("brands")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      data: brands || [],
    });
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: brand, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.json({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error("Get brand error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brand",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create brand (Admin only)
export const createBrand = async (req, res) => {
  try {
    const { name, description, logo, website } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
    }

    const { data: brand, error } = await supabase
      .from("brands")
      .insert([
        {
          name,
          description: description || null,
          logo: logo || null,
          website: website || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Create brand error:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: "Brand name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update brand (Admin only)
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logo, website } = req.body;

    // Check if brand exists
    const { data: existing } = await supabase
      .from("brands")
      .select("id")
      .eq("id", id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    const { data: brand, error } = await supabase
      .from("brands")
      .update({
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        logo: logo !== undefined ? logo : undefined,
        website: website !== undefined ? website : undefined,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Brand updated successfully",
      data: brand,
    });
  } catch (error) {
    console.error("Update brand error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete brand (Admin only)
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand is in use
    const { data: productsUsing } = await supabase
      .from("products")
      .select("id")
      .eq("brand_id", id)
      .limit(1);

    if (productsUsing && productsUsing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete brand. It is being used by products.",
      });
    }

    const { error } = await supabase.from("brands").delete().eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
