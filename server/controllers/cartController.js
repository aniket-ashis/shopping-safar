import { supabase } from "../utils/supabase.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users don't have persistent carts - return empty cart
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.json({
        success: true,
        items: [],
      });
    }

    // Get cart items for user (only for registered users with UUID)
    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products(*),
        variant:product_variants(*)
      `
      )
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      items: cartItems || [],
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users cannot add to cart - they need to register
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register or login to add items to cart",
      });
    }

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    // Check if product exists
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If variantId provided, verify it exists and belongs to product
    if (variantId) {
      const { data: variant } = await supabase
        .from("product_variants")
        .select("id, stock")
        .eq("id", variantId)
        .eq("product_id", productId)
        .single();

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock",
        });
      }
    }

    // Check if item already in cart (same product and variant)
    const existingItemQuery = supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (variantId) {
      existingItemQuery.eq("variant_id", variantId);
    } else {
      existingItemQuery.is("variant_id", null);
    }

    const { data: existingItem, error: existingError } =
      await existingItemQuery.maybeSingle();

    if (existingItem && !existingError) {
      // Update quantity
      const { data: updatedItem, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select(
          `
          *,
          product:products(*)
        `
        )
        .single();

      if (error) throw error;

      // Get all cart items
      const { data: cartItems } = await supabase
        .from("cart_items")
        .select(
          `
          *,
          product:products(*),
          variant:product_variants(*)
        `
        )
        .eq("user_id", userId);

      return res.json({
        success: true,
        message: "Item updated in cart",
        items: cartItems || [],
      });
    }

    // Add new item
    const { data: newItem, error } = await supabase
      .from("cart_items")
      .insert([
        {
          user_id: userId,
          product_id: productId,
          variant_id: variantId || null,
          quantity,
        },
      ])
      .select(
        `
        *,
        product:products(*)
      `
      )
      .single();

    if (error) throw error;

    // Get all cart items
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq("user_id", userId);

    res.json({
      success: true,
      message: "Item added to cart",
      items: cartItems || [],
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users cannot update cart
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register or login to manage cart",
      });
    }

    if (!itemId || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Item ID and valid quantity are required",
      });
    }

    // Verify item belongs to user
    const { data: item } = await supabase
      .from("cart_items")
      .select("id")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) throw error;

    // Get all cart items
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq("user_id", userId);

    res.json({
      success: true,
      message: "Cart item updated",
      items: cartItems || [],
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users cannot remove from cart
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.status(401).json({
        success: false,
        message: "Please register or login to manage cart",
      });
    }

    // Verify item belongs to user
    const { data: item } = await supabase
      .from("cart_items")
      .select("id")
      .eq("id", itemId)
      .eq("user_id", userId)
      .single();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Delete item
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;

    // Get all cart items
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq("user_id", userId);

    res.json({
      success: true,
      message: "Item removed from cart",
      items: cartItems || [],
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Guest users cannot clear cart
    if (userRole === "guest" || userId.startsWith("guest_")) {
      return res.json({
        success: true,
        message: "Cart cleared",
        items: [],
      });
    }

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;

    res.json({
      success: true,
      message: "Cart cleared",
      items: [],
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
