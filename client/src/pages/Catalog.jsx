import React, { useState, useEffect } from "react";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import api from "../utils/api.js";
import ProductCard from "../components/features/ProductCard.jsx";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { showSuccess, showError, showConfirmation } = useModal();

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

  const handleAddToCart = async (product) => {
    // For catalog page, we add the default product/variant.
    // If a product has variants, the user will select a specific variant on the ProductDetail page.
    const variantIdToAdd = product.defaultVariantId || null;
    const result = await addToCart(product.id, variantIdToAdd, 1);
    if (result.success) {
      showSuccess("Product added to cart!", "Success");
    } else {
      if (result.requiresAuth) {
        showConfirmation({
          title: "Authentication Required",
          message: `${result.error}\n\nWould you like to register or login now?`,
          onConfirm: () => {
            window.location.href = "/register";
          },
          confirmLabel: "Yes, Register/Login",
          cancelLabel: "Cancel",
        });
      } else {
        showError(result.error || "Failed to add product to cart.", "Error");
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
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
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
