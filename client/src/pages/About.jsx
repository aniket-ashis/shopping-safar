import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { siteInfo, componentStyles, urls, icons } from "../config/constants.js";
import { getIcon } from "../utils/iconMapper.js";

const About = () => {
  const StarIcon = getIcon("FaStar");
  const UsersIcon = getIcon("FaUsers");
  const AwardIcon = getIcon("FaAward");
  const HeartIcon = getIcon("FaHeart");
  const GlobeIcon = getIcon("FaGlobe");
  const CheckIcon = getIcon("FaCheck");

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-main to-primary-dark text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-bold mb-4">About {siteInfo.name}</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              Your trusted partner in online shopping since 2020
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-gray-600">
                  <p className="text-lg">
                    Welcome to <strong>{siteInfo.name}</strong>, your trusted
                    destination for quality products and exceptional service. We
                    started with a simple mission: to make shopping easy,
                    enjoyable, and accessible to everyone.
                  </p>
                  <p>
                    Since our founding, we've been committed to providing our
                    customers with the best shopping experience, from browsing
                    our extensive catalog to receiving your orders with care and
                    attention to detail.
                  </p>
                  <p>
                    Today, we serve thousands of satisfied customers worldwide,
                    offering a curated selection of products that meet the
                    highest standards of quality and value.
                  </p>
                </div>
              </div>
              <div
                className={`${componentStyles.card.default} p-8 bg-gradient-to-br from-primary-light to-primary-dark text-white`}
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">10K+</div>
                    <div className="text-sm opacity-90">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">50K+</div>
                    <div className="text-sm opacity-90">Products Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">100+</div>
                    <div className="text-sm opacity-90">Brands</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">24/7</div>
                    <div className="text-sm opacity-90">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={componentStyles.card.default}>
                <AwardIcon className="text-4xl text-primary-main mb-4" />
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-600">
                  Our mission is to provide high-quality products at competitive
                  prices while maintaining excellent customer service. We
                  believe that shopping should be convenient, safe, and
                  enjoyable for everyone.
                </p>
              </div>
              <div className={componentStyles.card.default}>
                <HeartIcon className="text-4xl text-primary-main mb-4" />
                <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
                <ul className="space-y-3 text-gray-600">
                  {[
                    "Customer satisfaction is our top priority",
                    "Integrity and transparency in all dealings",
                    "Commitment to quality in every product",
                    "Innovation and continuous improvement",
                    "Respect for customers, employees, and partners",
                  ].map((value, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckIcon className="text-primary-main mt-1 flex-shrink-0" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16">
          <div className="container-custom">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Choose Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={componentStyles.card.hover}>
                <div className="text-5xl text-primary-main mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
                <p className="text-gray-600">
                  Every product is carefully selected and quality-checked before
                  reaching you.
                </p>
              </div>
              <div className={componentStyles.card.hover}>
                <div className="text-5xl text-primary-main mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
                <p className="text-gray-600">
                  We offer competitive prices and regular discounts to give you
                  the best value.
                </p>
              </div>
              <div className={componentStyles.card.hover}>
                <div className="text-5xl text-primary-main mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick and reliable shipping to get your orders to you as fast
                  as possible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div
              className={`${componentStyles.card.default} max-w-2xl mx-auto text-center`}
            >
              <GlobeIcon className="text-5xl text-primary-main mb-6 mx-auto" />
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Address</p>
                  <p>
                    {siteInfo.address.street}, {siteInfo.address.city},{" "}
                    {siteInfo.address.state} {siteInfo.address.zip}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Email</p>
                  <a
                    href={`mailto:${siteInfo.email}`}
                    className="text-primary-main hover:underline"
                  >
                    {siteInfo.email}
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Phone</p>
                  <a
                    href={`tel:${siteInfo.phone}`}
                    className="text-primary-main hover:underline"
                  >
                    {siteInfo.phone}
                  </a>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to={urls.routes.contact}
                  className={componentStyles.button.primary}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
