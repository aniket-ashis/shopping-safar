import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import api from "../utils/api.js";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const response = await api.get(urls.api.products.categories);
      // API returns { success: true, data: [...] }
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(urls.api.products.list, {
        params: {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        },
      });
      // API returns { success: true, data: [...] }
      setProducts(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1);
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

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Product Catalog</h1>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === "all"
                  ? componentStyles.button.primary
                  : componentStyles.button.outline
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === category.id
                    ? componentStyles.button.primary
                    : componentStyles.button.outline
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className={componentStyles.card.hover}>
                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-2">
                    {product.description?.substring(0, 100)}...
                  </p>
                  <p className="text-xl font-bold text-primary-main mb-2">
                    ${product.price}
                  </p>
                </Link>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className={`${componentStyles.button.primary} w-full mt-4`}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found in this category.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Catalog;
