import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Dark Theme — from brand spec (Part 1A)
        bg: "#090909",
        surface: "#121212",
        card: "#171717",
        hover: "#1E1E1E",
        accent: {
          DEFAULT: "#E53935",
          dim: "#C62F2B",
          bright: "#FF4B45",
        },
        gold: {
          DEFAULT: "#F6C453",
          dim: "#D9A93C",
        },
        leaf: {
          DEFAULT: "#74C043",
        },
        ink: {
          primary: "#FFFFFF",
          secondary: "#B3B3B3",
          muted: "#7A7A7A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      spacing: {
        // 8px baseline system
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.35)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.5)",
        gold: "0 8px 24px rgba(246, 196, 83, 0.15)",
        accentGlow: "0 8px 24px rgba(229, 57, 53, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        fadeUp: "fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        scaleIn: "scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;