import React, { useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles } from "../config/constants.js";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "Simply browse our products, add items to your cart, and proceed to checkout. You can create an account or continue as a guest.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, and cash on delivery for eligible orders.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 5-7 business days. Express shipping options are available at checkout for faster delivery.",
    },
    {
      question: "Can I return or exchange items?",
      answer:
        "Yes, we offer a 30-day return policy. Items must be in original condition with tags attached. Please contact us for return authorization.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently, we ship within the United States. International shipping may be available for select items. Please contact us for more information.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you will receive a tracking number via email. You can use this to track your package on our website or the carrier's website.",
    },
    {
      question: "What if I receive a damaged item?",
      answer:
        "If you receive a damaged item, please contact us immediately with photos. We will arrange for a replacement or full refund.",
    },
    {
      question: "Do you offer discounts or promotions?",
      answer:
        "Yes! We regularly offer promotions and discounts. Sign up for our newsletter to stay updated on the latest deals and special offers.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

        <div className="max-w-3xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className={componentStyles.card.default}>
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left flex justify-between items-center"
              >
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <span className="text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <p className="mt-4 text-gray-600">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <a href="/contact" className={componentStyles.button.primary}>
            Contact Us
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
