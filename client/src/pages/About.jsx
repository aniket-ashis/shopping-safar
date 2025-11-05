import React from "react";
import Layout from "../components/layout/Layout.jsx";
import { siteInfo, componentStyles } from "../config/constants.js";

const About = () => {
  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>

        <div className="max-w-3xl space-y-6">
          <div className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Welcome to {siteInfo.name}, your trusted destination for quality
              products and exceptional service. We started with a simple
              mission: to make shopping easy, enjoyable, and accessible to
              everyone.
            </p>
            <p className="text-gray-600">
              Since our founding, we've been committed to providing our
              customers with the best shopping experience, from browsing our
              extensive catalog to receiving your orders with care and attention
              to detail.
            </p>
          </div>

          <div className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-gray-600">
              Our mission is to provide high-quality products at competitive
              prices while maintaining excellent customer service. We believe
              that shopping should be convenient, safe, and enjoyable for
              everyone.
            </p>
          </div>

          <div className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Customer satisfaction is our top priority</li>
              <li>We value integrity and transparency in all our dealings</li>
              <li>We're committed to quality in every product we offer</li>
              <li>We strive for innovation and continuous improvement</li>
              <li>We respect our customers, employees, and partners</li>
            </ul>
          </div>

          <div className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Address:</strong> {siteInfo.address.street},{" "}
                {siteInfo.address.city}, {siteInfo.address.state}{" "}
                {siteInfo.address.zip}
              </p>
              <p>
                <strong>Email:</strong> {siteInfo.email}
              </p>
              <p>
                <strong>Phone:</strong> {siteInfo.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
