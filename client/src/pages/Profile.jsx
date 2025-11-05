import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { componentStyles, urls } from "../config/constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../utils/api.js";
import { getIcon } from "../utils/iconMapper.js";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    isDefault: false,
  });

  const UserIcon = getIcon("FaUser");
  const MapIcon = getIcon("FaMapMarkerAlt");
  const EditIcon = getIcon("FaEdit");
  const TrashIcon = getIcon("FaTrash");
  const PlusIcon = getIcon("FaPlus");
  const CheckIcon = getIcon("FaCheck");
  const PackageIcon = getIcon("FaBox");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (isAuthenticated && user) {
      loadProfile();
      loadAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, navigate]);

  const loadProfile = async () => {
    try {
      const response = await api.get(urls.api.users.profile);
      const userData = response.data.data || response.data || {};
      setProfileData({
        name: userData.name || user?.name || "",
        email: userData.email || user?.email || "",
        phone: userData.phone || user?.phone || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to user from context
      if (user) {
        setProfileData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      }
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await api.get(urls.api.users.addresses);
      setAddresses(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      setAddresses([]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(urls.api.users.update, profileData);
      const updatedUser = response.data.data || response.data;

      // Update user in localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const newUser = { ...storedUser, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(newUser));

      // Reload profile data to show updated info
      await loadProfile();
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAddress) {
        await api.put(
          `${urls.api.users.addresses}/${editingAddress.id}`,
          addressForm
        );
        alert("Address updated successfully!");
      } else {
        await api.post(urls.api.users.addresses, addressForm);
        alert("Address added successfully!");
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "United States",
        isDefault: false,
      });
      loadAddresses();
    } catch (error) {
      console.error("Address save error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save address. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "United States",
      isDefault: address.is_default || address.isDefault || false,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }
    try {
      await api.delete(`${urls.api.users.addresses}/${addressId}`);
      alert("Address deleted successfully!");
      loadAddresses();
    } catch (error) {
      alert("Failed to delete address. Please try again.");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await api.put(`${urls.api.users.addresses}/${addressId}/set-default`);
      alert("Default address updated!");
      loadAddresses();
    } catch (error) {
      alert("Failed to set default address. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container-custom py-4 md:py-8 px-4 md:px-0">
        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">
          My Account
        </h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6 md:mb-8 overflow-x-auto">
          <div className="flex space-x-4 md:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab("profile")}
              className={`pb-4 px-2 font-semibold whitespace-nowrap ${
                activeTab === "profile"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              <UserIcon className="inline-block mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`pb-4 px-2 font-semibold whitespace-nowrap ${
                activeTab === "addresses"
                  ? "border-b-2 border-primary-main text-primary-main"
                  : "text-gray-600 hover:text-primary-main"
              }`}
            >
              <MapIcon className="inline-block mr-2" />
              Addresses
            </button>
            <Link
              to={urls.routes.orders}
              className="pb-4 px-2 font-semibold whitespace-nowrap text-gray-600 hover:text-primary-main"
            >
              <PackageIcon className="inline-block mr-2" />
              Orders
            </Link>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <div className={componentStyles.card.default}>
              <h2 className="text-2xl font-semibold mb-6">
                Personal Information
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    required
                    className={componentStyles.input.default}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    required
                    className={componentStyles.input.default}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className={componentStyles.input.default}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${componentStyles.button.primary} w-full sm:w-auto`}
                >
                  {loading ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-semibold">
                Saved Addresses
              </h2>
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setShowAddressForm(true);
                    setEditingAddress(null);
                    setAddressForm({
                      name: "",
                      phone: "",
                      street: "",
                      city: "",
                      state: "",
                      zip: "",
                      country: "United States",
                      isDefault: false,
                    });
                  }}
                  className={`${componentStyles.button.primary} flex items-center space-x-2 w-full sm:w-auto`}
                >
                  <PlusIcon />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* Address Form */}
            {showAddressForm && (
              <div className={`${componentStyles.card.default} mb-8`}>
                <h3 className="text-xl font-semibold mb-4">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={addressForm.name}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Recipient name"
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Contact number"
                        className={componentStyles.input.default}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={addressForm.street}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          street: e.target.value,
                        })
                      }
                      required
                      className={componentStyles.input.default}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            city: e.target.value,
                          })
                        }
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            state: e.target.value,
                          })
                        }
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={addressForm.zip}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            zip: e.target.value,
                          })
                        }
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            country: e.target.value,
                          })
                        }
                        required
                        className={componentStyles.input.default}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          isDefault: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary-main"
                    />
                    <label htmlFor="isDefault" className="text-gray-700">
                      Set as default address
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`${componentStyles.button.primary} w-full sm:w-auto`}
                    >
                      {loading
                        ? "Saving..."
                        : editingAddress
                        ? "Update Address"
                        : "Add Address"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                      }}
                      className={`${componentStyles.button.outline} w-full sm:w-auto`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Addresses List */}
            {addresses.length === 0 ? (
              <div
                className={`${componentStyles.card.default} text-center py-12`}
              >
                <MapIcon className="text-5xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No addresses saved yet</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className={componentStyles.button.primary}
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`${componentStyles.card.default} ${
                      address.is_default || address.isDefault
                        ? "border-2 border-primary-main"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        {(address.is_default || address.isDefault) && (
                          <span className="bg-primary-main text-white text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
                            Default
                          </span>
                        )}
                        <h3 className="font-semibold text-lg">
                          {address.is_default || address.isDefault
                            ? "Default Address"
                            : "Address"}
                        </h3>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="text-primary-main hover:text-primary-dark p-1"
                          title="Edit"
                          aria-label="Edit address"
                        >
                          <EditIcon className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete"
                          aria-label="Delete address"
                        >
                          <TrashIcon className="text-lg" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-gray-600">
                      {address.name && (
                        <p className="font-semibold text-gray-900">
                          {address.name}
                        </p>
                      )}
                      {address.phone && (
                        <p className="text-sm">{address.phone}</p>
                      )}
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p>{address.country}</p>
                    </div>
                    {!(address.is_default || address.isDefault) && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className={`${componentStyles.button.outline} mt-4 w-full text-sm`}
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
