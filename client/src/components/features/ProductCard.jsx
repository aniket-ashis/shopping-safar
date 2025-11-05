import React from "react";
import { Link } from "react-router-dom";
import { componentStyles, currency } from "../../config/constants.js";
import { getIcon } from "../../utils/iconMapper.js";

const ProductCard = ({ product, onAddToCart }) => {
  const StarIcon = getIcon("FaStar");
  const TagIcon = getIcon("FaTag");

  // Helper to construct full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    // If it starts with /, it's a local path - construct full URL
    if (imagePath.startsWith("/")) {
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
      return `${apiBase.replace("/api", "")}${imagePath}`;
    }
    // Otherwise, assume it's a relative path
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${apiBase.replace("/api", "")}/${imagePath}`;
  };

  const mainImage =
    getImageUrl(product.main_image) ||
    getImageUrl(product.image) ||
    getImageUrl(product.variants?.[0]?.images?.[0]?.image_url) ||
    null;

  const price = product.minPrice || product.base_price || product.price;
  const hasVariants = product.variantCount > 0;
  const isActive = product.isActive !== false; // Default to true if not set
  const isOutOfStock = product.totalStock === 0 || !isActive;

  return (
    <div
      className={`${componentStyles.card.hover} relative ${
        !isActive ? "opacity-60" : ""
      }`}
    >
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg mb-4">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className={`w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300 ${
                !isActive ? "grayscale" : ""
              }`}
              onError={(e) => {
                // Prevent infinite loop - if already failed, hide the image
                if (e.target.dataset.error === "true") {
                  e.target.style.display = "none";
                  return;
                }
                e.target.dataset.error = "true";
                // Create a simple placeholder using data URL
                const canvas = document.createElement("canvas");
                canvas.width = 400;
                canvas.height = 400;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#f3f4f6";
                ctx.fillRect(0, 0, 400, 400);
                ctx.fillStyle = "#9ca3af";
                ctx.font = "20px Arial";
                ctx.textAlign = "center";
                ctx.fillText("No Image", 200, 200);
                e.target.src = canvas.toDataURL();
              }}
            />
          ) : (
            <div className="w-full h-48 md:h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          {!isActive && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
              Unavailable
            </div>
          )}
          {isOutOfStock && isActive && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </div>
          )}
          {hasVariants && isActive && (
            <div className="absolute top-2 left-2 bg-primary-main text-white px-2 py-1 rounded text-xs font-semibold flex items-center space-x-1">
              <TagIcon className="text-xs" />
              <span>{product.variantCount} Variants</span>
            </div>
          )}
        </div>
        <h3 className="text-base md:text-lg font-semibold mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-2">
          <p className="text-lg md:text-xl font-bold text-primary-main">
            {currency.format(price)}
            {hasVariants && product.variantCount > 1 && (
              <span className="text-sm text-gray-500 font-normal ml-1">
                from
              </span>
            )}
          </p>
          <div className="flex items-center space-x-1">
            <StarIcon className="text-yellow-400 text-sm md:text-base" />
            <span className="text-xs md:text-sm text-gray-600">
              {product.averageRating?.toFixed(1) || "4.5"}
            </span>
          </div>
        </div>
        {(product.brand?.name || product.brand) && (
          <p className="text-xs md:text-sm text-gray-500 mb-2">
            {product.brand?.name || product.brand}
          </p>
        )}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (onAddToCart && isActive && !isOutOfStock) {
            onAddToCart(product);
          }
        }}
        disabled={isOutOfStock || !isActive}
        className={`${
          isOutOfStock || !isActive
            ? "bg-gray-300 cursor-not-allowed"
            : componentStyles.button.primary
        } w-full mt-4 text-sm md:text-base`}
      >
        {!isActive
          ? "Unavailable"
          : isOutOfStock
          ? "Out of Stock"
          : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
