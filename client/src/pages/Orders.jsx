import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls, currency } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const { showError } = useModal();
  const navigate = useNavigate();
  const { id: orderId } = useParams(); // Get order ID from URL params
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [orderDetail, setOrderDetail] = useState(null);

  const PackageIcon = getIcon("FaBox");
  const CalendarIcon = getIcon("FaCalendarAlt");
  const RupeeIcon = getIcon("FaRupeeSign");
  const EyeIcon = getIcon("FaEye");
  const ArrowLeftIcon = getIcon("FaArrowLeft");
  const MapIcon = getIcon("FaMapMarkerAlt");
  const UserIcon = getIcon("FaUser");
  const PhoneIcon = getIcon("FaPhone");
  const EnvelopeIcon = getIcon("FaEnvelope");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (orderId) {
      // Load specific order details
      loadOrderDetail(orderId);
    } else {
      // Load all orders
      loadOrders();
    }
  }, [isAuthenticated, navigate, orderId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(urls.api.orders.list);
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      showError("Failed to load orders. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetail = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(urls.api.orders.detail.replace(":id", id));
      setOrderDetail(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading order details:", error);
      showError("Failed to load order details. Please try again.", "Error");
      navigate("/orders"); // Redirect back to orders list on error
    } finally {
      setLoading(false);
    }
  };

  // Helper to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    if (imagePath.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
      return `${apiBase.replace("/api", "")}${imagePath}`;
    }
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${apiBase.replace("/api", "")}/${imagePath}`;
  };

  // Get item image
  const getItemImage = (item) => {
    if (item.variant?.images && item.variant.images.length > 0) {
      return getImageUrl(item.variant.images[0].image_url);
    }
    return (
      getImageUrl(item.product?.main_image) ||
      getImageUrl(item.product?.image) ||
      null
    );
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusLower = (status || "pending").toLowerCase();
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[statusLower] || statusMap.pending;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">
            {orderId ? "Loading order details..." : "Loading orders..."}
          </div>
        </div>
      </Layout>
    );
  }

  // Order Detail View
  if (orderId && orderDetail) {
    return (
      <Layout>
        <div className="container-custom py-4 md:py-8 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-4">
              <Link
                to={urls.routes.orders}
                className="text-primary-main hover:text-primary-dark"
              >
                <ArrowLeftIcon className="text-2xl" />
              </Link>
              <h1 className="text-2xl md:text-4xl font-bold">Order Details</h1>
            </div>
            <Link
              to={urls.routes.shop}
              className={`${componentStyles.button.outline} text-sm md:text-base`}
            >
              Continue Shopping
            </Link>
          </div>

          <div className={`${componentStyles.card.default} mb-6`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <PackageIcon className="text-primary-main" />
                  <h2 className="text-2xl font-bold">
                    Order #{orderDetail.id.substring(0, 8).toUpperCase()}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                      orderDetail.status
                    )}`}
                  >
                    {orderDetail.status || "Pending"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-1">
                    <CalendarIcon />
                    <span>
                      {new Date(orderDetail.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RupeeIcon />
                    <span className="font-semibold text-lg">
                      {currency.format(orderDetail.total)}
                    </span>
                  </div>
                  {orderDetail.payment_method && (
                    <div className="text-sm">
                      <strong>Payment:</strong>{" "}
                      {orderDetail.payment_method
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information & Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <UserIcon />
                  Customer Information
                </h3>
                <div className="text-sm space-y-2 text-gray-600">
                  <p>
                    <strong>Name:</strong> {orderDetail.shipping_name || "N/A"}
                  </p>
                  <p className="flex items-center gap-1">
                    <EnvelopeIcon />
                    <strong>Email:</strong>{" "}
                    {orderDetail.shipping_email || "N/A"}
                  </p>
                  {orderDetail.shipping_phone && (
                    <p className="flex items-center gap-1">
                      <PhoneIcon />
                      <strong>Phone:</strong> {orderDetail.shipping_phone}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapIcon />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600">
                  <p>{orderDetail.shipping_name || ""}</p>
                  <p>{orderDetail.shipping_address || ""}</p>
                  <p>
                    {orderDetail.shipping_city || ""}
                    {orderDetail.shipping_city && orderDetail.shipping_state
                      ? ", "
                      : ""}
                    {orderDetail.shipping_state || ""}{" "}
                    {orderDetail.shipping_zip || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4 text-lg">Order Items</h3>
              <div className="space-y-4">
                {orderDetail.order_items &&
                orderDetail.order_items.length > 0 ? (
                  orderDetail.order_items.map((item) => {
                    const itemImage = getItemImage(item);
                    const itemPrice = item.price || 0;
                    const variantName = item.variant_name;

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 border-b pb-4 last:border-0"
                      >
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item.product?.name || "Product"}
                            className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              if (e.target.dataset.error === "true") {
                                e.target.style.display = "none";
                                return;
                              }
                              e.target.dataset.error = "true";
                              const canvas = document.createElement("canvas");
                              canvas.width = 96;
                              canvas.height = 96;
                              const ctx = canvas.getContext("2d");
                              ctx.fillStyle = "#f3f4f6";
                              ctx.fillRect(0, 0, 96, 96);
                              ctx.fillStyle = "#9ca3af";
                              ctx.font = "12px Arial";
                              ctx.textAlign = "center";
                              ctx.fillText("No Image", 48, 48);
                              e.target.src = canvas.toDataURL();
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 flex items-center justify-center rounded-lg flex-shrink-0">
                            <span className="text-gray-400 text-xs">
                              No Image
                            </span>
                          </div>
                        )}
                        <div className="flex-grow">
                          <h4 className="font-semibold text-base mb-1">
                            {item.product?.name || "Product"}
                          </h4>
                          {variantName && (
                            <p className="text-sm text-gray-500 mb-2">
                              Variant: {variantName}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} ×{" "}
                            {currency.format(itemPrice)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-main text-lg">
                            {currency.format(itemPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No items found</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-primary-main">
                  {currency.format(orderDetail.total)}
                </span>
              </div>
            </div>
          </div>

          <Link
            to={urls.routes.orders}
            className={`${componentStyles.button.outline} inline-flex items-center gap-2`}
          >
            <ArrowLeftIcon />
            Back to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  // Orders List View
  return (
    <Layout>
      <div className="container-custom py-4 md:py-8 px-4 md:px-0">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold">My Orders</h1>
          <Link
            to={urls.routes.shop}
            className={`${componentStyles.button.outline} text-sm md:text-base`}
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className={`${componentStyles.card.default} text-center py-12`}>
            <PackageIcon className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 text-lg">You have no orders yet</p>
            <Link
              to={urls.routes.shop}
              className={componentStyles.button.primary}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order) => (
              <div key={order.id} className={componentStyles.card.default}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 pb-4 border-b">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <PackageIcon className="text-primary-main" />
                      <h3 className="font-bold text-lg">
                        Order #{order.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon />
                        <span>
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RupeeIcon />
                        <span className="font-semibold">
                          {currency.format(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className={`${componentStyles.button.outline} flex items-center gap-2 w-full md:w-auto justify-center`}
                  >
                    <EyeIcon />
                    View Details
                  </Link>
                </div>

                {/* Order Items Preview */}
                <div className="space-y-3">
                  {order.order_items && order.order_items.length > 0 ? (
                    order.order_items.slice(0, 3).map((item) => {
                      const itemImage = getItemImage(item);
                      const itemPrice = item.price || 0;
                      const variantName = item.variant_name;

                      return (
                        <div key={item.id} className="flex gap-3">
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={item.product?.name || "Product"}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                if (e.target.dataset.error === "true") {
                                  e.target.style.display = "none";
                                  return;
                                }
                                e.target.dataset.error = "true";
                                const canvas = document.createElement("canvas");
                                canvas.width = 64;
                                canvas.height = 64;
                                const ctx = canvas.getContext("2d");
                                ctx.fillStyle = "#f3f4f6";
                                ctx.fillRect(0, 0, 64, 64);
                                ctx.fillStyle = "#9ca3af";
                                ctx.font = "10px Arial";
                                ctx.textAlign = "center";
                                ctx.fillText("No Image", 32, 32);
                                e.target.src = canvas.toDataURL();
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg flex-shrink-0">
                              <span className="text-gray-400 text-xs">
                                No Image
                              </span>
                            </div>
                          )}
                          <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-sm truncate">
                              {item.product?.name || "Product"}
                            </h4>
                            {variantName && (
                              <p className="text-xs text-gray-500">
                                {variantName}
                              </p>
                            )}
                            <p className="text-xs text-gray-600">
                              Quantity: {item.quantity} ×{" "}
                              {currency.format(itemPrice)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary-main">
                              {currency.format(itemPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-sm">No items found</p>
                  )}
                  {order.order_items && order.order_items.length > 3 && (
                    <p className="text-sm text-gray-500 text-center pt-2 border-t">
                      +{order.order_items.length - 3} more item(s)
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
