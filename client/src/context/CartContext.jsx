import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api.js";
import { urls } from "../config/constants.js";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = async () => {
    // Only load cart if user has a token (is authenticated)
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(urls.api.cart.get);
      setCartItems(response.data.items || []);
    } catch (error) {
      // If 401, user is not authenticated - just clear cart
      if (error.response?.status === 401) {
        setCartItems([]);
      } else {
        console.error("Error loading cart:", error);
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load cart on mount only if authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadCart();
    }
  }, []);

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      const response = await api.post(urls.api.cart.add, {
        productId,
        variantId,
        quantity,
      });
      setCartItems(response.data.items || []);
      return { success: true };
    } catch (error) {
      // If 401, user needs to register/login
      if (error.response?.status === 401) {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            "Please register or login to add items to cart",
          requiresAuth: true,
        };
      }
      return {
        success: false,
        error: error.response?.data?.message || "Failed to add to cart",
      };
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await api.put(urls.api.cart.update, {
        itemId,
        quantity,
      });
      setCartItems(response.data.items || []);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to update cart",
      };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`${urls.api.cart.remove}/${itemId}`);
      setCartItems(response.data.items || []);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to remove from cart",
      };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete(urls.api.cart.clear);
      setCartItems([]);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to clear cart",
      };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
