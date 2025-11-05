import React, { useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import { siteInfo, componentStyles, icons } from "../config/constants.js";
import { getIcon } from "../utils/iconMapper.js";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const EnvelopeIcon = getIcon("FaEnvelope");
  const PhoneIcon = getIcon("FaPhone");
  const MapMarkerIcon = getIcon("FaMapMarkerAlt");
  const ClockIcon = getIcon("FaClock");
  const FacebookIcon = getIcon("FaFacebook");
  const TwitterIcon = getIcon("FaTwitter");
  const InstagramIcon = getIcon("FaInstagram");

  return (
    <Layout>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-main to-primary-dark text-white py-16">
          <div className="container-custom text-center">
            <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl max-w-2xl mx-auto opacity-90">
              We'd love to hear from you. Get in touch with us!
            </p>
          </div>
        </section>

        <div className="container-custom py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Cards */}
            <div className={componentStyles.card.hover}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-primary-main text-white p-4 rounded-full">
                  <MapMarkerIcon className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Visit Us</h3>
                  <p className="text-gray-600 text-sm">Our Location</p>
                </div>
              </div>
              <p className="text-gray-600">
                {siteInfo.address.street}
                <br />
                {siteInfo.address.city}, {siteInfo.address.state}{" "}
                {siteInfo.address.zip}
              </p>
            </div>

            <div className={componentStyles.card.hover}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-primary-main text-white p-4 rounded-full">
                  <PhoneIcon className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Call Us</h3>
                  <p className="text-gray-600 text-sm">Phone Support</p>
                </div>
              </div>
              <a
                href={`tel:${siteInfo.phone}`}
                className="text-primary-main hover:underline font-semibold"
              >
                {siteInfo.phone}
              </a>
            </div>

            <div className={componentStyles.card.hover}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-primary-main text-white p-4 rounded-full">
                  <EnvelopeIcon className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email Us</h3>
                  <p className="text-gray-600 text-sm">Send us a message</p>
                </div>
              </div>
              <a
                href={`mailto:${siteInfo.email}`}
                className="text-primary-main hover:underline font-semibold"
              >
                {siteInfo.email}
              </a>
            </div>
          </div>

          {/* Main Contact Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className={componentStyles.card.default}>
                <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
                <p className="text-gray-600 mb-6">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>
                {submitted ? (
                  <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 text-white rounded-full p-2">
                        <EnvelopeIcon />
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-green-700 text-sm">
                          Thank you for contacting us. We'll get back to you
                          within 24 hours.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help?"
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        placeholder="Tell us more about your inquiry..."
                        className={componentStyles.input.default}
                      />
                    </div>
                    <button
                      type="submit"
                      className={`${componentStyles.button.primary} w-full text-lg py-3`}
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-6">
              <div className={componentStyles.card.default}>
                <h3 className="text-2xl font-semibold mb-4">Office Hours</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="text-primary-main text-xl" />
                    <div>
                      <p className="font-semibold">Monday - Friday</p>
                      <p className="text-gray-600">9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="text-primary-main text-xl" />
                    <div>
                      <p className="font-semibold">Saturday</p>
                      <p className="text-gray-600">10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="text-primary-main text-xl" />
                    <div>
                      <p className="font-semibold">Sunday</p>
                      <p className="text-gray-600">Closed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={componentStyles.card.default}>
                <h3 className="text-2xl font-semibold mb-4">Follow Us</h3>
                <p className="text-gray-600 mb-4">
                  Stay connected with us on social media for updates and special
                  offers.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com/shoppingsafari"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="text-xl" />
                  </a>
                  <a
                    href="https://twitter.com/shoppingsafari"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-400 text-white p-3 rounded-full hover:bg-blue-500 transition-colors"
                    aria-label="Twitter"
                  >
                    <TwitterIcon className="text-xl" />
                  </a>
                  <a
                    href="https://instagram.com/shoppingsafari"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-pink-600 text-white p-3 rounded-full hover:bg-pink-700 transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="text-xl" />
                  </a>
                </div>
              </div>

              <div className={componentStyles.card.default}>
                <h3 className="text-2xl font-semibold mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Check out our FAQ section for answers to common questions.
                </p>
                <a
                  href="/faq"
                  className={`${componentStyles.button.outline} inline-block`}
                >
                  Visit FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
