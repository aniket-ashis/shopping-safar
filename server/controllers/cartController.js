import { supabase } from "../utils/supabase.js";
import {
  validateQuantity,
  validatePrice,
  fetchVariantImages,
} from "../utils/validation.js";

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

    // Filter out unavailable items and track which ones were removed
    const availableItems = [];
    const removedItems = [];

    for (const item of cartItems || []) {
      // Check if product exists and is active
      if (!item.product || item.product.is_active === false) {
        removedItems.push({
          itemId: item.id,
          reason: item.product
            ? "Product is currently unavailable"
            : "Product no longer exists",
        });
        // Remove the item from cart
        await supabase.from("cart_items").delete().eq("id", item.id);
        continue;
      }

      // If variant exists, check if it's active and has stock
      if (item.variant_id) {
        if (!item.variant || item.variant.is_active === false) {
          removedItems.push({
            itemId: item.id,
            reason: item.variant
              ? "Variant is currently unavailable"
              : "Variant no longer exists",
          });
          await supabase.from("cart_items").delete().eq("id", item.id);
          continue;
        }

        // Check if stock is sufficient
        if (item.variant.stock < item.quantity) {
          // Adjust quantity to available stock instead of removing
          if (item.variant.stock <= 0) {
            removedItems.push({
              itemId: item.id,
              reason: "Out of stock",
            });
            await supabase.from("cart_items").delete().eq("id", item.id);
            continue;
          } else {
            // Update quantity to match available stock
            await supabase
              .from("cart_items")
              .update({ quantity: item.variant.stock })
              .eq("id", item.id);
            item.quantity = item.variant.stock;
          }
        }
      }

      availableItems.push(item);
    }

    // Fetch variant images for available cart items
    const cartItemsWithImages = await fetchVariantImages(
      supabase,
      availableItems
    );

    res.json({
      success: true,
      items: cartItemsWithImages,
      ...(removedItems.length > 0 && {
        message: `${removedItems.length} item(s) were removed from your cart due to availability changes.`,
        removedItems,
      }),
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

    // Validate quantity
    const quantityValidation = validateQuantity(quantity);
    if (!quantityValidation.valid) {
      return res.status(400).json({
        success: false,
        message: quantityValidation.error,
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, base_price, is_active")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Product lookup error:", {
        productId,
        error: productError,
        productFound: !!product,
      });
      return res.status(404).json({
        success: false,
        message: "Product not found or no longer available",
        ...(process.env.NODE_ENV === "development" && {
          debug: {
            productId,
            error: productError?.message,
          },
        }),
      });
    }

    // Check if product is active
    if (product.is_active === false) {
      return res.status(400).json({
        success: false,
        message: "This product is currently unavailable",
      });
    }

    let maxStock = null;
    let variantData = null;

    // If variantId provided, verify it exists and belongs to product
    if (variantId) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("id, stock, price, product_id, is_active")
        .eq("id", variantId)
        .eq("product_id", productId)
        .single();

      if (variantError || !variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found or does not belong to this product",
        });
      }

      variantData = variant;
      maxStock = variant.stock;

      // Check if variant is active
      if (variant.is_active === false) {
        return res.status(400).json({
          success: false,
          message: "This variant is currently unavailable",
        });
      }

      // Validate quantity against stock
      const stockValidation = validateQuantity(quantity, maxStock);
      if (!stockValidation.valid) {
        return res.status(400).json({
          success: false,
          message: stockValidation.error,
        });
      }

      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Only ${variant.stock} available.`,
        });
      }
    } else {
      // Check product stock if no variant (assuming product has stock field)
      // For products without variants, we might need to check a stock field
      // This is a placeholder - adjust based on your schema
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
      // Check stock before updating quantity
      const newQuantity = existingItem.quantity + quantity;
      if (maxStock !== null && newQuantity > maxStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Only ${maxStock} available in stock.`,
        });
      }

      // Update quantity
      const { data: updatedItem, error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id)
        .select(
          `
          *,
          product:products(*),
          variant:product_variants(*)
        `
        )
        .single();

      if (error) throw error;

      // Get all cart items with variant images
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

      const cartItemsWithImages = await fetchVariantImages(
        supabase,
        cartItems || []
      );

      return res.json({
        success: true,
        message: "Item updated in cart",
        items: cartItemsWithImages,
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
          quantity: quantityValidation.value,
        },
      ])
      .select(
        `
        *,
        product:products(*),
        variant:product_variants(*)
      `
      )
      .single();

    if (error) {
      console.error("Error adding item to cart:", error);
      throw error;
    }

    // Get all cart items with variant images
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

    const cartItemsWithImages = await fetchVariantImages(
      supabase,
      cartItems || []
    );

    res.json({
      success: true,
      message: "Item added to cart",
      items: cartItemsWithImages,
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

    // Validate quantity
    const quantityValidation = validateQuantity(quantity);
    if (!quantityValidation.valid) {
      return res.status(400).json({
        success: false,
        message: quantityValidation.error,
      });
    }

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required",
      });
    }

    // Verify item belongs to user and get variant info
    const { data: item, error: itemError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        variant_id,
        variant:product_variants(stock)
      `
      )
      .eq("id", itemId)
      .eq("user_id", userId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found or does not belong to you",
      });
    }

    // Check stock if variant exists
    if (item.variant_id && item.variant) {
      // Check if variant is still active
      if (item.variant.is_active === false) {
        return res.status(400).json({
          success: false,
          message:
            "This variant is no longer available. Please remove it from your cart.",
        });
      }

      const maxStock = item.variant.stock;
      const stockValidation = validateQuantity(quantity, maxStock);
      if (!stockValidation.valid) {
        return res.status(400).json({
          success: false,
          message: stockValidation.error,
        });
      }
    }

    // Update quantity
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: quantityValidation.value })
      .eq("id", itemId);

    if (error) throw error;

    // Get all cart items with variant images
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

    const cartItemsWithImages = await fetchVariantImages(
      supabase,
      cartItems || []
    );

    res.json({
      success: true,
      message: "Cart item updated",
      items: cartItemsWithImages,
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

    // Get all cart items with variant images
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

    const cartItemsWithImages = await fetchVariantImages(
      supabase,
      cartItems || []
    );

    res.json({
      success: true,
      message: "Item removed from cart",
      items: cartItemsWithImages,
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
