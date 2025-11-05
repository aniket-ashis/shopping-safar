import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import ImageGallery from "../components/features/ImageGallery.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviewText, setReviewText] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const StarIcon = getIcon("FaStar");
  const HeartIcon = getIcon("FaHeart");
  const HeartFilledIcon = getIcon("FaHeart");
  const CartIcon = getIcon("FaShoppingCart");
  const ChevronLeftIcon = getIcon("FaChevronLeft");

  useEffect(() => {
    loadProduct();
    if (isAuthenticated) {
      checkFavorite();
    }
  }, [id, isAuthenticated]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        urls.api.products.detail.replace(":id", id)
      );
      const productData = response.data.data || response.data;
      setProduct(productData);

      // Set default variant
      if (productData.variants && productData.variants.length > 0) {
        const defaultVariant =
          productData.variants.find((v) => v.is_default) ||
          productData.variants[0];
        setSelectedVariant(defaultVariant);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      navigate("/shop");
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await api.get(
        urls.api.favorites.check.replace(":productId", id)
      );
      setIsFavorited(response.data.data?.isFavorited || false);
    } catch (error) {
      console.error("Error checking favorite:", error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        "Please login to add favorites. Would you like to login now?"
      );
      if (shouldLogin) {
        navigate("/login");
      }
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await api.delete(urls.api.favorites.remove.replace(":productId", id));
        setIsFavorited(false);
      } else {
        await api.post(urls.api.favorites.add, { productId: id });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite. Please try again.");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        "Please login to add items to cart. Would you like to login now?"
      );
      if (shouldLogin) {
        navigate("/login");
      }
      return;
    }

    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      alert("Please select a variant");
      return;
    }

    const variantId = selectedVariant?.id || null;
    const result = await addToCart(product.id, variantId, quantity);

    if (result.success) {
      alert("Product added to cart!");
    } else {
      if (result.requiresAuth) {
        navigate("/login");
      } else {
        alert(result.error || "Failed to add to cart");
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to submit a review");
      return;
    }

    try {
      await api.post(
        urls.api.reviews.create.replace(":productId", id),
        reviewText
      );
      alert("Review submitted successfully!");
      setReviewText({ rating: 5, title: "", comment: "" });
      setShowReviewForm(false);
      loadProduct(); // Reload to get updated reviews
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
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

  const currentVariant = selectedVariant || product.variants?.[0];
  const images = currentVariant?.images || [
    product.main_image || product.image || "/placeholder.jpg",
  ];
  const price = currentVariant?.price || product.base_price || product.price;
  const stock = currentVariant?.stock || product.totalStock || 0;
  const isOutOfStock = stock === 0;

  // Group variants by attributes (e.g., by color, then by size)
  const variantGroups = {};
  if (product.variants) {
    product.variants.forEach((variant) => {
      const attrs = variant.attributes || {};
      const color = attrs.color || "default";
      if (!variantGroups[color]) {
        variantGroups[color] = [];
      }
      variantGroups[color].push(variant);
    });
  }

  return (
    <Layout>
      <div className="container-custom py-4 md:py-8 px-4 md:px-0">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6 text-primary-main hover:underline flex items-center space-x-2"
        >
          <ChevronLeftIcon />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Product Images */}
          <div>
            <ImageGallery images={images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`${
                      i < Math.round(product.averageRating || 4.5)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.averageRating?.toFixed(1) || "4.5"} (
                {product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="text-3xl md:text-4xl font-bold text-primary-main mb-4">
              ${price}
            </p>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6 space-y-4">
                {Object.entries(variantGroups).map(([color, variants]) => (
                  <div key={color}>
                    <label className="block mb-2 font-semibold text-gray-700">
                      {color !== "default"
                        ? `Color: ${color}`
                        : "Select Variant"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={variant.stock === 0}
                          className={`px-4 py-2 border-2 rounded-lg transition-all ${
                            selectedVariant?.id === variant.id
                              ? "border-primary-main bg-primary-main text-white"
                              : variant.stock === 0
                              ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border-gray-300 hover:border-primary-main"
                          }`}
                        >
                          {variant.name}
                          {variant.stock === 0 && " (Out of Stock)"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Variant Attributes */}
                {selectedVariant?.attributes && (
                  <div className="text-sm text-gray-600">
                    {Object.entries(selectedVariant.attributes).map(
                      ([key, value]) => (
                        <div key={key}>
                          <span className="font-semibold capitalize">
                            {key}:
                          </span>{" "}
                          {value}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <p className="text-red-600 font-semibold">Out of Stock</p>
              ) : (
                <p className="text-green-600 font-semibold">{stock} in stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Quantity:
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(stock || 999, quantity + 1))
                  }
                  disabled={isOutOfStock}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`${
                  isOutOfStock
                    ? "bg-gray-300 cursor-not-allowed"
                    : componentStyles.button.primary
                } flex-1 flex items-center justify-center space-x-2 text-lg py-3`}
              >
                <CartIcon />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`${componentStyles.button.outline} px-6 py-3 flex items-center justify-center space-x-2`}
              >
                {isFavorited ? (
                  <>
                    <HeartFilledIcon className="text-red-500" />
                    <span>Favorited</span>
                  </>
                ) : (
                  <>
                    <HeartIcon />
                    <span>Favorite</span>
                  </>
                )}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6">
              <div className="space-y-2 text-sm text-gray-600">
                {product.brand && (
                  <div>
                    <span className="font-semibold">Brand:</span>{" "}
                    {product.brand}
                  </div>
                )}
                {product.category && (
                  <div>
                    <span className="font-semibold">Category:</span>{" "}
                    {product.category}
                  </div>
                )}
                {selectedVariant?.sku && (
                  <div>
                    <span className="font-semibold">SKU:</span>{" "}
                    {selectedVariant.sku}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description and Reviews */}
        <div className="border-t pt-8">
          <div className="flex space-x-8 border-b mb-6">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-4 px-2 font-semibold ${
                activeTab === "description"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-4 px-2 font-semibold ${
                activeTab === "reviews"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              Reviews ({product.reviews?.length || 0})
            </button>
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">
                {product.description || "No description available."}
              </p>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              {isAuthenticated && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className={componentStyles.button.primary}
                >
                  Write a Review
                </button>
              )}

              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="mb-8 space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">Rating</label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setReviewText({ ...reviewText, rating })
                          }
                          className={`${
                            reviewText.rating >= rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          } text-2xl`}
                        >
                          <StarIcon />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Title</label>
                    <input
                      type="text"
                      value={reviewText.title}
                      onChange={(e) =>
                        setReviewText({ ...reviewText, title: e.target.value })
                      }
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Comment</label>
                    <textarea
                      value={reviewText.comment}
                      onChange={(e) =>
                        setReviewText({
                          ...reviewText,
                          comment: e.target.value,
                        })
                      }
                      rows="4"
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className={componentStyles.button.primary}
                    >
                      Submit Review
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className={componentStyles.button.outline}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-6">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">
                            {review.users?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`${
                                  i < review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">
                    No reviews yet. Be the first to review!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
