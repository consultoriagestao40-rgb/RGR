import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        corporate: {
          50: "#f0f4f9",
          100: "#dbe5f2",
          200: "#bbd0e6",
          300: "#8fb3d4",
          400: "#5c91bf",
          500: "#3873a7",
          600: "#275b8c",
          700: "#1e40af", // Royal Blue
          800: "#173663",
          900: "#0f2342",
          950: "#091427",
        },
        slate: {
          850: "#151e2e",
          900: "#0f172a",
          950: "#080d1a",
        },
        emerald: {
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        atlas: {
          50: "#edfcf7",
          100: "#d3f8ea",
          200: "#abf0d7",
          300: "#73e3bf",
          400: "#38cda2",
          500: "#14b388",
          600: "#0ea879", // Atlas Governance primary green
          700: "#0b8b63", // Hover
          800: "#0c6249",
          900: "#0c513e",
          950: "#042e23",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
