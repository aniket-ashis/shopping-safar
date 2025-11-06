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
// CURRENCY CONFIGURATION
// ============================================================================
export const currency = {
  symbol: "₹",
  code: "INR",
  name: "Indian Rupee",
  format: (amount) => {
    if (amount === null || amount === undefined) return "₹0";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "₹0";
    return `₹${numAmount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
  name: "shopping Safar",
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
    text: "shopping Safar",
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
      label: "Log in",
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
    orders: "/orders",
    orderDetail: "/orders/:id",
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
      toggleActive: "/products/:id/toggle-active",
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
      admin: {
        all: "/orders/admin/all",
        detail: "/orders/admin/:id",
        updateStatus: "/orders/admin/:id/status",
        cancel: "/orders/admin/:id/cancel",
      },
    },
    users: {
      profile: "/users/profile",
      update: "/users/profile",
      addresses: "/users/addresses",
    },
    variants: {
      list: "/variants/product/:productId",
      detail: "/variants/:id",
      toggleActive: "/variants/:id/toggle-active",
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
    // Lattice-style button (teal/dark green)
    cta: "bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-5 rounded-lg transition-all shadow-sm hover:shadow-md",
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
  cart: {
    itemCard:
      "bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6",
    itemImage:
      "w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gray-200",
    quantityButton:
      "w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-700",
    quantityInput:
      "w-12 h-8 text-center border-0 focus:outline-none focus:ring-0 font-semibold text-gray-900",
    removeButton:
      "text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-all text-sm font-medium",
    summaryCard:
      "bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24",
    emptyState: "text-center py-16 px-4",
    emptyIcon: "w-24 h-24 mx-auto text-gray-300 mb-4",
  },
  home: {
    hero: {
      container:
        "relative min-h-[600px] md:min-h-[700px] flex items-center bg-gradient-to-br from-blue-50 via-white to-purple-50",
      content: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20",
      title: "text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
      subtitle: "text-xl md:text-2xl lg:text-3xl mb-6 font-medium",
      description: "text-lg md:text-xl text-gray-600 mb-8 max-w-2xl",
      ctaGroup: "flex flex-col sm:flex-row gap-4",
    },
    slider: {
      container: "bg-white py-8 md:py-12",
      wrapper: "rounded-2xl overflow-hidden shadow-lg",
    },
    featured: {
      container: "bg-gray-50 py-12 md:py-16",
      header: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8",
      tabs: {
        container: "flex space-x-1 bg-gray-100 p-1 rounded-lg",
        tab: "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all",
        activeTab: "bg-white text-primary-main shadow-sm font-semibold",
        inactiveTab: "text-gray-600 hover:text-gray-900",
      },
      grid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
    },
    category: {
      card: "bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-main transition-all duration-300 p-6 text-center group",
      icon: "w-16 h-16 mx-auto mb-4 text-primary-main group-hover:scale-110 transition-transform",
      name: "text-lg font-semibold text-gray-900",
    },
    testimonial: {
      card: "bg-white rounded-xl shadow-md border border-gray-200 p-6 md:p-8",
      stars: "flex space-x-1 mb-4",
      text: "text-gray-600 italic mb-4 text-sm md:text-base",
      author: "font-semibold text-gray-900",
    },
    newsletter: {
      container:
        "bg-gradient-to-r from-primary-main to-primary-dark text-white py-12 md:py-16",
      form: "max-w-md mx-auto flex flex-col sm:flex-row gap-3",
      input:
        "flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white",
    },
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
