import React from "react";
import { Link } from "react-router-dom";
import { siteInfo, componentStyles, urls } from "../config/constants.js";
import Layout from "../components/layout/Layout.jsx";

const Home = () => {
  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-main to-primary-dark text-white py-20">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-bold mb-4">{siteInfo.name}</h1>
            <p className="text-xl mb-8">{siteInfo.tagline}</p>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              {siteInfo.description}
            </p>
            <Link
              to={urls.routes.shop}
              className={`${componentStyles.button.accent} inline-block text-lg px-8 py-3`}
            >
              Shop Now
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={componentStyles.card.default}>
                <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                <p className="text-gray-600">
                  Free shipping on orders over $50
                </p>
              </div>
              <div className={componentStyles.card.default}>
                <h3 className="text-xl font-semibold mb-2">Easy Returns</h3>
                <p className="text-gray-600">
                  30-day return policy on all items
                </p>
              </div>
              <div className={componentStyles.card.default}>
                <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                <p className="text-gray-600">
                  Your payment information is safe and secure
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-100 py-16">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Start Shopping?
            </h2>
            <p className="text-gray-600 mb-8">
              Browse our amazing collection of products
            </p>
            <Link
              to={urls.routes.shop}
              className={`${componentStyles.button.primary} inline-block text-lg px-8 py-3`}
            >
              Explore Products
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
