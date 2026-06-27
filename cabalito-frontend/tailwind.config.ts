import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial Cabalito
        ink: "#111827",
        paper: "#F3F4F6",
        primary: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          400: "#F59E0B",
          600: "#D97706",
          800: "#92400E",
        },
        tertiary: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          400: "#34D399",
          600: "#059669",
          800: "#065F46",
        },
        // Alias para compatibilidad con clases existentes
        terracota: {
          50: "#FFFBEB",
          200: "#FDE68A",
          400: "#F59E0B",
          600: "#D97706",
          800: "#92400E",
        },
        mercado: {
          50: "#ECFDF5",
          200: "#A7F3D0",
          400: "#34D399",
          600: "#059669",
          800: "#065F46",
        },
        oro: {
          50: "#FFFBEB",
          200: "#FDE68A",
          400: "#F59E0B",
          600: "#D97706",
          800: "#92400E",
        },
        secondary: "#F3F4F6",
        noche: {
          50: "#F9FAFB",
          200: "#D1D5DB",
          400: "#6B7280",
          600: "#374151",
          800: "#111827",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        radarping: {
          "0%": { transform: "scale(0.6)", opacity: "0.9" },
          "70%": { transform: "scale(2.4)", opacity: "0" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        radarping: "radarping 1.8s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
