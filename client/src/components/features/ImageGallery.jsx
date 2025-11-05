import React, { useState } from "react";
import { getIcon } from "../../utils/iconMapper.js";

const ImageGallery = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ChevronLeftIcon = getIcon("FaChevronLeft");
  const ChevronRightIcon = getIcon("FaChevronRight");

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const currentImage =
    images[selectedIndex]?.image_url || images[selectedIndex];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden bg-gray-100">
        <img
          src={currentImage}
          alt={productName || "Product image"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x800?text=No+Image";
          }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="text-xl" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
              aria-label="Next image"
            >
              <ChevronRightIcon className="text-xl" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => {
            const imageUrl = image.image_url || image;
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? "border-primary-main"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`${productName} - View ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100x100?text=No+Image";
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
