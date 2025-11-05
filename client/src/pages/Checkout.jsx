import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls, currency } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "cash_on_delivery",
  });

  const LoadIcon = getIcon("FaSpinner");
  const MapIcon = getIcon("FaMapMarkerAlt");
  const CreditCardIcon = getIcon("FaCreditCard");

  // Load saved addresses if user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAddresses();
      // Pre-fill form with user data
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  const loadAddresses = async () => {
    try {
      const response = await api.get(urls.api.users.addresses);
      const addressList = response.data.data || response.data || [];
      setAddresses(addressList);
      // Auto-select default address if available
      const defaultAddress = addressList.find(
        (addr) => addr.is_default || addr.isDefault
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setUseNewAddress(false);
        populateFormFromAddress(defaultAddress);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
    }
  };

  const populateFormFromAddress = (address) => {
    setFormData({
      fullName: address.name || user?.name || "",
      email: user?.email || "",
      phone: address.phone || user?.phone || "",
      address: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      paymentMethod: formData.paymentMethod,
    });
  };

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      populateFormFromAddress(address);
      setUseNewAddress(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (useNewAddress) {
      setUseNewAddress(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cartItems.map((item) => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity,
          product_id: item.product.id,
          variant_id: item.variant?.id || null,
        })),
        total: getCartTotal(),
      };

      const response = await api.post(urls.api.orders.create, orderData);
      await clearCart();
      showSuccess(
        response.data.isGuest
          ? "Order placed successfully! Check your email for account details and order confirmation."
          : "Order placed successfully! Check your email for order confirmation.",
        "Order Confirmed"
      );
      navigate(`/orders`);
    } catch (error) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to place order. Please try again.";
      showError(errorMessage, "Order Failed");
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

  // Get item price
  const getItemPrice = (item) => {
    return (
      item.variant?.price || item.product.base_price || item.product.price || 0
    );
  };

  // Get item image
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

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4 text-lg">Your cart is empty</p>
            <button
              onClick={() => navigate(urls.routes.shop)}
              className={componentStyles.button.primary}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-4 md:py-8 px-4 md:px-0">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Address Selection for Logged-in Users */}
              {isAuthenticated && addresses.length > 0 && (
                <div className={componentStyles.card.default}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MapIcon className="mr-2 text-primary-main" />
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Select Saved Address
                      </label>
                      <select
                        value={useNewAddress ? "" : selectedAddressId || ""}
                        onChange={(e) => {
                          if (e.target.value === "new") {
                            setUseNewAddress(true);
                            setSelectedAddressId(null);
                          } else {
                            handleAddressSelect(e.target.value);
                          }
                        }}
                        className={componentStyles.input.default}
                      >
                        <option value="new">Enter New Address</option>
                        {addresses.map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.name || ""} - {address.street},{" "}
                            {address.city}
                            {address.is_default || address.isDefault
                              ? " (Default)"
                              : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Information Form */}
              <div className={componentStyles.card.default}>
                <h2 className="text-xl font-semibold mb-4">
                  {isAuthenticated && addresses.length > 0 && !useNewAddress
                    ? "Selected Address"
                    : "Shipping Information"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isAuthenticated}
                      className={`${componentStyles.input.default} ${
                        isAuthenticated ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="Street Address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zip"
                      placeholder="ZIP Code"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className={componentStyles.card.default}>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <CreditCardIcon className="mr-2 text-primary-main" />
                  Payment Method
                </h2>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={componentStyles.input.default}
                >
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="card" disabled>
                    Credit/Debit Card (Coming Soon)
                  </option>
                  <option value="paypal" disabled>
                    PayPal (Coming Soon)
                  </option>
                </select>
                {formData.paymentMethod === "cash_on_delivery" && (
                  <p className="mt-2 text-sm text-gray-600">
                    Pay with cash when your order is delivered.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${
                  componentStyles.button.primary
                } w-full text-lg py-3 flex items-center justify-center ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <LoadIcon className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${componentStyles.card.default} sticky top-4`}>
              <h2 className="text-xl font-bold mb-4 pb-4 border-b">
                Order Summary
              </h2>
              <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                {cartItems.map((item) => {
                  const itemPrice = getItemPrice(item);
                  const itemImage = getItemImage(item);
                  const itemTotal = itemPrice * item.quantity;
                  const variantName = item.variant?.name;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 pb-4 border-b last:border-0"
                    >
                      {itemImage ? (
                        <img
                          src={itemImage}
                          alt={item.product.name}
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
                        <h3 className="font-semibold text-sm mb-1 truncate">
                          {item.product.name}
                        </h3>
                        {variantName && (
                          <p className="text-xs text-gray-500 mb-1">
                            {variantName}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary-main mt-1">
                          {currency.format(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4 space-y-2">
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
                <div className="flex justify-between font-bold text-lg pt-2 border-t text-primary-main">
                  <span>Total</span>
                  <span>{currency.format(getCartTotal())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
