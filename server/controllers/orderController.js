import { supabase } from "../utils/supabase.js";

export const createOrder = async (req, res) => {
  try {
    const { items, total, ...shippingInfo } = req.body;
    const userId = req.user.userId;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          total,
          status: "pending",
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_state: shippingInfo.state,
          shipping_zip: shippingInfo.zip,
          shipping_name: shippingInfo.fullName,
          shipping_email: shippingInfo.email,
          shipping_phone: shippingInfo.phone,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", userId);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      order,
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
          product:products(*)
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: orders || [],
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
          product:products(*)
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
