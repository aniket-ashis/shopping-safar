import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import api from "../utils/api.js";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

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

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">Loading products...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold mb-8">Shop</h1>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={componentStyles.input.default}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={componentStyles.input.default}
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className={componentStyles.card.hover}>
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">${product.price}</p>
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
