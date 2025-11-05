import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";

const Admin = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    base_price: "",
    category: "",
    brand: "",
    main_image: "",
  });

  const [variantForm, setVariantForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    attributes: {},
    isDefault: false,
    images: [],
  });

  const PlusIcon = getIcon("FaPlus");
  const EditIcon = getIcon("FaEdit");
  const TrashIcon = getIcon("FaTrash");
  const PackageIcon = getIcon("FaBox");

  useEffect(() => {
    const checkAdminAccess = async () => {
      setCheckingAccess(true);

      // Wait for auth context to finish loading
      if (authLoading) {
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // If not authenticated via context, check token validity
      if (!isAuthenticated) {
        // Try to verify token
        try {
          const verifyResponse = await api.get(urls.api.auth.verify);
          const userData = verifyResponse.data.user || verifyResponse.data;

          if (!userData || userData.role !== "admin") {
            alert("Access denied. Admin privileges required.");
            navigate("/");
            return;
          }

          setHasAccess(true);
          loadProducts();
          setCheckingAccess(false);
          return;
        } catch (error) {
          console.error("Error verifying token:", error);
          navigate("/login");
          return;
        }
      }

      // Always fetch latest user profile to ensure we have the current role
      // This is important in case the role was updated in the database
      try {
        const response = await api.get(urls.api.users.profile);
        const userData = response.data.data || response.data;

        if (!userData) {
          alert("Failed to load user profile. Please try again.");
          navigate("/");
          return;
        }

        // Check if user is admin
        if (userData.role !== "admin") {
          alert("Access denied. Admin privileges required.");
          navigate("/");
          return;
        }

        // Update user in localStorage with latest data including role
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...storedUser, ...userData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setHasAccess(true);
        loadProducts();
      } catch (error) {
        console.error("Error checking admin access:", error);
        // Handle 401 - token invalid or expired
        if (error.response?.status === 401) {
          // Clear auth data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          alert("Failed to verify admin access. Please try again.");
          navigate("/");
        }
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user, authLoading, navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(urls.api.products.list);
      setProducts(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingProduct) {
        await api.put(
          `${urls.api.products.detail.replace(":id", editingProduct.id)}`,
          productForm
        );
        alert("Product updated successfully!");
      } else {
        await api.post(urls.api.products.list, productForm);
        alert("Product created successfully!");
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        base_price: "",
        category: "",
        brand: "",
        main_image: "",
      });
      loadProducts();
    } catch (error) {
      alert("Failed to save product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) {
      alert("Please select a product first");
      return;
    }

    try {
      setLoading(true);
      const variantData = {
        ...variantForm,
        price: parseFloat(variantForm.price),
        stock: parseInt(variantForm.stock),
      };

      if (editingVariant) {
        await api.put(
          `${urls.api.variants.detail.replace(":id", editingVariant.id)}`,
          variantData
        );
        alert("Variant updated successfully!");
      } else {
        await api.post(
          urls.api.variants.list.replace(":productId", editingProduct.id),
          variantData
        );
        alert("Variant created successfully!");
      }
      setShowVariantForm(false);
      setEditingVariant(null);
      setVariantForm({
        name: "",
        sku: "",
        price: "",
        stock: "",
        attributes: {},
        isDefault: false,
        images: [],
      });
      loadProducts();
    } catch (error) {
      alert("Failed to save variant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await api.delete(urls.api.products.detail.replace(":id", productId));
      alert("Product deleted successfully!");
      loadProducts();
    } catch (error) {
      alert("Failed to delete product.");
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete this variant?")) {
      return;
    }
    try {
      await api.delete(urls.api.variants.detail.replace(":id", variantId));
      alert("Variant deleted successfully!");
      loadProducts();
    } catch (error) {
      alert("Failed to delete variant.");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      base_price: product.base_price || product.price || "",
      category: product.category || "",
      brand: product.brand || "",
      main_image: product.main_image || product.image || "",
    });
    setShowProductForm(true);
  };

  const handleEditVariant = (variant, product) => {
    setEditingProduct(product);
    setEditingVariant(variant);
    setVariantForm({
      name: variant.name || "",
      sku: variant.sku || "",
      price: variant.price || "",
      stock: variant.stock || "",
      attributes: variant.attributes || {},
      isDefault: variant.is_default || false,
      images: variant.images || [],
    });
    setShowVariantForm(true);
  };

  // Show loading state while checking access
  if (checkingAccess || authLoading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <div className="text-center">
            <p>Verifying admin access...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render if no access (will be redirected)
  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <div className="container-custom py-4 md:py-8 px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          Admin Panel
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 md:mb-8">
          <div className="flex space-x-4 md:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-4 px-2 font-semibold whitespace-nowrap ${
                activeTab === "products"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              <PackageIcon className="inline-block mr-2" />
              Products
            </button>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Products</h2>
              <button
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    description: "",
                    base_price: "",
                    category: "",
                    brand: "",
                    main_image: "",
                  });
                }}
                className={`${componentStyles.button.primary} flex items-center space-x-2`}
              >
                <PlusIcon />
                <span>Add Product</span>
              </button>
            </div>

            {/* Product Form */}
            {showProductForm && (
              <div className={`${componentStyles.card.default} mb-8`}>
                <h3 className="text-xl font-semibold mb-4">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold">
                        Product Name
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            name: e.target.value,
                          })
                        }
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">
                        Base Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.base_price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            base_price: e.target.value,
                          })
                        }
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Description
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      rows="4"
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold">
                        Category
                      </label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Brand</label>
                      <input
                        type="text"
                        value={productForm.brand}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            brand: e.target.value,
                          })
                        }
                        className={componentStyles.input.default}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Main Image URL
                    </label>
                    <input
                      type="url"
                      value={productForm.main_image}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          main_image: e.target.value,
                        })
                      }
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={componentStyles.button.primary}
                    >
                      {loading
                        ? "Saving..."
                        : editingProduct
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                      }}
                      className={componentStyles.button.outline}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products List */}
            {loading && !showProductForm ? (
              <div className="text-center py-12">
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={componentStyles.card.default}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {product.description}
                        </p>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          <span>
                            Price: ${product.base_price || product.price}
                          </span>
                          <span>Category: {product.category || "N/A"}</span>
                          <span>Variants: {product.variantCount || 0}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-primary-main hover:text-primary-dark"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>

                    {/* Variants Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Variants</h4>
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setEditingVariant(null);
                            setVariantForm({
                              name: "",
                              sku: "",
                              price: product.base_price || product.price || "",
                              stock: "",
                              attributes: {},
                              isDefault: false,
                              images: [],
                            });
                            setShowVariantForm(true);
                          }}
                          className={`${componentStyles.button.outline} text-sm flex items-center space-x-1`}
                        >
                          <PlusIcon className="text-xs" />
                          <span>Add Variant</span>
                        </button>
                      </div>

                      {/* Variant Form */}
                      {showVariantForm && editingProduct?.id === product.id && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h5 className="font-semibold mb-3">
                            {editingVariant
                              ? "Edit Variant"
                              : "Add New Variant"}
                          </h5>
                          <form
                            onSubmit={handleVariantSubmit}
                            className="space-y-3"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-1 text-sm font-semibold">
                                  Variant Name
                                </label>
                                <input
                                  type="text"
                                  value={variantForm.name}
                                  onChange={(e) =>
                                    setVariantForm({
                                      ...variantForm,
                                      name: e.target.value,
                                    })
                                  }
                                  required
                                  className={componentStyles.input.default}
                                  placeholder="e.g., Red - Large"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-sm font-semibold">
                                  SKU
                                </label>
                                <input
                                  type="text"
                                  value={variantForm.sku}
                                  onChange={(e) =>
                                    setVariantForm({
                                      ...variantForm,
                                      sku: e.target.value,
                                    })
                                  }
                                  className={componentStyles.input.default}
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block mb-1 text-sm font-semibold">
                                  Price
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={variantForm.price}
                                  onChange={(e) =>
                                    setVariantForm({
                                      ...variantForm,
                                      price: e.target.value,
                                    })
                                  }
                                  required
                                  className={componentStyles.input.default}
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-sm font-semibold">
                                  Stock
                                </label>
                                <input
                                  type="number"
                                  value={variantForm.stock}
                                  onChange={(e) =>
                                    setVariantForm({
                                      ...variantForm,
                                      stock: e.target.value,
                                    })
                                  }
                                  required
                                  className={componentStyles.input.default}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block mb-1 text-sm font-semibold">
                                Attributes (JSON format, e.g., {"{"}
                                "color":"Red","size":"L"{"}"})
                              </label>
                              <textarea
                                value={JSON.stringify(
                                  variantForm.attributes,
                                  null,
                                  2
                                )}
                                onChange={(e) => {
                                  try {
                                    setVariantForm({
                                      ...variantForm,
                                      attributes: JSON.parse(e.target.value),
                                    });
                                  } catch (err) {
                                    // Invalid JSON, ignore
                                  }
                                }}
                                rows="3"
                                className={componentStyles.input.default}
                                placeholder='{"color":"Red","size":"L"}'
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="isDefault"
                                checked={variantForm.isDefault}
                                onChange={(e) =>
                                  setVariantForm({
                                    ...variantForm,
                                    isDefault: e.target.checked,
                                  })
                                }
                                className="w-4 h-4"
                              />
                              <label htmlFor="isDefault" className="text-sm">
                                Set as default variant
                              </label>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="submit"
                                disabled={loading}
                                className={componentStyles.button.primary}
                              >
                                {loading
                                  ? "Saving..."
                                  : editingVariant
                                  ? "Update"
                                  : "Create"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowVariantForm(false);
                                  setEditingVariant(null);
                                }}
                                className={componentStyles.button.outline}
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Variants List */}
                      {product.variants && product.variants.length > 0 ? (
                        <div className="space-y-2">
                          {product.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="flex justify-between items-center p-2 bg-white rounded border"
                            >
                              <div>
                                <span className="font-semibold">
                                  {variant.name}
                                </span>
                                {variant.is_default && (
                                  <span className="ml-2 text-xs bg-primary-main text-white px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                                <div className="text-sm text-gray-600">
                                  ${variant.price} | Stock: {variant.stock}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handleEditVariant(variant, product)
                                  }
                                  className="text-primary-main"
                                >
                                  <EditIcon />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteVariant(variant.id)
                                  }
                                  className="text-red-600"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No variants yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
