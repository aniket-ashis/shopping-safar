import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { navigation, componentStyles, icons } from "../../config/constants.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { getIcon } from "../../utils/iconMapper.js";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const MenuIcon = getIcon(icons.menu);
  const CloseIcon = getIcon(icons.closeMenu);
  const CartIcon = getIcon(navigation.cartIcon.icon);
  const LogoIcon = getIcon(navigation.logo.icon);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <LogoIcon className="text-2xl text-primary-main" />
            <span className="text-xl font-bold text-primary-main">
              {navigation.logo.text}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.menuItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-1 text-gray-700 hover:text-primary-main transition-colors"
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center space-x-1 text-gray-700 hover:text-primary-main transition-colors"
            >
              <CartIcon className="text-xl" />
              {navigation.cartIcon.showBadge && getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
              <span>Cart</span>
            </Link>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <>
                <Link
                  to={navigation.authButtons.login.path}
                  className={`${componentStyles.button.outline} flex items-center space-x-1`}
                >
                  <span>{navigation.authButtons.login.label}</span>
                </Link>
                <Link
                  to={navigation.authButtons.register.path}
                  className={`${componentStyles.button.primary} flex items-center space-x-1`}
                >
                  <span>{navigation.authButtons.register.label}</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Hi, {user?.name || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className={`${componentStyles.button.outline} flex items-center space-x-1`}
                >
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
          <div className="md:hidden py-4 border-t">
            {navigation.menuItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-main"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-4 pt-4 border-t space-y-2">
              <Link
                to="/cart"
                className="flex items-center space-x-2 py-2 text-gray-700 hover:text-primary-main"
                onClick={() => setIsMenuOpen(false)}
              >
                <CartIcon />
                <span>Cart ({getCartItemCount()})</span>
              </Link>
              {!isAuthenticated ? (
                <>
                  <Link
                    to={navigation.authButtons.login.path}
                    className="block py-2 text-gray-700 hover:text-primary-main"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {navigation.authButtons.login.label}
                  </Link>
                  <Link
                    to={navigation.authButtons.register.path}
                    className="block py-2 text-gray-700 hover:text-primary-main"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {navigation.authButtons.register.label}
                  </Link>
                </>
              ) : (
                <>
                  <div className="py-2 text-gray-700">
                    Hi, {user?.name || "User"}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block py-2 text-gray-700 hover:text-primary-main"
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
