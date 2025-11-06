import { supabase } from "../utils/supabase.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import {
  sendAccountCredentialsEmail,
  sendOrderConfirmationEmail,
} from "../utils/email.js";
import {
  validateShippingAddress,
  validatePaymentMethod,
  validateQuantity,
  validatePrice,
} from "../utils/validation.js";
import crypto from "crypto";

/**
 * Generate a secure random password for guest users
 */
const generateRandomPassword = () => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const randomBytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  return password;
};

export const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, ...shippingInfo } = req.body;
    const isGuest = !req.user; // No user means guest
    let userId = req.user?.userId;

    // Validate cart is not empty
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Validate shipping address
    const addressValidation = validateShippingAddress(shippingInfo);
    if (!addressValidation.valid) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipping information",
        errors: addressValidation.errors,
      });
    }

    // Validate payment method
    const paymentValidation = validatePaymentMethod(
      paymentMethod || "cash_on_delivery"
    );
    if (!paymentValidation.valid) {
      return res.status(400).json({
        success: false,
        message: paymentValidation.error,
      });
    }

    // Guest user flow: create account first
    if (isGuest) {
      const { email, fullName } = shippingInfo;

      // Check if email already exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (userCheckError && userCheckError.code !== "PGRST116") {
        // PGRST116 is "not found" - that's OK
        console.error("Error checking existing user:", userCheckError);
        return res.status(500).json({
          success: false,
          message: "Failed to verify account. Please try again.",
        });
      }

      if (existingUser) {
        // User exists, use existing user ID
        userId = existingUser.id;
      } else {
        // Create new account for guest
        let generatedPassword;
        try {
          generatedPassword = generateRandomPassword();
        } catch (error) {
          console.error("Error generating password:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to create account. Please try again.",
          });
        }

        let hashedPassword;
        try {
          hashedPassword = await bcrypt.hash(generatedPassword, 10);
        } catch (error) {
          console.error("Error hashing password:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to create account. Please try again.",
          });
        }

        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert([
            {
              name: (fullName || email.split("@")[0]).trim(),
              email: email.trim().toLowerCase(),
              password: hashedPassword,
              role: "customer",
            },
          ])
          .select()
          .single();

        if (userError) {
          console.error("Error creating guest user:", userError);
          // Handle duplicate email error
          if (
            userError.code === "23505" ||
            userError.message?.includes("unique")
          ) {
            // Email already exists, try to fetch it
            const { data: existingUserRetry } = await supabase
              .from("users")
              .select("id, email")
              .eq("email", email.trim().toLowerCase())
              .single();

            if (existingUserRetry) {
              userId = existingUserRetry.id;
            } else {
              return res.status(500).json({
                success: false,
                message: "Account already exists. Please login to continue.",
              });
            }
          } else {
            return res.status(500).json({
              success: false,
              message: "Failed to create account. Please try again.",
              error:
                process.env.NODE_ENV === "development"
                  ? userError.message
                  : undefined,
            });
          }
        } else {
          userId = newUser.id;

          // Send account credentials email (sequential - must complete before order)
          // Don't fail order creation if email fails
          try {
            const emailResult = await sendAccountCredentialsEmail(
              email,
              generatedPassword
            );

            if (!emailResult.success) {
              console.warn(
                "Failed to send account credentials email:",
                emailResult
              );
              // Continue with order creation even if email fails
            }
          } catch (emailError) {
            console.error(
              "Error sending account credentials email:",
              emailError
            );
            // Continue with order creation even if email fails
          }
        }
      }
    }

    // Validate and re-fetch all items to ensure they still exist and get current prices/stock
    const validatedItems = [];
    const itemErrors = [];

    for (const item of items) {
      const productId = item.product?.id || item.product_id;
      const variantId = item.variant?.id || item.variant_id || null;
      const quantity = item.quantity;

      if (!productId) {
        itemErrors.push("One or more products are missing");
        continue;
      }

      // Validate quantity
      const quantityValidation = validateQuantity(quantity);
      if (!quantityValidation.valid) {
        itemErrors.push(`Invalid quantity for product ${productId}`);
        continue;
      }

      // Fetch current product data
      const { data: currentProduct, error: productError } = await supabase
        .from("products")
        .select("id, name, base_price, is_active")
        .eq("id", productId)
        .single();

      if (productError || !currentProduct) {
        console.error("Product lookup error in order validation:", {
          productId,
          error: productError,
        });
        itemErrors.push(`Product ${productId} no longer available`);
        continue;
      }

      // Check if product is active
      if (currentProduct.is_active === false) {
        itemErrors.push(
          `Product "${currentProduct.name}" is currently unavailable`
        );
        continue;
      }

      let currentVariant = null;
      let itemPrice = currentProduct.base_price || 0;
      let availableStock = null;

      // Fetch variant if provided
      if (variantId) {
        const { data: variant, error: variantError } = await supabase
          .from("product_variants")
          .select("id, name, price, stock, product_id, is_active")
          .eq("id", variantId)
          .eq("product_id", productId)
          .single();

        if (variantError || !variant) {
          console.error("Variant lookup error in order validation:", {
            variantId,
            productId,
            error: variantError,
          });
          itemErrors.push(
            `Variant "${variantId}" no longer available for product "${currentProduct.name}"`
          );
          continue;
        }

        // Check if variant is active
        if (variant.is_active === false) {
          itemErrors.push(
            `Variant "${variant.name || variantId}" for product "${currentProduct.name}" is currently unavailable`
          );
          continue;
        }

        currentVariant = variant;
        itemPrice = variant.price || itemPrice;
        availableStock = variant.stock;

        // Check stock availability
        if (availableStock < quantity) {
          itemErrors.push(
            `Insufficient stock for "${currentProduct.name}"${
              variant.name ? ` (${variant.name})` : ""
            }. Only ${availableStock} available, but ${quantity} requested.`
          );
          continue;
        }
      }

      validatedItems.push({
        product: currentProduct,
        variant: currentVariant,
        product_id: productId,
        variant_id: variantId,
        variant_name: currentVariant?.name || null,
        quantity: quantityValidation.value,
        price: itemPrice,
        availableStock,
      });
    }

    // If any items failed validation, return error
    if (itemErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Some items are no longer available or have insufficient stock",
        errors: itemErrors,
        unavailableItems: itemErrors,
      });
    }

    // Re-calculate total from current prices
    const calculatedTotal = validatedItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // Validate calculated total matches submitted total (allow 1% variance for rounding)
    const submittedTotal = total || 0;
    const variance = Math.abs(calculatedTotal - submittedTotal);
    const variancePercent =
      submittedTotal > 0 ? (variance / submittedTotal) * 100 : 0;

    if (variancePercent > 1) {
      return res.status(400).json({
        success: false,
        message:
          "Order total has changed. Please review your cart and try again.",
        calculatedTotal,
        submittedTotal,
      });
    }

    // Check for duplicate orders (same items, same user, within last 30 seconds)
    if (userId) {
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("id, created_at")
        .eq("user_id", userId)
        .gte("created_at", thirtySecondsAgo)
        .order("created_at", { ascending: false })
        .limit(1);

      if (recentOrders && recentOrders.length > 0) {
        // Check if recent order has same items count
        const { data: recentOrderItems } = await supabase
          .from("order_items")
          .select("id")
          .eq("order_id", recentOrders[0].id);

        if (
          recentOrderItems &&
          recentOrderItems.length === validatedItems.length
        ) {
          return res.status(409).json({
            success: false,
            message:
              "Duplicate order detected. Your order may have already been placed.",
            orderId: recentOrders[0].id,
          });
        }
      }
    }

    // Create order
    // Note: If payment_method column doesn't exist in your database,
    // run the migration script: server/database-migration-add-payment-method.sql
    const orderData = {
      user_id: userId,
      total: calculatedTotal,
      status: "pending",
      shipping_address: shippingInfo.address,
      shipping_city: shippingInfo.city,
      shipping_state: shippingInfo.state,
      shipping_zip: shippingInfo.zip,
      shipping_name: shippingInfo.fullName || shippingInfo.name,
      shipping_email: shippingInfo.email,
      shipping_phone: shippingInfo.phone,
    };

    // Try to insert with payment_method first
    // If it fails due to missing column, try without it
    const paymentMethodValue = paymentMethod || "cash_on_delivery";

    let order;
    let orderError;

    // Try inserting with payment_method
    const { data: orderWithPayment, error: errorWithPayment } = await supabase
      .from("orders")
      .insert([
        {
          ...orderData,
          payment_method: paymentMethodValue,
        },
      ])
      .select()
      .single();

    if (
      errorWithPayment &&
      errorWithPayment.message?.includes("payment_method")
    ) {
      // Column doesn't exist, try without payment_method
      console.warn(
        "payment_method column not found. Inserting without it. Please run migration script."
      );
      const { data: orderWithoutPayment, error: errorWithoutPayment } =
        await supabase.from("orders").insert([orderData]).select().single();

      order = orderWithoutPayment;
      orderError = errorWithoutPayment;
    } else {
      order = orderWithPayment;
      orderError = errorWithPayment;
    }

    if (orderError) throw orderError;

    // Create order items with validated data
    const orderItems = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      variant_name: item.variant_name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      // Try to delete the order if items creation fails
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    // Update stock for variants (reduce stock)
    for (const item of validatedItems) {
      if (item.variant_id && item.availableStock !== null) {
        const newStock = item.availableStock - item.quantity;
        const { error: stockError } = await supabase
          .from("product_variants")
          .update({ stock: newStock })
          .eq("id", item.variant_id);

        if (stockError) {
          console.error(
            "Error updating stock for variant:",
            item.variant_id,
            stockError
          );
          // Log error but don't fail order - stock can be adjusted manually
        }
      }
    }

    // Clear cart if user is logged in (don't fail order if this fails)
    if (userId && !isGuest) {
      try {
        await supabase.from("cart_items").delete().eq("user_id", userId);
      } catch (cartError) {
        console.error("Error clearing cart after order:", cartError);
        // Don't fail order - cart can be cleared separately
      }
    }

    // Fetch full order with items for email
    const { data: fullOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `
      )
      .eq("id", order.id)
      .single();

    // Send order confirmation email (sequential - after order creation)
    // Don't fail order if email fails
    if (!fetchError && fullOrder) {
      try {
        const emailResult = await sendOrderConfirmationEmail(
          shippingInfo.email,
          fullOrder
        );

        if (!emailResult.success) {
          console.warn("Failed to send order confirmation email:", emailResult);
          // Continue even if email fails
        }
      } catch (emailError) {
        console.error("Error sending order confirmation email:", emailError);
        // Continue even if email fails - order is already created
      }
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      order: fullOrder || order,
      isGuest: isGuest,
      ...(isGuest && userId ? { userId } : {}),
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch variant images for each order item
    const ordersWithVariantImages = await Promise.all(
      (orders || []).map(async (order) => {
        if (order.order_items) {
          const itemsWithImages = await Promise.all(
            order.order_items.map(async (item) => {
              if (item.variant_id) {
                const { data: variantImages } = await supabase
                  .from("product_variant_images")
                  .select("*")
                  .eq("variant_id", item.variant_id)
                  .order("is_primary", { ascending: false })
                  .order("display_order", { ascending: true });

                return {
                  ...item,
                  variant: item.variant
                    ? {
                        ...item.variant,
                        images: variantImages || [],
                      }
                    : null,
                };
              }
              return item;
            })
          );
          return {
            ...order,
            order_items: itemsWithImages,
          };
        }
        return order;
      })
    );

    res.json({
      success: true,
      data: ordersWithVariantImages || [],
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          product:products(*),
          variant:product_variants(*)
        )
      `
      )
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Fetch variant images for order items
    if (order.order_items) {
      const itemsWithImages = await Promise.all(
        order.order_items.map(async (item) => {
          if (item.variant_id) {
            const { data: variantImages } = await supabase
              .from("product_variant_images")
              .select("*")
              .eq("variant_id", item.variant_id)
              .order("is_primary", { ascending: false })
              .order("display_order", { ascending: true });

            return {
              ...item,
              variant: item.variant
                ? {
                    ...item.variant,
                    images: variantImages || [],
                  }
                : null,
            };
          }
          return item;
        })
      );
      order.order_items = itemsWithImages;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
