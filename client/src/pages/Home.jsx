import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { siteInfo, componentStyles, urls, icons } from "../config/constants.js";
import Layout from "../components/layout/Layout.jsx";
import ImageSlider from "../components/common/ImageSlider.jsx";
import { getIcon } from "../utils/iconMapper.js";
import api from "../utils/api.js";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.get(urls.api.products.list, {
        params: { limit: 8 },
      });
      const products = response.data.data || response.data || [];
      setFeaturedProducts(Array.isArray(products) ? products.slice(0, 8) : []);
    } catch (error) {
      console.error("Error loading featured products:", error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const TruckIcon = getIcon("FaTruck");
  const ShieldIcon = getIcon("FaShieldAlt");
  const UndoIcon = getIcon("FaUndo");
  const HeadsetIcon = getIcon("FaHeadset");
  const StarIcon = getIcon("FaStar");
  const TagIcon = getIcon("FaTag");

  // Slider images - can be moved to constants or fetched from API
  const sliderImages = [
    {
      url: "/images/slider/slide1.jpg",
      alt: "Shop the latest trends",
    },
    {
      url: "/images/slider/slide2.jpg",
      alt: "Quality products at great prices",
    },
    {
      url: "/images/slider/slide3.jpg",
      alt: "Free shipping on orders over $50",
    },
  ];

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section - Redesigned with text left, image right */}
        <section className="relative bg-white py-12 md:py-20 overflow-hidden">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="text-center md:text-left order-2 md:order-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-gray-900">
                  {siteInfo.name}
                </h1>
                <p className="text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 text-primary-main font-semibold">
                  {siteInfo.tagline}
                </p>
                <p className="text-base md:text-lg mb-6 md:mb-8 text-gray-600 max-w-xl mx-auto md:mx-0">
                  {siteInfo.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link
                    to={urls.routes.shop}
                    className={`${componentStyles.button.primary} inline-block text-base md:text-lg px-8 py-3 md:px-10 md:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-center`}
                  >
                    Shop Now
                  </Link>
                  <Link
                    to={urls.routes.catalog}
                    className={`${componentStyles.button.outline} inline-block text-base md:text-lg px-8 py-3 md:px-10 md:py-4 rounded-full border-primary-main text-primary-main hover:bg-primary-main hover:text-white transition-all text-center`}
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>

              {/* Right Side - Image */}
              <div className="order-1 md:order-2">
                <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero-image.jpg"
                    alt="Shopping Safari"
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
                      canvas.height = 600;
                      const ctx = canvas.getContext("2d");
                      ctx.fillStyle = "#2563eb";
                      ctx.fillRect(0, 0, 800, 600);
                      ctx.fillStyle = "#ffffff";
                      ctx.font = "32px Arial";
                      ctx.textAlign = "center";
                      ctx.fillText("Shopping Safari", 400, 300);
                      e.target.src = canvas.toDataURL();
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Image Slider Section */}
        <section className="py-8 md:py-12 bg-gray-50">
          <div className="container-custom">
            <ImageSlider
              images={sliderImages}
              autoPlay={true}
              interval={5000}
            />
          </div>
        </section>

        {/* Features Banner */}
        <section className="bg-white border-b border-gray-200 py-6 md:py-8">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="flex items-center space-x-2 md:space-x-3">
                <TruckIcon className="text-2xl md:text-3xl text-primary-main flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs md:text-sm">
                    Free Shipping
                  </p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <UndoIcon className="text-2xl md:text-3xl text-primary-main flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs md:text-sm">
                    Easy Returns
                  </p>
                  <p className="text-xs text-gray-600">30-day guarantee</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <ShieldIcon className="text-2xl md:text-3xl text-primary-main flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs md:text-sm">
                    Secure Payment
                  </p>
                  <p className="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <HeadsetIcon className="text-2xl md:text-3xl text-primary-main flex-shrink-0" />
                <div>
                  <p className="font-semibold text-xs md:text-sm">
                    24/7 Support
                  </p>
                  <p className="text-xs text-gray-600">We're here to help</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  name: "Electronics",
                  icon: "FaLaptop",
                  path: "/shop?category=electronics",
                },
                {
                  name: "Clothing",
                  icon: "FaTshirt",
                  path: "/shop?category=clothing",
                },
                { name: "Books", icon: "FaBook", path: "/shop?category=books" },
                {
                  name: "Home & Garden",
                  icon: "FaHome",
                  path: "/shop?category=home",
                },
              ].map((category, index) => {
                const Icon = getIcon(category.icon);
                return (
                  <Link
                    key={index}
                    to={category.path}
                    className={`${componentStyles.card.hover} text-center p-6 md:p-8 group`}
                  >
                    <Icon className="text-4xl md:text-5xl text-primary-main mb-3 md:mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <h3 className="text-base md:text-lg font-semibold">
                      {category.name}
                    </h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container-custom">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold">
                Featured Products
              </h2>
              <Link
                to={urls.routes.shop}
                className="text-primary-main hover:underline font-semibold flex items-center space-x-2"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading featured products...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className={componentStyles.card.hover}
                    >
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={
                            product.main_image ||
                            product.image ||
                            "/placeholder.jpg"
                          }
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {(product.stock === 0 || product.totalStock === 0) && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <h3 className="text-base md:text-lg font-semibold mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg md:text-xl font-bold text-primary-main">
                          ${product.base_price || product.price}
                        </p>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="text-yellow-400 text-sm md:text-base" />
                          <span className="text-xs md:text-sm text-gray-600">
                            4.5
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600">
                      No featured products available
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-accent-main to-accent-dark text-white">
          <div className="container-custom text-center">
            <TagIcon className="text-4xl md:text-5xl mb-4 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Special Offer!
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8">
              Get 20% off on your first order. Use code:{" "}
              <span className="font-bold">WELCOME20</span>
            </p>
            <Link
              to={urls.routes.shop}
              className="bg-white text-accent-main font-semibold px-6 md:px-8 py-2 md:py-3 rounded-full hover:bg-gray-100 transition-colors inline-block"
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  rating: 5,
                  text: "Amazing quality products and excellent customer service. My order arrived on time and in perfect condition!",
                },
                {
                  name: "Michael Chen",
                  rating: 5,
                  text: "Best shopping experience I've had online. Great prices and fast shipping. Highly recommended!",
                },
                {
                  name: "Emily Davis",
                  rating: 5,
                  text: "Love the variety of products and the easy checkout process. Will definitely shop here again!",
                },
              ].map((testimonial, index) => (
                <div key={index} className={componentStyles.card.default}>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic text-sm md:text-base">
                    "{testimonial.text}"
                  </p>
                  <p className="font-semibold">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-12 md:py-16 bg-primary-main text-white">
          <div className="container-custom text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Stay Updated
            </h2>
            <p className="text-base md:text-lg mb-6 md:mb-8 opacity-90">
              Subscribe to our newsletter for exclusive deals and new arrivals
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 md:gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                className={`${componentStyles.button.accent} px-6 md:px-8 py-3 rounded-lg w-full sm:w-auto`}
              >
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
