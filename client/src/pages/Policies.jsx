import React from "react";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles } from "../config/constants.js";

const Policies = () => {
  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">Policies</h1>

        <div className="max-w-3xl space-y-8">
          {/* Shipping Policy */}
          <section id="shipping" className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Shipping Policy</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We offer standard shipping on all orders. Orders are typically
                processed within 1-2 business days and shipped via our trusted
                carriers.
              </p>
              <h3 className="font-semibold text-gray-900">Shipping Rates</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Free shipping on orders over $50</li>
                <li>Standard shipping: $5.99 (5-7 business days)</li>
                <li>Express shipping: $12.99 (2-3 business days)</li>
              </ul>
              <h3 className="font-semibold text-gray-900">
                International Shipping
              </h3>
              <p>
                Currently, we only ship within the United States. International
                shipping may be available for select products. Please contact us
                for more information.
              </p>
            </div>
          </section>

          {/* Return Policy */}
          <section id="returns" className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Return Policy</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We want you to be completely satisfied with your purchase. If
                you're not happy with your order, you can return it within 30
                days of delivery.
              </p>
              <h3 className="font-semibold text-gray-900">Return Conditions</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Items must be in original condition with tags attached</li>
                <li>Items must be unworn and unused</li>
                <li>Original packaging must be included when possible</li>
                <li>Proof of purchase is required</li>
              </ul>
              <h3 className="font-semibold text-gray-900">How to Return</h3>
              <p>
                Contact our customer service team to initiate a return. We'll
                provide you with a return authorization number and shipping
                instructions.
              </p>
            </div>
          </section>

          {/* Privacy Policy */}
          <section id="privacy" className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                We respect your privacy and are committed to protecting your
                personal information. This policy explains how we collect, use,
                and safeguard your data.
              </p>
              <h3 className="font-semibold text-gray-900">
                Information We Collect
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Shipping and billing addresses</li>
                <li>
                  Payment information (processed securely through our payment
                  providers)
                </li>
                <li>Order history and preferences</li>
              </ul>
              <h3 className="font-semibold text-gray-900">
                How We Use Your Information
              </h3>
              <p>
                We use your information to process orders, communicate with you,
                improve our services, and send you promotional offers (with your
                consent).
              </p>
              <h3 className="font-semibold text-gray-900">Data Security</h3>
              <p>
                We implement industry-standard security measures to protect your
                personal information from unauthorized access, alteration, or
                disclosure.
              </p>
            </div>
          </section>

          {/* Terms of Service */}
          <section id="terms" className={componentStyles.card.default}>
            <h2 className="text-2xl font-semibold mb-4">Terms of Service</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                By using our website, you agree to these terms and conditions.
                Please read them carefully.
              </p>
              <h3 className="font-semibold text-gray-900">Use of Website</h3>
              <p>
                You agree to use our website only for lawful purposes and in a
                way that does not infringe the rights of others or restrict
                their use of the website.
              </p>
              <h3 className="font-semibold text-gray-900">
                Product Information
              </h3>
              <p>
                We strive to provide accurate product information, but we cannot
                guarantee that all descriptions, images, or prices are
                error-free. We reserve the right to correct any errors.
              </p>
              <h3 className="font-semibold text-gray-900">
                Limitation of Liability
              </h3>
              <p>
                Our liability is limited to the maximum extent permitted by law.
                We are not responsible for any indirect or consequential
                damages.
              </p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Policies;
