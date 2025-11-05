import React, { useEffect } from "react";
import { getIcon } from "../../utils/iconMapper.js";
import { theme, componentStyles } from "../../config/constants.js";

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = "info", // success, error, warning, info, confirmation
  primaryButton = {
    label: "OK",
    onClick: null,
    className: "",
  },
  secondaryButton = null,
  children,
  showCloseButton = true,
  autoClose = false,
  autoCloseDelay = 3000,
}) => {
  const CloseIcon = getIcon("FaTimes");
  const SuccessIcon = getIcon("FaCheckCircle");
  const ErrorIcon = getIcon("FaExclamationCircle");
  const WarningIcon = getIcon("FaExclamationTriangle");
  const InfoIcon = getIcon("FaInfoCircle");

  // Auto close functionality
  useEffect(() => {
    if (isOpen && autoClose && type !== "confirmation") {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, type, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Get icon and colors based on type
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: SuccessIcon,
          iconColor: theme.colors.status.success,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          titleColor: "text-green-800",
        };
      case "error":
        return {
          icon: ErrorIcon,
          iconColor: theme.colors.status.error,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          titleColor: "text-red-800",
        };
      case "warning":
        return {
          icon: WarningIcon,
          iconColor: theme.colors.status.warning,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          titleColor: "text-yellow-800",
        };
      case "confirmation":
        return {
          icon: WarningIcon,
          iconColor: theme.colors.status.warning,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          titleColor: "text-blue-800",
        };
      default: // info
        return {
          icon: InfoIcon,
          iconColor: theme.colors.status.info,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          titleColor: "text-blue-800",
        };
    }
  };

  const typeConfig = getTypeConfig();
  const IconComponent = typeConfig.icon;

  const handlePrimaryClick = () => {
    if (primaryButton.onClick) {
      primaryButton.onClick();
    }
    if (type !== "confirmation") {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (secondaryButton?.onClick) {
      secondaryButton.onClick();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-lg shadow-xl max-w-md w-full ${typeConfig.bgColor} border-2 ${typeConfig.borderColor} transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}

          {/* Modal Content */}
          <div className="p-6">
            {/* Icon and Title */}
            <div className="flex items-start space-x-4 mb-4">
              <div className="flex-shrink-0">
                <IconComponent className={`w-8 h-8 ${typeConfig.iconColor}`} />
              </div>
              <div className="flex-1">
                {title && (
                  <h3
                    className={`text-xl font-semibold ${typeConfig.titleColor} mb-2`}
                  >
                    {title}
                  </h3>
                )}
                {message && (
                  <p className="text-gray-700 text-base leading-relaxed">
                    {message}
                  </p>
                )}
                {children && <div className="mt-4">{children}</div>}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              {secondaryButton && (
                <button
                  onClick={handleSecondaryClick}
                  className={`${componentStyles.button.outline} ${
                    secondaryButton.className || ""
                  }`}
                >
                  {secondaryButton.label || "Cancel"}
                </button>
              )}
              <button
                onClick={handlePrimaryClick}
                className={`${componentStyles.button.primary} ${
                  primaryButton.className || ""
                }`}
              >
                {primaryButton.label || "OK"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
