import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
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
              {cartItems.map((item) => (
                <div key={item.id} className={componentStyles.card.default}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <img
                      src={item.product.image || "/placeholder.jpg"}
                      alt={item.product.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-2">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        ${item.product.price}
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            className="px-3 py-1 border rounded"
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            className="px-3 py-1 border rounded"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className={componentStyles.button.danger}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className={componentStyles.card.default}>
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
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
