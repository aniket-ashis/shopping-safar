import { supabase } from "../utils/supabase.js";

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

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

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: category, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create category (Admin only)
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, slug } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const categorySlug = slug || generateSlug(name);

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category with this slug already exists",
      });
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert([
        {
          name,
          description: description || null,
          slug: categorySlug,
          image: image || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update category (Admin only)
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, slug } = req.body;

    // Check if category exists
    const { data: existing } = await supabase
      .from("categories")
      .select("id, name")
      .eq("id", id)
      .single();

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const categorySlug = slug || (name ? generateSlug(name) : existing.slug);

    // Check if slug is being changed and if new slug exists
    if (slug || name) {
      const { data: slugExists } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .neq("id", id)
        .single();

      if (slugExists) {
        return res.status(400).json({
          success: false,
          message: "Category with this slug already exists",
        });
      }
    }

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        slug: categorySlug,
        image: image !== undefined ? image : undefined,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is in use
    const { data: productsUsing } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (productsUsing && productsUsing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category. It is being used by products.",
      });
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
