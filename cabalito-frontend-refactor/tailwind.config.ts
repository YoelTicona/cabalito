import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14161B",
        paper: "#F7F3EA",
        terracota: {
          50: "#FBEAE2",
          200: "#EFAE93",
          400: "#E07A50",
          600: "#D8572E",
          800: "#8C3014",
        },
        mercado: {
          50: "#EBF2E2",
          200: "#B9D198",
          400: "#82AC59",
          600: "#5B8C3A",
          800: "#385824",
        },
        oro: {
          50: "#FBF1DA",
          200: "#EFCD80",
          400: "#E6B845",
          600: "#E0A526",
          800: "#8A6614",
        },
        noche: {
          50: "#E7ECF1",
          200: "#9FB1C4",
          400: "#4F6A87",
          600: "#2C4159",
          800: "#1A2738",
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
