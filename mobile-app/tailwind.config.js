/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand
        primary: "#2563EB",       // Blue 600 — main CTA
        "primary-dark": "#1D4ED8",
        "primary-light": "#DBEAFE",

        // Status colors (mapped to order statuses)
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        info: "#0891B2",

        // Neutral palette
        ink: "#0F172A",           // Slate 900 — headings
        "ink-soft": "#475569",    // Slate 600 — body text
        muted: "#94A3B8",         // Slate 400 — placeholders
        border: "#E2E8F0",        // Slate 200
        surface: "#F8FAFC",       // Slate 50 — page bg
        card: "#FFFFFF",
      },
      fontFamily: {
        sans: ["System"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};