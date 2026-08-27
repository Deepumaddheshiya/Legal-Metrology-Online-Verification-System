import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          primary: "#1E3A8A",
          "primary-light": "#3B82F6",
          "primary-lighter": "#DBEAFE",
          secondary: "#059669",
          "secondary-light": "#D1FAE5",
          warning: "#D97706",
          "warning-light": "#FEF3C7",
          danger: "#DC2626",
          "danger-light": "#FEE2E2",
          gray: {
            900: "#111827",
            700: "#374151",
            500: "#6B7280",
            300: "#D1D5DB",
            100: "#F3F4F6",
            50: "#F9FAFB",
          }
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.1)",
        "card-hover": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
        dropdown: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      borderRadius: {
        gov: "8px",
      }
    },
  },
  plugins: [],
};

export default config;
