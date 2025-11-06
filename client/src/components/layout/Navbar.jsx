import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  navigation,
  componentStyles,
  icons,
  theme,
  typography,
} from "../../config/constants.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { getIcon } from "../../utils/iconMapper.js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const MenuIcon = getIcon(icons.menu);
  const CloseIcon = getIcon(icons.closeMenu);
  const CartIcon = getIcon(navigation.cartIcon.icon);
  const LogoIcon = getIcon(navigation.logo.icon);
  const ChevronDownIcon = getIcon(icons.chevronDown);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Check if a menu item is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left Side */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
            <LogoIcon
              className="text-2xl"
              style={{ color: theme.colors.primary.main }}
            />
            <span
              className="text-xl font-semibold"
              style={{
                color: theme.colors.text.primary,
                fontFamily: typography.fontFamily.heading,
              }}
            >
              {navigation.logo.text}
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              {navigation.menuItems.map((item) => {
                const isItemActive = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isItemActive
                        ? "bg-gray-100 text-gray-900 font-semibold"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    style={{ fontFamily: typography.fontFamily.primary }}
                  >
                    <span className="flex items-center space-x-1">
                      <span>{item.label}</span>
                      <ChevronDownIcon
                        className={`text-xs transition-transform ${
                          isItemActive ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <CartIcon className="text-xl" />
              {navigation.cartIcon.showBadge && getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <>
                <Link
                  to={navigation.authButtons.login.path}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: typography.fontFamily.primary }}
                >
                  {navigation.authButtons.login.label}
                </Link>
                <Link
                  to={navigation.authButtons.register.path}
                  className={`${componentStyles.button.cta} text-sm`}
                  style={{ fontFamily: typography.fontFamily.primary }}
                >
                  {navigation.authButtons.register.label}
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: typography.fontFamily.primary }}
                >
                  Hi, {user?.name || "User"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  style={{ fontFamily: typography.fontFamily.primary }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <CloseIcon className="text-2xl" />
            ) : (
              <MenuIcon className="text-2xl" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navigation.menuItems.map((item) => {
              const Icon = getIcon(item.icon);
              const isItemActive = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-2.5 px-4 rounded-lg transition-colors ${
                    isItemActive
                      ? "bg-gray-100 text-gray-900 font-semibold"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  style={{ fontFamily: typography.fontFamily.primary }}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
              <Link
                to="/cart"
                className="flex items-center space-x-2 py-2.5 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
                style={{ fontFamily: typography.fontFamily.primary }}
              >
                <CartIcon />
                <span>
                  Cart {getCartItemCount() > 0 && `(${getCartItemCount()})`}
                </span>
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link
                    to={navigation.authButtons.login.path}
                    className="block py-2.5 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ fontFamily: typography.fontFamily.primary }}
                  >
                    {navigation.authButtons.login.label}
                  </Link>
                  <Link
                    to={navigation.authButtons.register.path}
                    className={`${componentStyles.button.cta} block text-center`}
                    onClick={() => setIsMenuOpen(false)}
                    style={{ fontFamily: typography.fontFamily.primary }}
                  >
                    {navigation.authButtons.register.label}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    className="block py-2.5 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                    style={{ fontFamily: typography.fontFamily.primary }}
                  >
                    Hi, {user?.name || "User"}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left py-2.5 px-4 rounded-lg text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium"
                    style={{ fontFamily: typography.fontFamily.primary }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
