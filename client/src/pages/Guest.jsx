import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

const Guest = () => {
  const [loading, setLoading] = useState(false);
  const { guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleGuestLogin = async () => {
    setLoading(true);
    const result = await guestLogin();

    if (result.success) {
      navigate("/");
    } else {
      alert(result.error);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            Continue as Guest
          </h1>

          <div className={componentStyles.card.default}>
            <p className="text-gray-600 mb-6 text-center">
              You can browse and shop without creating an account. However,
              you'll need to create an account to save your preferences and view
              order history.
            </p>

            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className={`${componentStyles.button.primary} w-full mb-4`}
            >
              {loading ? "Processing..." : "Continue Shopping"}
            </button>

            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Want to create an account?{" "}
                <a
                  href="/register"
                  className="text-primary-main hover:underline"
                >
                  Register here
                </a>
              </p>
              <p className="text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-primary-main hover:underline">
                  Login here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Guest;
