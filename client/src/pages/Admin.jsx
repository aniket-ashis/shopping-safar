import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls, currency } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";

const Admin = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError, showConfirmation } = useModal();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderFilters, setOrderFilters] = useState({
    status: "",
    email: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const [variantImagePreviews, setVariantImagePreviews] = useState({});

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    base_price: "",
    category_id: "",
    brand_id: "",
    main_image: "",
    slug: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    slug: "",
    image: "",
  });

  const [brandForm, setBrandForm] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
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
  const TagIcon = getIcon("FaTag");
  const StarIcon = getIcon("FaStar");

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
            showError(
              "Access denied. Admin privileges required.",
              "Access Denied"
            );
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
          showError("Failed to load user profile. Please try again.", "Error");
          navigate("/");
          return;
        }

        // Check if user is admin
        if (userData.role !== "admin") {
          showError(
            "Access denied. Admin privileges required.",
            "Access Denied"
          );
          navigate("/");
          return;
        }

        // Update user in localStorage with latest data including role
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...storedUser, ...userData };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setHasAccess(true);
        loadProducts();
        loadCategories();
        loadBrands();
      } catch (error) {
        console.error("Error checking admin access:", error);
        // Handle 401 - token invalid or expired
        if (error.response?.status === 401) {
          // Clear auth data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        } else {
          showError(
            "Failed to verify admin access. Please try again.",
            "Error"
          );
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

  const loadCategories = async () => {
    try {
      const response = await api.get(urls.api.categories.list);
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadBrands = async () => {
    try {
      const response = await api.get(urls.api.brands.list);
      setBrands(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading brands:", error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (orderFilters.status) params.append("status", orderFilters.status);
      if (orderFilters.email) params.append("email", orderFilters.email);
      if (orderFilters.startDate)
        params.append("startDate", orderFilters.startDate);
      if (orderFilters.endDate) params.append("endDate", orderFilters.endDate);

      const queryString = params.toString();
      const url = queryString
        ? `${urls.api.orders.admin.all}?${queryString}`
        : urls.api.orders.admin.all;
      const response = await api.get(url);
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      showError("Failed to load orders. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setLoading(true);
      await api.put(
        urls.api.orders.admin.updateStatus.replace(":id", orderId),
        {
          status: newStatus,
        }
      );
      showSuccess("Order status updated successfully!", "Success");
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      showError(
        error.response?.data?.message || "Failed to update order status.",
        "Error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    showConfirmation({
      title: "Cancel Order",
      message:
        "Are you sure you want to cancel this order? This action cannot be undone.",
      onConfirm: async () => {
        try {
          setLoading(true);
          await api.put(urls.api.orders.admin.cancel.replace(":id", orderId));
          showSuccess("Order cancelled successfully!", "Success");
          loadOrders();
          if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(null);
          }
        } catch (error) {
          showError(
            error.response?.data?.message || "Failed to cancel order.",
            "Error"
          );
        } finally {
          setLoading(false);
        }
      },
      confirmLabel: "Cancel Order",
      cancelLabel: "Keep Order",
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      if (editingProduct) {
        response = await api.put(
          `${urls.api.products.detail.replace(":id", editingProduct.id)}`,
          productForm
        );
        showSuccess("Product updated successfully!", "Success");
      } else {
        response = await api.post(urls.api.products.list, productForm);
        showSuccess("Product created successfully!", "Success");
        // Set editingProduct so user can upload images
        const newProduct = response.data.data || response.data;
        if (newProduct) {
          setEditingProduct(newProduct);
          setProductForm({ ...productForm, ...newProduct });
        }
      }
      loadProducts();
    } catch (error) {
      showError("Failed to save product. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct) {
      showError("Please select a product first", "Error");
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
        showSuccess("Variant updated successfully!", "Success");
      } else {
        await api.post(
          urls.api.variants.list.replace(":productId", editingProduct.id),
          variantData
        );
        showSuccess("Variant created successfully!", "Success");
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
      showError("Failed to save variant. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    showConfirmation({
      title: "Delete Product",
      message:
        "Are you sure you want to delete this product? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(urls.api.products.detail.replace(":id", productId));
          showSuccess("Product deleted successfully!", "Success");
          loadProducts();
        } catch (error) {
          showError("Failed to delete product.", "Error");
        }
      },
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
  };

  const handleDeleteVariant = async (variantId) => {
    showConfirmation({
      title: "Delete Variant",
      message:
        "Are you sure you want to delete this variant? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(urls.api.variants.detail.replace(":id", variantId));
          showSuccess("Variant deleted successfully!", "Success");
          loadProducts();
        } catch (error) {
          showError("Failed to delete variant.", "Error");
        }
      },
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      base_price: product.base_price || product.price || "",
      category_id: product.category_id || product.category?.id || "",
      brand_id: product.brand_id || product.brand?.id || "",
      main_image: product.main_image || product.image || "",
      slug: product.slug || "",
      meta_title: product.meta_title || "",
      meta_description: product.meta_description || "",
      meta_keywords: product.meta_keywords || "",
    });
    setProductImagePreview(product.main_image || product.image || null);
    setShowProductForm(true);
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select an image file", "Invalid File");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5MB", "File Too Large");
      return;
    }

    if (!editingProduct?.id) {
      showError(
        "Please save the product first, then upload the image",
        "Error"
      );
      return;
    }

    const productId = editingProduct.id;
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const uploadUrl = urls.api.upload.productMain.replace(
        ":productId",
        productId
      );
      const response = await api.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = response.data.data?.url;
      if (imageUrl) {
        setProductForm({ ...productForm, main_image: imageUrl });
        setProductImagePreview(imageUrl);
        // Update the product in the backend with the new image URL
        await api.put(`${urls.api.products.detail.replace(":id", productId)}`, {
          ...productForm,
          main_image: imageUrl,
        });
        showSuccess("Image uploaded successfully!", "Success");
        loadProducts(); // Reload to show updated product
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Failed to upload image. Please try again.", "Error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProductImage = async () => {
    if (!productForm.main_image) return;

    try {
      await api.delete(urls.api.upload.deleteImage, {
        data: { imageUrl: productForm.main_image },
      });
      setProductForm({ ...productForm, main_image: "" });
      setProductImagePreview(null);
      showSuccess("Image deleted successfully!", "Success");
    } catch (error) {
      console.error("Error deleting image:", error);
      showError("Failed to delete image. Please try again.", "Error");
    }
  };

  const handleVariantImageUpload = async (e, variantId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Please select an image file", "Invalid File");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5MB", "File Too Large");
      return;
    }

    if (!editingProduct?.id) {
      showError("Please save the product first", "Error");
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const uploadUrl = urls.api.upload.variantImage
        .replace(":productId", editingProduct.id)
        .replace(":variantId", variantId);
      const response = await api.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const imageUrl = response.data.data?.url;
      if (imageUrl) {
        showSuccess("Image uploaded successfully!", "Success");
        loadProducts(); // Reload to get updated variant images
      }
    } catch (error) {
      console.error("Error uploading variant image:", error);
      showError("Failed to upload image. Please try again.", "Error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteVariantImage = async (imageId) => {
    showConfirmation({
      title: "Delete Image",
      message:
        "Are you sure you want to delete this image? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(
            urls.api.upload.deleteVariantImage.replace(":id", imageId)
          );
          showSuccess("Image deleted successfully!", "Success");
          loadProducts(); // Reload to get updated variant images
        } catch (error) {
          console.error("Error deleting variant image:", error);
          showError("Failed to delete image. Please try again.", "Error");
        }
      },
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
  };

  // Category management functions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingCategory) {
        await api.put(
          `${urls.api.categories.detail.replace(":id", editingCategory.id)}`,
          categoryForm
        );
        showSuccess("Category updated successfully!", "Success");
      } else {
        await api.post(urls.api.categories.list, categoryForm);
        showSuccess("Category created successfully!", "Success");
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "", slug: "", image: "" });
      loadCategories();
    } catch (error) {
      showError("Failed to save category. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    showConfirmation({
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(
            urls.api.categories.detail.replace(":id", categoryId)
          );
          showSuccess("Category deleted successfully!", "Success");
          loadCategories();
        } catch (error) {
          showError(
            error.response?.data?.message || "Failed to delete category.",
            "Error"
          );
        }
      },
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
  };

  // Brand management functions
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingBrand) {
        await api.put(
          `${urls.api.brands.detail.replace(":id", editingBrand.id)}`,
          brandForm
        );
        showSuccess("Brand updated successfully!", "Success");
      } else {
        await api.post(urls.api.brands.list, brandForm);
        showSuccess("Brand created successfully!", "Success");
      }
      setShowBrandForm(false);
      setEditingBrand(null);
      setBrandForm({ name: "", description: "", logo: "", website: "" });
      loadBrands();
    } catch (error) {
      showError("Failed to save brand. Please try again.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    showConfirmation({
      title: "Delete Brand",
      message:
        "Are you sure you want to delete this brand? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await api.delete(urls.api.brands.detail.replace(":id", brandId));
          showSuccess("Brand deleted successfully!", "Success");
          loadBrands();
        } catch (error) {
          showError(
            error.response?.data?.message || "Failed to delete brand.",
            "Error"
          );
        }
      },
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
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
            <button
              onClick={() => setActiveTab("categories")}
              className={`pb-4 px-2 font-semibold whitespace-nowrap ${
                activeTab === "categories"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              <TagIcon className="inline-block mr-2" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab("brands")}
              className={`pb-4 px-2 font-semibold whitespace-nowrap ${
                activeTab === "brands"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              <StarIcon className="inline-block mr-2" />
              Brands
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                loadOrders();
              }}
              className={`pb-4 px-2 font-semibold whitespace-nowrap ${
                activeTab === "orders"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              <PackageIcon className="inline-block mr-2" />
              Orders
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
                    category_id: "",
                    brand_id: "",
                    main_image: "",
                    slug: "",
                    meta_title: "",
                    meta_description: "",
                    meta_keywords: "",
                  });
                  setProductImagePreview(null);
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
                      <select
                        value={productForm.category_id}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category_id: e.target.value,
                          })
                        }
                        className={componentStyles.input.default}
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold">Brand</label>
                      <select
                        value={productForm.brand_id}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            brand_id: e.target.value,
                          })
                        }
                        className={componentStyles.input.default}
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Main Image
                    </label>
                    {productImagePreview && (
                      <div className="mb-2 relative inline-block">
                        <img
                          src={
                            productImagePreview.startsWith("http")
                              ? productImagePreview
                              : `${urls.api.base.replace(
                                  "/api",
                                  ""
                                )}${productImagePreview}`
                          }
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={handleDeleteProductImage}
                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingImage}
                      className={componentStyles.input.default}
                    />
                    {uploadingImage && (
                      <p className="text-sm text-blue-600 mt-1">Uploading...</p>
                    )}
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">SEO Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block mb-2 font-semibold">
                          Slug (auto-generated from name)
                        </label>
                        <input
                          type="text"
                          value={productForm.slug}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              slug: e.target.value,
                            })
                          }
                          placeholder="Auto-generated from name"
                          className={componentStyles.input.default}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={productForm.meta_title}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              meta_title: e.target.value,
                            })
                          }
                          placeholder="SEO title for search engines"
                          className={componentStyles.input.default}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold">
                          Meta Description
                        </label>
                        <textarea
                          value={productForm.meta_description}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              meta_description: e.target.value,
                            })
                          }
                          rows="3"
                          placeholder="SEO description for search engines"
                          className={componentStyles.input.default}
                        />
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          value={productForm.meta_keywords}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              meta_keywords: e.target.value,
                            })
                          }
                          placeholder="Comma-separated keywords"
                          className={componentStyles.input.default}
                        />
                      </div>
                    </div>
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
                          <span>
                            Category:{" "}
                            {product.category?.name ||
                              product.category ||
                              "N/A"}
                          </span>
                          <span>
                            Brand:{" "}
                            {product.brand?.name || product.brand || "N/A"}
                          </span>
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
                        <div className="space-y-4">
                          {product.variants.map((variant) => (
                            <div
                              key={variant.id}
                              className="p-4 bg-white rounded border"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
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
                              {/* Variant Images */}
                              <div className="mt-3 border-t pt-3">
                                <label className="block text-sm font-semibold mb-2">
                                  Variant Images
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {variant.images &&
                                  variant.images.length > 0 ? (
                                    variant.images.map((img) => (
                                      <div
                                        key={img.id}
                                        className="relative inline-block"
                                      >
                                        <img
                                          src={
                                            img.image_url.startsWith("http")
                                              ? img.image_url
                                              : `${urls.api.base.replace(
                                                  "/api",
                                                  ""
                                                )}${img.image_url}`
                                          }
                                          alt={variant.name}
                                          className="h-20 w-20 object-cover rounded border"
                                        />
                                        <button
                                          onClick={() =>
                                            handleDeleteVariantImage(img.id)
                                          }
                                          className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-500">
                                      No images
                                    </p>
                                  )}
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleVariantImageUpload(e, variant.id)
                                  }
                                  disabled={uploadingImage}
                                  className="text-xs"
                                />
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

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Categories</h2>
              <button
                onClick={() => {
                  setShowCategoryForm(true);
                  setEditingCategory(null);
                  setCategoryForm({
                    name: "",
                    description: "",
                    slug: "",
                    image: "",
                  });
                }}
                className={`${componentStyles.button.primary} flex items-center space-x-2`}
              >
                <PlusIcon />
                <span>Add Category</span>
              </button>
            </div>

            {showCategoryForm && (
              <div className={`${componentStyles.card.default} mb-8`}>
                <h3 className="text-xl font-semibold mb-4">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">Name</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Description
                    </label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Slug</label>
                    <input
                      type="text"
                      value={categoryForm.slug}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          slug: e.target.value,
                        })
                      }
                      placeholder="Auto-generated from name"
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
                        : editingCategory
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCategoryForm(false);
                        setEditingCategory(null);
                      }}
                      className={componentStyles.button.outline}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className={componentStyles.card.default}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {category.description}
                        </p>
                      )}
                      {category.slug && (
                        <p className="text-xs text-gray-500 mt-1">
                          Slug: {category.slug}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryForm({
                            name: category.name || "",
                            description: category.description || "",
                            slug: category.slug || "",
                            image: category.image || "",
                          });
                          setShowCategoryForm(true);
                        }}
                        className="text-primary-main"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === "brands" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Brands</h2>
              <button
                onClick={() => {
                  setShowBrandForm(true);
                  setEditingBrand(null);
                  setBrandForm({
                    name: "",
                    description: "",
                    logo: "",
                    website: "",
                  });
                }}
                className={`${componentStyles.button.primary} flex items-center space-x-2`}
              >
                <PlusIcon />
                <span>Add Brand</span>
              </button>
            </div>

            {showBrandForm && (
              <div className={`${componentStyles.card.default} mb-8`}>
                <h3 className="text-xl font-semibold mb-4">
                  {editingBrand ? "Edit Brand" : "Add New Brand"}
                </h3>
                <form onSubmit={handleBrandSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">Name</label>
                    <input
                      type="text"
                      value={brandForm.name}
                      onChange={(e) =>
                        setBrandForm({ ...brandForm, name: e.target.value })
                      }
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Description
                    </label>
                    <textarea
                      value={brandForm.description}
                      onChange={(e) =>
                        setBrandForm({
                          ...brandForm,
                          description: e.target.value,
                        })
                      }
                      rows="3"
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Logo URL</label>
                    <input
                      type="url"
                      value={brandForm.logo}
                      onChange={(e) =>
                        setBrandForm({ ...brandForm, logo: e.target.value })
                      }
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Website</label>
                    <input
                      type="url"
                      value={brandForm.website}
                      onChange={(e) =>
                        setBrandForm({ ...brandForm, website: e.target.value })
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
                        : editingBrand
                        ? "Update"
                        : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBrandForm(false);
                        setEditingBrand(null);
                      }}
                      className={componentStyles.button.outline}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {brands.map((brand) => (
                <div key={brand.id} className={componentStyles.card.default}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{brand.name}</h3>
                      {brand.description && (
                        <p className="text-gray-600 text-sm mt-1">
                          {brand.description}
                        </p>
                      )}
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 block"
                        >
                          {brand.website}
                        </a>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingBrand(brand);
                          setBrandForm({
                            name: brand.name || "",
                            description: brand.description || "",
                            logo: brand.logo || "",
                            website: brand.website || "",
                          });
                          setShowBrandForm(true);
                        }}
                        className="text-primary-main"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">Orders</h2>
            </div>

            {/* Filters */}
            <div className={`${componentStyles.card.default} mb-6`}>
              <h3 className="font-semibold mb-4">Filter Orders</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    Status
                  </label>
                  <select
                    value={orderFilters.status}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        status: e.target.value,
                      })
                    }
                    className={componentStyles.input.default}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    value={orderFilters.email}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        email: e.target.value,
                      })
                    }
                    placeholder="Search by email"
                    className={componentStyles.input.default}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={orderFilters.startDate}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        startDate: e.target.value,
                      })
                    }
                    className={componentStyles.input.default}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={orderFilters.endDate}
                    onChange={(e) =>
                      setOrderFilters({
                        ...orderFilters,
                        endDate: e.target.value,
                      })
                    }
                    className={componentStyles.input.default}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={loadOrders}
                  className={componentStyles.button.primary}
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => {
                    setOrderFilters({
                      status: "",
                      email: "",
                      startDate: "",
                      endDate: "",
                    });
                    loadOrders();
                  }}
                  className={componentStyles.button.outline}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div
                className={`${componentStyles.card.default} text-center py-12`}
              >
                <PackageIcon className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`${
                      componentStyles.card.default
                    } cursor-pointer hover:shadow-lg transition-shadow ${
                      selectedOrder?.id === order.id
                        ? "ring-2 ring-primary-main"
                        : ""
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "processing"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "shipped"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status || "Pending"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Customer:</strong>{" "}
                            {order.user?.name || "N/A"} (
                            {order.user?.email || order.shipping_email})
                          </p>
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(order.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <p>
                            <strong>Total:</strong> ₹
                            {parseFloat(order.total || 0).toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>
                          <p>
                            <strong>Items:</strong>{" "}
                            {order.order_items?.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(order.id, e.target.value);
                          }}
                          className={`${componentStyles.input.default} text-sm`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {order.status !== "cancelled" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelOrder(order.id);
                            }}
                            className={`${componentStyles.button.danger} text-sm`}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Detail View */}
            {selectedOrder && (
              <div className={`${componentStyles.card.default} mt-6`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">
                    Order Details - #
                    {selectedOrder.id.substring(0, 8).toUpperCase()}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className={componentStyles.button.outline}
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold mb-2">Customer Information</h4>
                    <div className="text-sm space-y-1 text-gray-600">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedOrder.user?.name ||
                          selectedOrder.shipping_name ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedOrder.user?.email ||
                          selectedOrder.shipping_email ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {selectedOrder.user?.phone ||
                          selectedOrder.shipping_phone ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.shipping_name || ""}</p>
                      <p>{selectedOrder.shipping_address || ""}</p>
                      <p>
                        {selectedOrder.shipping_city || ""},{" "}
                        {selectedOrder.shipping_state || ""}{" "}
                        {selectedOrder.shipping_zip || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-lg">Order Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.order_items?.map((item) => {
                      // Get variant image if available, otherwise product image
                      let itemImage = null;

                      // Priority 1: Variant images from order item's variant object
                      if (
                        item.variant?.images &&
                        item.variant.images.length > 0
                      ) {
                        itemImage = getImageUrl(
                          item.variant.images[0].image_url
                        );
                      }
                      // Priority 2: Product main image
                      else if (item.product?.main_image) {
                        itemImage = getImageUrl(item.product.main_image);
                      }
                      // Priority 3: Product image fallback
                      else if (item.product?.image) {
                        itemImage = getImageUrl(item.product.image);
                      }

                      const variantName =
                        item.variant_name || item.variant?.name || null;
                      const productName = item.product?.name || "Product";
                      const hasVariant = !!variantName;

                      return (
                        <div
                          key={item.id}
                          className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-main transition-colors"
                        >
                          {/* Product/Variant Image - Larger and more prominent */}
                          <div className="flex-shrink-0">
                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={`${productName}${
                                  variantName ? ` - ${variantName}` : ""
                                }`}
                                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border-2 border-gray-200 shadow-md"
                                onError={(e) => {
                                  if (e.target.dataset.error === "true") {
                                    e.target.style.display = "none";
                                    return;
                                  }
                                  e.target.dataset.error = "true";
                                  const canvas =
                                    document.createElement("canvas");
                                  canvas.width = 160;
                                  canvas.height = 160;
                                  const ctx = canvas.getContext("2d");
                                  ctx.fillStyle = "#f3f4f6";
                                  ctx.fillRect(0, 0, 160, 160);
                                  ctx.fillStyle = "#9ca3af";
                                  ctx.font = "14px Arial";
                                  ctx.textAlign = "center";
                                  ctx.fillText("No Image", 80, 80);
                                  e.target.src = canvas.toDataURL();
                                }}
                              />
                            ) : (
                              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-200 flex items-center justify-center rounded-lg border-2 border-gray-300">
                                <span className="text-gray-400 text-sm">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product and Variant Information */}
                          <div className="flex-grow min-w-0">
                            <div className="mb-3">
                              <h5 className="font-bold text-lg text-gray-900 mb-2">
                                {productName}
                              </h5>
                              {hasVariant && (
                                <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-primary-main/10 rounded-md border border-primary-main/20">
                                  <span className="text-xs font-semibold text-primary-main uppercase tracking-wide">
                                    Variant:
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {variantName}
                                  </span>
                                </div>
                              )}
                              {item.variant?.sku && (
                                <p className="text-xs text-gray-500 mb-1">
                                  <strong>SKU:</strong> {item.variant.sku}
                                </p>
                              )}
                              {item.product?.category && (
                                <p className="text-xs text-gray-500">
                                  <strong>Category:</strong>{" "}
                                  {typeof item.product.category === "object"
                                    ? item.product.category.name
                                    : item.product.category}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Quantity:</span>{" "}
                                <span className="font-bold text-primary-main">
                                  {item.quantity}
                                </span>{" "}
                                × {currency.format(item.price || 0)}
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  Item Total:
                                </p>
                                <p className="font-bold text-primary-main text-xl">
                                  {currency.format(
                                    (item.price || 0) * item.quantity
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-xl font-bold text-primary-main">
                      ₹
                      {parseFloat(selectedOrder.total || 0).toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Admin;
