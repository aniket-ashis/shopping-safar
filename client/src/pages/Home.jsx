import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  siteInfo,
  componentStyles,
  urls,
  icons,
  theme,
  typography,
  currency,
} from "../config/constants.js";
import Layout from "../components/layout/Layout.jsx";
import ImageSlider from "../components/common/ImageSlider.jsx";
import ProductCard from "../components/features/ProductCard.jsx";
import { getIcon } from "../utils/iconMapper.js";
import api from "../utils/api.js";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [productsByCategory, setProductsByCategory] = useState({});

  useEffect(() => {
    loadFeaturedProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (activeTab !== "all") {
      loadProductsByCategory(activeTab);
    }
  }, [activeTab]);

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

  const loadCategories = async () => {
    try {
      const response = await api.get(urls.api.categories.list);
      const cats = response.data.data || response.data || [];
      setCategories(Array.isArray(cats) ? cats.slice(0, 4) : []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProductsByCategory = async (categoryId) => {
    if (productsByCategory[categoryId]) return; // Already loaded

    try {
      const response = await api.get(urls.api.products.list, {
        params: { category: categoryId, limit: 8 },
      });
      const products = response.data.data || response.data || [];
      setProductsByCategory((prev) => ({
        ...prev,
        [categoryId]: Array.isArray(products) ? products.slice(0, 8) : [],
      }));
    } catch (error) {
      console.error("Error loading products by category:", error);
      setProductsByCategory((prev) => ({
        ...prev,
        [categoryId]: [],
      }));
    }
  };

  const TruckIcon = getIcon("FaTruck");
  const ShieldIcon = getIcon("FaShieldAlt");
  const UndoIcon = getIcon("FaUndo");
  const HeadsetIcon = getIcon("FaHeadset");
  const StarIcon = getIcon("FaStar");
  const TagIcon = getIcon("FaTag");
  const ArrowRightIcon = getIcon("FaArrowRight");
  const ShoppingBagIcon = getIcon("FaShoppingBag");
  const SparklesIcon = getIcon("FaSparkles");

  // Slider images
  const sliderImages = [
    {
      url: "/images/slider/slide1.jpg",
      alt: "Shop the latest trends",
      title: "New Collection Arrived",
      subtitle: "Discover the latest trends",
    },
    {
      url: "/images/slider/slide2.jpg",
      alt: "Quality products at great prices",
      title: "Best Prices Guaranteed",
      subtitle: "Quality products at unbeatable prices",
    },
    {
      url: "/images/slider/slide3.jpg",
      alt: "Free shipping on orders over $50",
      title: "Free Shipping",
      subtitle: "On orders over ₹500",
    },
  ];

  const getDisplayProducts = () => {
    if (activeTab === "all") {
      return featuredProducts;
    }
    return productsByCategory[activeTab] || [];
  };

  const displayProducts = getDisplayProducts();

  return (
    <Layout>
      <div className="bg-white" style={{ fontFamily: typography.fontFamily.primary }}>
        {/* Hero Section */}
        <section className={componentStyles.home.hero.container}>
          <div className={componentStyles.home.hero.content}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Content */}
              <div className="text-center lg:text-left order-2 lg:order-1">
                <div className="inline-flex items-center space-x-2 bg-primary-main/10 text-primary-main px-4 py-2 rounded-full mb-6 text-sm font-semibold">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Welcome to {siteInfo.name}</span>
                </div>
                <h1
                  className={componentStyles.home.hero.title}
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: typography.fontFamily.heading,
                  }}
                >
                  {siteInfo.tagline}
                </h1>
                <p
                  className={componentStyles.home.hero.description}
                  style={{ color: theme.colors.text.secondary }}
                >
                  {siteInfo.description}
                </p>
                <div className={componentStyles.home.hero.ctaGroup}>
                  <Link
                    to={urls.routes.shop}
                    className={`${componentStyles.button.primary} inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
                  >
                    <ShoppingBagIcon />
                    <span>Shop Now</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to={urls.routes.catalog}
                    className={`${componentStyles.button.outline} inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-lg text-lg border-2 border-primary-main text-primary-main hover:bg-primary-main hover:text-white transition-all`}
                  >
                    <span>Browse Catalog</span>
                  </Link>
                </div>
              </div>

              {/* Right Side - Image/Illustration */}
              <div className="order-1 lg:order-2 relative">
                <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary-main to-primary-dark flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
                    }}
                  >
                    <ShoppingBagIcon className="w-32 h-32 md:w-48 md:h-48 text-white opacity-20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Banner */}
        <section className="bg-white border-b border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full bg-primary-main/10 flex items-center justify-center mb-4"
                  style={{ color: theme.colors.primary.main }}
                >
                  <TruckIcon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  Free Shipping
                </h3>
                <p className="text-xs text-gray-600">On orders over ₹500</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4"
                  style={{ color: theme.colors.status.success }}
                >
                  <UndoIcon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  Easy Returns
                </h3>
                <p className="text-xs text-gray-600">30-day guarantee</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4"
                  style={{ color: theme.colors.status.info }}
                >
                  <ShieldIcon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  Secure Payment
                </h3>
                <p className="text-xs text-gray-600">100% protected</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4"
                  style={{ color: theme.colors.primary.dark }}
                >
                  <HeadsetIcon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-sm md:text-base mb-1">
                  24/7 Support
                </h3>
                <p className="text-xs text-gray-600">We're here to help</p>
              </div>
            </div>
          </div>
        </section>

        {/* Image Slider Section */}
        <section className={componentStyles.home.slider.container}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={componentStyles.home.slider.wrapper}>
              <ImageSlider
                images={sliderImages}
                autoPlay={true}
                interval={5000}
              />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{
                    color: theme.colors.text.primary,
                    fontFamily: typography.fontFamily.heading,
                  }}
                >
                  Shop by Category
                </h2>
                <p className="text-gray-600 text-lg">
                  Discover our wide range of products
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {categories.map((category) => {
                  const CategoryIcon = getIcon("FaTag");
                  return (
                    <Link
                      key={category.id}
                      to={`/shop?category=${category.slug || category.name}`}
                      className={componentStyles.home.category.card}
                    >
                      <div className={componentStyles.home.category.icon}>
                        <CategoryIcon className="w-full h-full" />
                      </div>
                      <h3 className={componentStyles.home.category.name}>
                        {category.name}
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section with Tabs */}
        <section className={componentStyles.home.featured.container}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={componentStyles.home.featured.header}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2
                    className="text-3xl md:text-4xl font-bold mb-2"
                    style={{
                      color: theme.colors.text.primary,
                      fontFamily: typography.fontFamily.heading,
                    }}
                  >
                    Featured Products
                  </h2>
                  <p className="text-gray-600">
                    Handpicked products just for you
                  </p>
                </div>
                <Link
                  to={urls.routes.shop}
                  className="flex items-center space-x-2 text-primary-main hover:text-primary-dark font-semibold transition-colors"
                >
                  <span>View All</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </div>

              {/* Category Tabs */}
              <div className={componentStyles.home.featured.tabs.container}>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`${
                    activeTab === "all"
                      ? componentStyles.home.featured.tabs.activeTab
                      : componentStyles.home.featured.tabs.inactiveTab
                  }`}
                  style={{
                    fontFamily: typography.fontFamily.primary,
                  }}
                >
                  All Products
                </button>
                {categories.slice(0, 4).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`${
                      activeTab === category.id
                        ? componentStyles.home.featured.tabs.activeTab
                        : componentStyles.home.featured.tabs.inactiveTab
                    }`}
                    style={{
                      fontFamily: typography.fontFamily.primary,
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : displayProducts.length > 0 ? (
              <div className={componentStyles.home.featured.grid}>
                {displayProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 text-lg">
                  No products available in this category
                </p>
                <Link
                  to={urls.routes.shop}
                  className={`${componentStyles.button.primary} inline-block mt-4`}
                >
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="bg-gradient-to-r from-accent-main to-accent-dark text-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <TagIcon className="text-5xl md:text-6xl mb-6 mx-auto opacity-90" />
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: typography.fontFamily.heading }}
            >
              Special Offer!
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-95">
              Get 20% off on your first order. Use code:{" "}
              <span className="font-bold bg-white/20 px-3 py-1 rounded-lg">
                WELCOME20
              </span>
            </p>
            <Link
              to={urls.routes.shop}
              className="bg-white text-accent-main font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ShoppingBagIcon />
              <span>Shop Now</span>
            </Link>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{
                  color: theme.colors.text.primary,
                  fontFamily: typography.fontFamily.heading,
                }}
              >
                What Our Customers Say
              </h2>
              <p className="text-gray-600 text-lg">
                Real reviews from satisfied customers
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: "Sarah Johnson",
                  rating: 5,
                  text: "Amazing quality products and excellent customer service. My order arrived on time and in perfect condition!",
                  location: "Mumbai, India",
                },
                {
                  name: "Michael Chen",
                  rating: 5,
                  text: "Best shopping experience I've had online. Great prices and fast shipping. Highly recommended!",
                  location: "Delhi, India",
                },
                {
                  name: "Emily Davis",
                  rating: 5,
                  text: "Love the variety of products and the easy checkout process. Will definitely shop here again!",
                  location: "Bangalore, India",
                },
              ].map((testimonial, index) => (
                <div key={index} className={componentStyles.home.testimonial.card}>
                  <div className={componentStyles.home.testimonial.stars}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className="text-yellow-400 w-5 h-5"
                        style={{ fill: "currentColor" }}
                      />
                    ))}
                  </div>
                  <p className={componentStyles.home.testimonial.text}>
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className={componentStyles.home.testimonial.author}>
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className={componentStyles.home.newsletter.container}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: typography.fontFamily.heading }}
            >
              Stay Updated
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-95">
              Subscribe to our newsletter for exclusive deals and new arrivals
            </p>
            <form className={componentStyles.home.newsletter.form}>
              <input
                type="email"
                placeholder="Enter your email"
                className={componentStyles.home.newsletter.input}
                required
              />
              <button
                type="submit"
                className={`${componentStyles.button.accent} px-8 py-3 rounded-lg w-full sm:w-auto shadow-lg hover:shadow-xl`}
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
