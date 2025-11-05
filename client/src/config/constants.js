/**
 * CENTRALIZED CONFIGURATION FILE
 * This is the single source of truth for all styling, content, URLs, and configuration
 * across the entire application. Update this file to change themes, content, or branding.
 */

// ============================================================================
// THEME CONFIGURATION - Color Schemes
// ============================================================================
export const theme = {
  colors: {
    primary: {
      main: "#2563eb", // Blue
      light: "#3b82f6",
      dark: "#1d4ed8",
      hover: "#1e40af",
    },
    secondary: {
      main: "#10b981", // Green
      light: "#34d399",
      dark: "#059669",
      hover: "#047857",
    },
    accent: {
      main: "#f59e0b", // Amber
      light: "#fbbf24",
      dark: "#d97706",
      hover: "#b45309",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      dark: "#111827",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
      light: "#9ca3af",
      inverse: "#ffffff",
    },
    border: {
      light: "#e5e7eb",
      medium: "#d1d5db",
      dark: "#9ca3af",
    },
    status: {
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    },
  },
};

// ============================================================================
// TYPOGRAPHY - Font Families, Sizes, Weights
// ============================================================================
export const typography = {
  fontFamily: {
    primary: "'Inter', sans-serif",
    secondary: "'Poppins', sans-serif",
    heading: "'Poppins', sans-serif",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ============================================================================
// SPACING & LAYOUT
// ============================================================================
export const layout = {
  container: {
    maxWidth: "1280px",
    padding: {
      mobile: "1rem",
      desktop: "2rem",
    },
  },
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
  borderRadius: {
    none: "0",
    sm: "0.125rem", // 2px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    "2xl": "1rem", // 16px
    full: "9999px",
  },
};

// ============================================================================
// SITE METADATA
// ============================================================================
export const siteInfo = {
  name: "Shopping Safari",
  tagline: "Your Ultimate Shopping Destination",
  description:
    "Discover amazing products at unbeatable prices. Shop the latest trends and find everything you need.",
  email: "contact@shoppingsafari.com",
  phone: "+91 9204559244",
  address: {
    street: "123 Commerce Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
  },
};

// ============================================================================
// NAVIGATION MENU ITEMS
// ============================================================================
export const navigation = {
  logo: {
    text: "Shopping Safari",
    icon: "FaShoppingBag", // React Icon name
  },
  menuItems: [
    {
      label: "Home",
      path: "/",
      icon: "FaHome",
    },
    {
      label: "Shop",
      path: "/shop",
      icon: "FaStore",
    },
    {
      label: "Catalog",
      path: "/catalog",
      icon: "FaTh",
    },
    {
      label: "About",
      path: "/about",
      icon: "FaInfoCircle",
    },
    {
      label: "Contact",
      path: "/contact",
      icon: "FaEnvelope",
    },
  ],
  authButtons: {
    login: {
      label: "Login",
      path: "/login",
      icon: "FaSignInAlt",
    },
    register: {
      label: "Register",
      path: "/register",
      icon: "FaUserPlus",
    },
    guest: {
      label: "Continue as Guest",
      path: "/guest",
      icon: "FaUser",
    },
  },
  cartIcon: {
    icon: "FaShoppingCart",
    showBadge: true,
  },
};

// ============================================================================
// FOOTER CONFIGURATION
// ============================================================================
export const footer = {
  sections: [
    {
      title: "Quick Links",
      links: [
        { label: "Home", path: "/" },
        { label: "Shop", path: "/shop" },
        { label: "About Us", path: "/about" },
        { label: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { label: "FAQ", path: "/faq" },
        { label: "Shipping", path: "/policies#shipping" },
        { label: "Returns", path: "/policies#returns" },
        { label: "Privacy Policy", path: "/policies#privacy" },
        { label: "Terms of Service", path: "/policies#terms" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Careers", path: "/careers" },
        { label: "Blog", path: "/blog" },
        { label: "Press", path: "/press" },
      ],
    },
  ],
  socialMedia: [
    {
      name: "Facebook",
      url: "https://facebook.com/shoppingsafari",
      icon: "FaFacebook",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/shoppingsafari",
      icon: "FaTwitter",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/shoppingsafari",
      icon: "FaInstagram",
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com/company/shoppingsafari",
      icon: "FaLinkedin",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/shoppingsafari",
      icon: "FaYoutube",
    },
  ],
  contact: {
    address: siteInfo.address,
    email: siteInfo.email,
    phone: siteInfo.phone,
  },
  copyright: {
    text: `© ${new Date().getFullYear()} ${
      siteInfo.name
    }. All rights reserved.`,
  },
};

// ============================================================================
// URLS & API ENDPOINTS
// ============================================================================
export const urls = {
  // Frontend Routes
  routes: {
    home: "/",
    shop: "/shop",
    productDetail: "/product/:id",
    cart: "/cart",
    checkout: "/checkout",
    login: "/login",
    register: "/register",
    guest: "/guest",
    about: "/about",
    contact: "/contact",
    faq: "/faq",
    policies: "/policies",
    catalog: "/catalog",
    profile: "/profile",
    admin: "/admin",
  },
  // Backend API Endpoints
  api: {
    base: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    auth: {
      login: "/auth/login",
      register: "/auth/register",
      logout: "/auth/logout",
      guest: "/auth/guest",
      refresh: "/auth/refresh",
      verify: "/auth/verify",
    },
    products: {
      list: "/products",
      detail: "/products/:id",
      search: "/products/search",
      categories: "/products/categories",
    },
    cart: {
      get: "/cart",
      add: "/cart/add",
      update: "/cart/update",
      remove: "/cart/remove",
      clear: "/cart/clear",
    },
    orders: {
      create: "/orders",
      list: "/orders",
      detail: "/orders/:id",
      cancel: "/orders/:id/cancel",
    },
    users: {
      profile: "/users/profile",
      update: "/users/profile",
      addresses: "/users/addresses",
    },
    variants: {
      list: "/variants/product/:productId",
      detail: "/variants/:id",
    },
    favorites: {
      list: "/favorites",
      add: "/favorites",
      check: "/favorites/check/:productId",
      remove: "/favorites/:productId",
    },
    reviews: {
      list: "/reviews/product/:productId",
      create: "/reviews/product/:productId",
      update: "/reviews/:id",
      delete: "/reviews/:id",
    },
    upload: {
      productMain: "/upload/product/:productId/main",
      variantImage: "/upload/product/:productId/variant/:variantId",
      deleteImage: "/upload/image",
      deleteVariantImage: "/upload/variant-image/:id",
    },
    categories: {
      list: "/categories",
      detail: "/categories/:id",
    },
    brands: {
      list: "/brands",
      detail: "/brands/:id",
    },
  },
};

// ============================================================================
// ICON MAPPINGS (React Icons)
// ============================================================================
export const icons = {
  // Navigation
  home: "FaHome",
  shop: "FaStore",
  catalog: "FaTh",
  about: "FaInfoCircle",
  contact: "FaEnvelope",
  cart: "FaShoppingCart",
  user: "FaUser",
  login: "FaSignInAlt",
  register: "FaUserPlus",
  logout: "FaSignOutAlt",
  // Actions
  search: "FaSearch",
  filter: "FaFilter",
  heart: "FaHeart",
  star: "FaStar",
  plus: "FaPlus",
  minus: "FaMinus",
  edit: "FaEdit",
  delete: "FaTrash",
  close: "FaTimes",
  check: "FaCheck",
  // Social
  facebook: "FaFacebook",
  twitter: "FaTwitter",
  instagram: "FaInstagram",
  linkedin: "FaLinkedin",
  youtube: "FaYoutube",
  // UI
  arrowLeft: "FaArrowLeft",
  arrowRight: "FaArrowRight",
  chevronDown: "FaChevronDown",
  chevronUp: "FaChevronUp",
  menu: "FaBars",
  closeMenu: "FaTimes",
};

// ============================================================================
// COMPONENT STYLES
// ============================================================================
export const componentStyles = {
  button: {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors",
    accent:
      "bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors",
    outline:
      "border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors",
    danger:
      "bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors",
  },
  card: {
    default: "bg-white rounded-lg shadow-md p-6 border border-gray-200",
    hover:
      "bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow",
  },
  input: {
    default:
      "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    error:
      "w-full px-4 py-2 border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
  },
  badge: {
    primary:
      "bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full",
    success:
      "bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full",
    warning:
      "bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full",
    danger:
      "bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full",
  },
};

// ============================================================================
// EXPORT DEFAULT - Complete Configuration Object
// ============================================================================
const config = {
  theme,
  typography,
  layout,
  siteInfo,
  navigation,
  footer,
  urls,
  icons,
  componentStyles,
};

export default config;
