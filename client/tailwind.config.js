/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#2563eb",
          light: "#3b82f6",
          dark: "#1d4ed8",
          hover: "#1e40af",
        },
        secondary: {
          main: "#10b981",
          light: "#34d399",
          dark: "#059669",
          hover: "#047857",
        },
        accent: {
          main: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
          hover: "#b45309",
        },
      },
      fontFamily: {
        primary: ["'Inter', sans-serif"],
        secondary: ["'Poppins', sans-serif"],
        heading: ["'Poppins', sans-serif"],
      },
    },
  },
  plugins: [],
};
