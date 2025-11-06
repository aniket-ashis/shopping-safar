import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import ProductCard from "../components/features/ProductCard.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [sortBy, setSortBy] = useState("newest");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showSuccess, showError, showConfirmation } = useModal();

  const SearchIcon = getIcon("FaSearch");

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await api.get(urls.api.products.list, { params });
      setProducts(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get(urls.api.products.categories);
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProducts();
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showConfirmation({
        title: "Authentication Required",
        message: "Please login to add items to cart. Would you like to login now?",
        onConfirm: () => {
          window.location.href = "/login";
        },
        confirmLabel: "Yes, Login",
        cancelLabel: "Cancel",
      });
      return;
    }

    // If product has variants, navigate to product detail page
    if (product.variantCount > 0) {
      window.location.href = `/product/${product.id}`;
      return;
    }

    // Otherwise, add to cart with default variant or no variant
    const result = await addToCart(
      product.id,
      product.defaultVariantId || null,
      1
    );
    if (result.success) {
      showSuccess("Product added to cart!", "Success");
    } else {
      showError(result.error || "Failed to add to cart", "Error");
    }
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = Array.isArray(products)
      ? products.filter((product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // newest (default)
        filtered.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
        );
    }

    return filtered;
  }, [products, searchTerm, sortBy]);

  return (
    <Layout>
      <div className="container-custom py-4 md:py-8 px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Shop</h1>

        {/* Search, Filter, and Sort */}
        <div className="mb-6 md:mb-8 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${componentStyles.input.default} w-full pl-10`}
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button type="submit" className={componentStyles.button.primary}>
              Search
            </button>
          </form>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                loadProducts();
              }}
              className={`${componentStyles.input.default} flex-1`}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name?.toLowerCase()}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={componentStyles.input.default}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  No products found. Try adjusting your search or filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Shop;
