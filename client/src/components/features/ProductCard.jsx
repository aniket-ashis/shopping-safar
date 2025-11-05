import React from "react";
import { Link } from "react-router-dom";
import { componentStyles } from "../../config/constants.js";
import { getIcon } from "../../utils/iconMapper.js";

const ProductCard = ({ product, onAddToCart }) => {
  const StarIcon = getIcon("FaStar");
  const TagIcon = getIcon("FaTag");

  const mainImage =
    product.main_image ||
    product.image ||
    product.variants?.[0]?.images?.[0]?.image_url ||
    "/placeholder.jpg";

  const price = product.minPrice || product.base_price || product.price;
  const hasVariants = product.variantCount > 0;
  const isOutOfStock = product.totalStock === 0;

  return (
    <div className={`${componentStyles.card.hover} relative`}>
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/400x400?text=No+Image";
            }}
          />
          {isOutOfStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </div>
          )}
          {hasVariants && (
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
            ${price}
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
        {product.brand && (
          <p className="text-xs md:text-sm text-gray-500 mb-2">
            {product.brand}
          </p>
        )}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          if (onAddToCart) {
            onAddToCart(product);
          }
        }}
        disabled={isOutOfStock}
        className={`${
          isOutOfStock
            ? "bg-gray-300 cursor-not-allowed"
            : componentStyles.button.primary
        } w-full mt-4 text-sm md:text-base`}
      >
        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
