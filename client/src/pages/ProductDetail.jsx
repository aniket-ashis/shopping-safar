import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import api from "../utils/api.js";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        urls.api.products.detail.replace(":id", id)
      );
      // API returns { success: true, data: {...} }
      setProduct(response.data.data || response.data);
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const result = await addToCart(product.id, quantity);
    if (result.success) {
      alert("Product added to cart!");
    } else {
      if (result.requiresAuth) {
        const shouldRegister = window.confirm(
          `${result.error}\n\nWould you like to register or login now?`
        );
        if (shouldRegister) {
          window.location.href = "/register";
        }
      } else {
        alert(result.error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">Loading product...</div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">Product not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-primary-main hover:underline"
        >
          ← Back to Shop
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div>
            <img
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              className="w-full rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-primary-main mb-4">
              ${product.price}
            </p>
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block mb-2">Quantity:</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border rounded-lg"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 border rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`${componentStyles.button.primary} w-full text-lg py-3 mb-4`}
            >
              Add to Cart
            </button>

            {/* Additional Info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Category: {product.category}</li>
                <li>Stock: {product.stock || "In Stock"}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
