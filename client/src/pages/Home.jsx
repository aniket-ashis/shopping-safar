import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { siteInfo, componentStyles, urls, icons } from "../config/constants.js";
import Layout from "../components/layout/Layout.jsx";
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

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-main via-primary-light to-primary-dark text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="container-custom relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              {siteInfo.name}
            </h1>
            <p className="text-2xl md:text-3xl mb-6 font-light">
              {siteInfo.tagline}
            </p>
            <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto opacity-90">
              {siteInfo.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={urls.routes.shop}
                className={`${componentStyles.button.accent} inline-block text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
              >
                Shop Now
              </Link>
              <Link
                to={urls.routes.catalog}
                className={`${componentStyles.button.outline} inline-block text-lg px-10 py-4 rounded-full border-white text-white hover:bg-white hover:text-primary-main transition-all`}
              >
                Browse Catalog
              </Link>
            </div>
          </div>
        </section>

        {/* Features Banner */}
        <section className="bg-white border-b border-gray-200 py-8">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <TruckIcon className="text-3xl text-primary-main" />
                <div>
                  <p className="font-semibold text-sm">Free Shipping</p>
                  <p className="text-xs text-gray-600">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UndoIcon className="text-3xl text-primary-main" />
                <div>
                  <p className="font-semibold text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-600">30-day guarantee</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ShieldIcon className="text-3xl text-primary-main" />
                <div>
                  <p className="font-semibold text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-600">100% protected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <HeadsetIcon className="text-3xl text-primary-main" />
                <div>
                  <p className="font-semibold text-sm">24/7 Support</p>
                  <p className="text-xs text-gray-600">We're here to help</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                    className={`${componentStyles.card.hover} text-center p-8 group`}
                  >
                    <Icon className="text-5xl text-primary-main mb-4 mx-auto group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold">{category.name}</h3>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16">
          <div className="container-custom">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-3xl font-bold">Featured Products</h2>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className={componentStyles.card.hover}
                    >
                      <div className="relative overflow-hidden rounded-lg mb-4">
                        <img
                          src={product.image || "/placeholder.jpg"}
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.stock === 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                            Out of Stock
                          </div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-primary-main">
                          ${product.price}
                        </p>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="text-yellow-400" />
                          <span className="text-sm text-gray-600">4.5</span>
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
        <section className="py-16 bg-gradient-to-r from-accent-main to-accent-dark text-white">
          <div className="container-custom text-center">
            <TagIcon className="text-5xl mb-4 mx-auto" />
            <h2 className="text-4xl font-bold mb-4">Special Offer!</h2>
            <p className="text-xl mb-8">
              Get 20% off on your first order. Use code:{" "}
              <span className="font-bold">WELCOME20</span>
            </p>
            <Link
              to={urls.routes.shop}
              className="bg-white text-accent-main font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors inline-block"
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">
              What Our Customers Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <p className="text-gray-600 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <p className="font-semibold">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-primary-main text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg mb-8 opacity-90">
              Subscribe to our newsletter for exclusive deals and new arrivals
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                className={`${componentStyles.button.accent} px-8 py-3 rounded-lg`}
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
