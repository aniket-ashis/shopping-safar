import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

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
          <h1 className="text-3xl font-bold mb-8 text-center">Register</h1>

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
              <label className="block mb-2 font-semibold">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={componentStyles.input.default}
              />
            </div>

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

            <div className="mb-4">
              <label className="block mb-2 font-semibold">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? "Registering..." : "Register"}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to={urls.routes.login}
                  className="text-primary-main hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
