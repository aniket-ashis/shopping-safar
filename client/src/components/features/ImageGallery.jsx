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

  const currentImage = getImageUrl(
    images[selectedIndex]?.image_url || images[selectedIndex]
  );

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
            // Prevent infinite loop
            if (e.target.dataset.error === "true") {
              e.target.style.display = "none";
              return;
            }
            e.target.dataset.error = "true";
            // Create a simple placeholder using data URL
            const canvas = document.createElement("canvas");
            canvas.width = 800;
            canvas.height = 800;
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#f3f4f6";
            ctx.fillRect(0, 0, 800, 800);
            ctx.fillStyle = "#9ca3af";
            ctx.font = "24px Arial";
            ctx.textAlign = "center";
            ctx.fillText("No Image", 400, 400);
            e.target.src = canvas.toDataURL();
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
            const imageUrl = getImageUrl(image.image_url || image);
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
                    // Prevent infinite loop
                    if (e.target.dataset.error === "true") {
                      e.target.style.display = "none";
                      return;
                    }
                    e.target.dataset.error = "true";
                    // Create a simple placeholder using data URL
                    const canvas = document.createElement("canvas");
                    canvas.width = 100;
                    canvas.height = 100;
                    const ctx = canvas.getContext("2d");
                    ctx.fillStyle = "#f3f4f6";
                    ctx.fillRect(0, 0, 100, 100);
                    ctx.fillStyle = "#9ca3af";
                    ctx.font = "12px Arial";
                    ctx.textAlign = "center";
                    ctx.fillText("No Img", 50, 50);
                    e.target.src = canvas.toDataURL();
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
