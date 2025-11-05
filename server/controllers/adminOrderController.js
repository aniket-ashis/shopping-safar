import { supabase } from "../utils/supabase.js";

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, email } = req.query;

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          product:products(*),
          variant:product_variants(*)
        ),
        user:users(id, name, email, phone)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    if (email) {
      // Get user IDs matching email
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .ilike("email", `%${email}%`);
      const userIds = users?.map((u) => u.id) || [];
      if (userIds.length > 0) {
        query = query.in("user_id", userIds);
      } else {
        // No matching users, return empty
        return res.json({
          success: true,
          data: [],
        });
      }
    }

    const { data: orders, error } = await query;

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
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get order by ID (admin only)
 */
export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          product:products(*),
          variant:product_variants(*)
        ),
        user:users(id, name, email, phone)
      `
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Fetch variant images
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

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Fetch current order to validate status transition
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !currentOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate status transitions
    const currentStatus = currentOrder.status;

    // Cannot change from cancelled or delivered
    if (currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a cancelled order",
      });
    }

    if (currentStatus === "delivered" && status !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of a delivered order",
      });
    }

    // Cannot go backwards in status (e.g., from shipped to processing)
    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(status);

    if (newIndex !== -1 && newIndex < currentIndex && status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${currentStatus}" to "${status}". Status can only progress forward or be cancelled.`,
      });
    }

    // Update order status
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Log status change (for audit trail)
    console.log(
      `Order ${id} status changed from "${currentStatus}" to "${status}"`
    );

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Cancel order (admin only)
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Fetch current order with items to restore stock
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items:order_items(
          *,
          variant_id,
          quantity
        )
      `
      )
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a delivered order",
      });
    }

    // Update order status to cancelled
    const { data: cancelledOrder, error: updateError } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Restore stock for cancelled order items
    if (order.order_items && order.order_items.length > 0) {
      for (const item of order.order_items) {
        if (item.variant_id) {
          // Get current stock
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock")
            .eq("id", item.variant_id)
            .single();

          if (variant) {
            // Restore stock
            const newStock = (variant.stock || 0) + item.quantity;
            const { error: stockError } = await supabase
              .from("product_variants")
              .update({ stock: newStock })
              .eq("id", item.variant_id);

            if (stockError) {
              console.error(
                `Error restoring stock for variant ${item.variant_id}:`,
                stockError
              );
              // Log error but don't fail cancellation - stock can be adjusted manually
            } else {
              console.log(
                `Restored ${item.quantity} units to variant ${item.variant_id}`
              );
            }
          }
        }
      }
    }

    // Log cancellation (for audit trail)
    console.log(`Order ${id} cancelled by admin`);

    res.json({
      success: true,
      message: "Order cancelled successfully. Stock has been restored.",
      data: cancelledOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
