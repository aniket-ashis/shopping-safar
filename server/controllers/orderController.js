import { supabase } from "../utils/supabase.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";
import {
  sendAccountCredentialsEmail,
  sendOrderConfirmationEmail,
} from "../utils/email.js";
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

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Guest user flow: create account first
    if (isGuest) {
      const { email, fullName } = shippingInfo;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required for guest checkout",
        });
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email)
        .single();

      if (existingUser) {
        // User exists, use existing user ID
        userId = existingUser.id;
      } else {
        // Create new account for guest
        const generatedPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(generatedPassword, 10);

        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert([
            {
              name: fullName || email.split("@")[0],
              email,
              password: hashedPassword,
              role: "customer",
            },
          ])
          .select()
          .single();

        if (userError) {
          console.error("Error creating guest user:", userError);
          return res.status(500).json({
            success: false,
            message: "Failed to create account",
            error:
              process.env.NODE_ENV === "development"
                ? userError.message
                : undefined,
          });
        }

        userId = newUser.id;

        // Send account credentials email (sequential - must complete before order)
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
      }
    }

    // Calculate total from items if not provided
    let calculatedTotal = total;
    if (!calculatedTotal && items) {
      calculatedTotal = items.reduce((sum, item) => {
        const itemPrice =
          item.variant?.price ||
          item.product?.base_price ||
          item.product?.price ||
          0;
        return sum + itemPrice * item.quantity;
      }, 0);
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

    // Create order items with variant information
    const orderItems = items.map((item) => {
      const itemPrice =
        item.variant?.price ||
        item.product?.base_price ||
        item.product?.price ||
        0;
      return {
        order_id: order.id,
        product_id: item.product?.id || item.product_id,
        variant_id: item.variant?.id || item.variant_id || null,
        variant_name: item.variant?.name || null,
        quantity: item.quantity,
        price: itemPrice,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart if user is logged in
    if (userId && !isGuest) {
      await supabase.from("cart_items").delete().eq("user_id", userId);
    }

    // Fetch full order with items for email
    const { data: fullOrder, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          product:products(*)
        )
      `
      )
      .eq("id", order.id)
      .single();

    if (!fetchError && fullOrder) {
      // Send order confirmation email (sequential - after order creation)
      const emailResult = await sendOrderConfirmationEmail(
        shippingInfo.email,
        fullOrder
      );

      if (!emailResult.success) {
        console.warn("Failed to send order confirmation email:", emailResult);
        // Continue even if email fails
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
