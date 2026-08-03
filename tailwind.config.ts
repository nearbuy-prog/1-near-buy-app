import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // Nearby palette — locked, no brown as identity
        ivory: "#FBF8F3",
        cream: "#F4EFE6",
        olive: {
          DEFAULT: "#7A8B5C",
          50: "#F1F3EB",
          100: "#DDE3CE",
          200: "#C2CCAB",
          300: "#A3B385",
          400: "#8B9D6E",
          500: "#7A8B5C",
          600: "#5F6E48",
          700: "#475238",
          800: "#323A29",
          900: "#22281C",
        },
        gold: {
          DEFAULT: "#C9A961",
          50: "#FAF5E8",
          100: "#F1E5C2",
          200: "#E5D196",
          300: "#D7BB6F",
          400: "#C9A961",
          500: "#B8964D",
          600: "#967A3D",
          700: "#705B2D",
          800: "#4D3F1F",
          900: "#2C2412",
        },
        charcoal: "#1F1F1F",
        warmgray: {
          DEFAULT: "#8A857C",
          50: "#F7F6F4",
          100: "#EDEBE7",
          200: "#D9D5CD",
          300: "#BEB8AC",
          400: "#A29B8E",
          500: "#8A857C",
          600: "#6E6A62",
          700: "#52504A",
          800: "#383631",
          900: "#1E1D1B",
        },
        terracotta: "#B85C3F",
        sage: "#6B8E5A",
        // Semantic aliases
        background: "#FBF8F3",
        foreground: "#1F1F1F",
        card: "#FFFFFF",
        border: "#E8E2D5",
        muted: "#F4EFE6",
        "muted-foreground": "#8A857C",
        primary: "#7A8B5C",
        "primary-foreground": "#FBF8F3",
        accent: "#C9A961",
        "accent-foreground": "#1F1F1F",
        destructive: "#B85C3F",
        "destructive-foreground": "#FBF8F3",
        success: "#6B8E5A",
        ring: "#7A8B5C",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "Tahoma", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31,31,31,0.04), 0 4px 12px rgba(31,31,31,0.04)",
        "card-hover": "0 2px 4px rgba(31,31,31,0.06), 0 12px 24px rgba(31,31,31,0.08)",
        soft: "0 1px 2px rgba(31,31,31,0.03)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
