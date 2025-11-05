import React, { createContext, useContext, useState } from "react";
import Modal from "../components/common/Modal.jsx";

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    primaryButton: { label: "OK", onClick: null },
    secondaryButton: null,
    children: null,
    showCloseButton: true,
    autoClose: false,
    autoCloseDelay: 3000,
  });

  const showModal = ({
    title = "",
    message = "",
    type = "info",
    primaryButton = { label: "OK", onClick: null },
    secondaryButton = null,
    children = null,
    showCloseButton = true,
    autoClose = false,
    autoCloseDelay = 3000,
  }) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      primaryButton,
      secondaryButton,
      children,
      showCloseButton,
      autoClose,
      autoCloseDelay,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Convenience methods
  const showSuccess = (message, title = "Success", options = {}) => {
    showModal({
      title,
      message,
      type: "success",
      autoClose: true,
      ...options,
    });
  };

  const showError = (message, title = "Error", options = {}) => {
    showModal({
      title,
      message,
      type: "error",
      ...options,
    });
  };

  const showWarning = (message, title = "Warning", options = {}) => {
    showModal({
      title,
      message,
      type: "warning",
      ...options,
    });
  };

  const showInfo = (message, title = "Information", options = {}) => {
    showModal({
      title,
      message,
      type: "info",
      autoClose: true,
      ...options,
    });
  };

  const showConfirmation = ({
    message,
    title = "Confirm Action",
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    ...options
  }) => {
    showModal({
      title,
      message,
      type: "confirmation",
      primaryButton: {
        label: confirmLabel,
        onClick: onConfirm,
      },
      secondaryButton: {
        label: cancelLabel,
        onClick: onCancel,
      },
      showCloseButton: false,
      ...options,
    });
  };

  return (
    <ModalContext.Provider
      value={{
        showModal,
        closeModal,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirmation,
      }}
    >
      {children}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        primaryButton={modalState.primaryButton}
        secondaryButton={modalState.secondaryButton}
        children={modalState.children}
        showCloseButton={modalState.showCloseButton}
        autoClose={modalState.autoClose}
        autoCloseDelay={modalState.autoCloseDelay}
      />
    </ModalContext.Provider>
  );
};
