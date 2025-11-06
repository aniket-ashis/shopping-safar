import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import {
  componentStyles,
  urls,
  currency,
  theme,
  typography,
  icons,
} from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getIcon } from "../utils/iconMapper.js";

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
  const [updatingItems, setUpdatingItems] = useState(new Set());

  const CartIcon = getIcon(icons.cart);
  const PlusIcon = getIcon(icons.plus);
  const MinusIcon = getIcon(icons.minus);
  const TrashIcon = getIcon(icons.delete);
  const ShoppingBagIcon = getIcon(icons.shop);
  const ArrowRightIcon = getIcon(icons.arrowRight);

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
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await updateCartItem(itemId, newQuantity);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      await removeFromCart(itemId);
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  if (loading) {
    return (
      <Layout>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          style={{ fontFamily: typography.fontFamily.primary }}
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
        style={{ fontFamily: typography.fontFamily.primary }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{
              color: theme.colors.text.primary,
              fontFamily: typography.fontFamily.heading,
            }}
          >
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            {cartItems.length > 0
              ? `${cartItems.length} ${
                  cartItems.length === 1 ? "item" : "items"
                } in your cart`
              : "Your cart is empty"}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className={componentStyles.cart.emptyState}>
            <div className="max-w-md mx-auto">
              <div className={componentStyles.cart.emptyIcon}>
                <CartIcon className="w-full h-full" />
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: typography.fontFamily.heading,
                }}
              >
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Link
                to={urls.routes.shop}
                className={`${componentStyles.button.primary} inline-flex items-center space-x-2`}
              >
                <ShoppingBagIcon />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const itemPrice = getItemPrice(item);
                const itemImage = getItemImage(item);
                const itemTotal = itemPrice * item.quantity;
                const variantName = item.variant?.name;
                const isUpdating = updatingItems.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`${componentStyles.cart.itemCard} ${
                      isUpdating ? "opacity-60 pointer-events-none" : ""
                    }`}
                  >
                    <div className="flex gap-4 md:gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {itemImage ? (
                          <img
                            src={itemImage}
                            alt={item.product.name}
                            className={componentStyles.cart.itemImage}
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`${componentStyles.cart.itemImage} hidden items-center justify-center bg-gray-100`}
                        >
                          <CartIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-grow min-w-0 pr-2">
                            <h3
                              className="text-lg font-semibold mb-1 truncate"
                              style={{ color: theme.colors.text.primary }}
                            >
                              {item.product.name}
                            </h3>
                            {variantName && (
                              <p className="text-sm text-gray-500 mb-2">
                                {variantName}
                              </p>
                            )}
                            <p
                              className="text-lg font-bold mb-4"
                              style={{ color: theme.colors.primary.main }}
                            >
                              {currency.format(itemPrice)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className="text-xl font-bold"
                              style={{ color: theme.colors.primary.main }}
                            >
                              {currency.format(itemTotal)}
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={isUpdating}
                              className={componentStyles.cart.quantityButton}
                              aria-label="Decrease quantity"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                handleQuantityChange(item.id, val);
                              }}
                              min="1"
                              disabled={isUpdating}
                              className={componentStyles.cart.quantityInput}
                            />
                            <button
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }
                              disabled={isUpdating}
                              className={componentStyles.cart.quantityButton}
                              aria-label="Increase quantity"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={isUpdating}
                            className={`${componentStyles.cart.removeButton} flex items-center space-x-1`}
                          >
                            <TrashIcon className="w-4 h-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className={componentStyles.cart.summaryCard}>
              <h2
                className="text-xl font-bold mb-6 pb-4 border-b"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: typography.fontFamily.heading,
                  borderColor: theme.colors.border.light,
                }}
              >
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span
                    className="font-semibold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {currency.format(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping</span>
                  <span
                    className="font-semibold"
                    style={{ color: theme.colors.status.success }}
                  >
                    Free
                  </span>
                </div>

                <div
                  className="flex justify-between items-center pt-4 border-t"
                  style={{ borderColor: theme.colors.border.light }}
                >
                  <span
                    className="text-lg font-bold"
                    style={{ color: theme.colors.text.primary }}
                  >
                    Total
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.primary.main }}
                  >
                    {currency.format(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className={`${componentStyles.button.primary} w-full flex items-center justify-center space-x-2 py-3 mb-4`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>

              <Link
                to={urls.routes.shop}
                className="block text-center text-sm font-medium hover:underline transition-colors"
                style={{ color: theme.colors.primary.main }}
              >
                <span className="flex items-center justify-center space-x-1">
                  <ShoppingBagIcon className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </span>
              </Link>

              {/* Security Badge */}
              <div className="mt-6 pt-6 border-t text-center">
                <p
                  className="text-xs text-gray-500"
                  style={{ borderColor: theme.colors.border.light }}
                >
                  🔒 Secure checkout • Free shipping on all orders
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
