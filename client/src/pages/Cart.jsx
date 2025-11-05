import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls, currency } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Cart = () => {
  const {
    cartItems,
    loading,
    updateCartItem,
    removeFromCart,
    getCartTotal,
    loadCart,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Helper to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it starts with /, it's a local path - construct full URL
    if (imagePath.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
      return `${apiBase.replace("/api", "")}${imagePath}`;
    }
    // Otherwise, assume it's a relative path
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${apiBase.replace("/api", "")}/${imagePath}`;
  };

  // Get item price (variant price if available, otherwise product price)
  const getItemPrice = (item) => {
    return (
      item.variant?.price || item.product.base_price || item.product.price || 0
    );
  };

  // Get item image (variant image if available, otherwise product main image)
  const getItemImage = (item) => {
    if (item.variant?.images && item.variant.images.length > 0) {
      return getImageUrl(item.variant.images[0].image_url);
    }
    return (
      getImageUrl(item.product.main_image) ||
      getImageUrl(item.product.image) ||
      null
    );
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">Loading cart...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              to={urls.routes.shop}
              className={componentStyles.button.primary}
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemPrice = getItemPrice(item);
                const itemImage = getItemImage(item);
                const itemTotal = itemPrice * item.quantity;
                const variantName = item.variant?.name;

                return (
                  <div key={item.id} className={componentStyles.card.default}>
                    <div className="flex flex-col md:flex-row gap-4">
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={item.product.name}
                          className="w-full md:w-32 h-32 object-cover rounded-lg"
                          onError={(e) => {
                            if (e.target.dataset.error === "true") {
                              e.target.style.display = "none";
                              return;
                            }
                            e.target.dataset.error = "true";
                            const canvas = document.createElement("canvas");
                            canvas.width = 128;
                            canvas.height = 128;
                            const ctx = canvas.getContext("2d");
                            ctx.fillStyle = "#f3f4f6";
                            ctx.fillRect(0, 0, 128, 128);
                            ctx.fillStyle = "#9ca3af";
                            ctx.font = "14px Arial";
                            ctx.textAlign = "center";
                            ctx.fillText("No Image", 64, 64);
                            e.target.src = canvas.toDataURL();
                          }}
                        />
                      ) : (
                        <div className="w-full md:w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold mb-1">
                          {item.product.name}
                        </h3>
                        {variantName && (
                          <p className="text-sm text-gray-500 mb-2">
                            Variant: {variantName}
                          </p>
                        )}
                        <p className="text-gray-600 mb-3 font-semibold">
                          {currency.format(itemPrice)}
                        </p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2 border rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              className="px-3 py-1 hover:bg-gray-100 rounded-l-lg transition-colors"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-semibold min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              className="px-3 py-1 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className={`${componentStyles.button.danger} text-sm px-3 py-1`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary-main">
                          {currency.format(itemTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className={componentStyles.card.default}>
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {currency.format(getCartTotal())}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t text-primary-main">
                  <span>Total</span>
                  <span>{currency.format(getCartTotal())}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className={`${componentStyles.button.primary} w-full text-lg py-3`}
              >
                Proceed to Checkout
              </button>
              <Link
                to={urls.routes.shop}
                className="block text-center mt-4 text-primary-main hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
