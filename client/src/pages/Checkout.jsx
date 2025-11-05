import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    paymentMethod: "card",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: cartItems,
        total: getCartTotal(),
      };

      const response = await api.post(urls.api.orders.create, orderData);
      await clearCart();
      navigate(`/order-confirmation/${response.data.orderId}`);
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
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
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className={componentStyles.card.default}>
                <h2 className="text-xl font-semibold mb-4">
                  Shipping Information
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className={componentStyles.input.default}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={componentStyles.input.default}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={componentStyles.input.default}
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className={componentStyles.input.default}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
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

              <div className={componentStyles.card.default}>
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={componentStyles.input.default}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${componentStyles.button.primary} w-full text-lg py-3`}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className={componentStyles.card.default}>
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product.name} x {item.quantity}
                    </span>
                    <span>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
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
