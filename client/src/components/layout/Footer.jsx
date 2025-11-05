import React from "react";
import { Link } from "react-router-dom";
import { footer, icons } from "../../config/constants.js";
import { getIcon } from "../../utils/iconMapper.js";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">
              Shopping Safari
            </h3>
            <p className="mb-4">
              {footer.contact.address.street}
              <br />
              {footer.contact.address.city}, {footer.contact.address.state}{" "}
              {footer.contact.address.zip}
            </p>
            <p className="mb-2">
              <strong>Email:</strong> {footer.contact.email}
            </p>
            <p>
              <strong>Phone:</strong> {footer.contact.phone}
            </p>
          </div>

          {/* Footer Sections */}
          {footer.sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="mb-4 md:mb-0">{footer.copyright.text}</p>
            <div className="flex space-x-4">
              {footer.socialMedia.map((social, index) => {
                const Icon = getIcon(social.icon);
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
