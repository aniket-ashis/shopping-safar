import React, { useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import { siteInfo, componentStyles } from "../config/constants.js";

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
    // In a real app, this would send the form data to the backend
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <div className={componentStyles.card.default}>
              <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p>
                    {siteInfo.address.street}
                    <br />
                    {siteInfo.address.city}, {siteInfo.address.state}{" "}
                    {siteInfo.address.zip}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a
                    href={`mailto:${siteInfo.email}`}
                    className="text-primary-main hover:underline"
                  >
                    {siteInfo.email}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <a
                    href={`tel:${siteInfo.phone}`}
                    className="text-primary-main hover:underline"
                  >
                    {siteInfo.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className={componentStyles.card.default}>
              <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
              {submitted ? (
                <div className="p-4 bg-green-100 text-green-700 rounded-lg">
                  Thank you for your message! We'll get back to you soon.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-semibold">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className={componentStyles.input.default}
                    />
                  </div>
                  <button
                    type="submit"
                    className={componentStyles.button.primary}
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
