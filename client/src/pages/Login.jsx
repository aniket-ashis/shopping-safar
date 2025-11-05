import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Login</h1>

          <form
            onSubmit={handleSubmit}
            className={componentStyles.card.default}
          >
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="mb-4">
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

            <div className="mb-4">
              <label className="block mb-2 font-semibold">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={componentStyles.input.default}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${componentStyles.button.primary} w-full mb-4`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center space-y-2">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  to={urls.routes.register}
                  className="text-primary-main hover:underline"
                >
                  Register here
                </Link>
              </p>
              <Link
                to={urls.routes.guest}
                className="block text-primary-main hover:underline"
              >
                Continue as Guest
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
