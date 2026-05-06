import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#FFF2EF",
          100: "#FFD9CE",
          200: "#FFB4A0",
          300: "#FF8A6B",
          400: "#FF5F3F",
          500: "#E84322",
          600: "#C73415",
          700: "#A0250E",
          800: "#6B1508",
          900: "#3A0802",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        neutral: {
          0: "#FFFFFF",
          50: "#F9F9F9",
          100: "#F2F2F2",
          200: "#E5E5E5",
          300: "#CCCCCC",
          400: "#999999",
          500: "#666666",
          600: "#4D4D4D",
          700: "#333333",
          800: "#1F1F1F",
          900: "#111111",
        },
        success: { DEFAULT: "#22C55E", bg: "#DCFCE7" },
        warning: { DEFAULT: "#F59E0B", bg: "#FEF3C7" },
        error: { DEFAULT: "#EF4444", bg: "#FEE2E2" },
        info: { DEFAULT: "#3B82F6", bg: "#DBEAFE" },
        urgent: { bg: "#FEE2E2", text: "#E84322" },

        /* Legacy palettes kept temporarily so page migration can happen incrementally. */
        brand: {
          50: "#f5faff",
          100: "#c4e7ff",
          200: "#7cd0ff",
          400: "#007ba7",
          500: "#00658b",
          600: "#006184",
          700: "#004c69",
          800: "#00384d",
          900: "#001e2c",
        },
        surface: {
          DEFAULT: "#f8f9fa",
          raised: "#ffffff",
          sunken: "#f3f4f5",
          high: "#e7e8e9",
          highest: "#e1e3e4",
          variant: "#e1e3e4",
        },
        slateui: {
          500: "#545e76",
          700: "#3f484e",
          900: "#191c1d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Manrope", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        label: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", '"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["0.8125rem", { lineHeight: "1.5" }],
        base: ["0.875rem", { lineHeight: "1.6" }],
        md: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.25rem", { lineHeight: "1.4" }],
        xl: ["1.5rem", { lineHeight: "1.3" }],
        "2xl": ["2rem", { lineHeight: "1.2" }],
        "3xl": ["2.5rem", { lineHeight: "1.1" }],
      },
      spacing: {
        sidebar: "270px",
        topbar: "64px",
      },
      zIndex: {
        dropdown: "100",
        sticky: "200",
        overlay: "300",
        modal: "400",
        popover: "500",
        toast: "600",
        tooltip: "700",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
        sm: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
        md: "0 4px 12px rgba(0, 0, 0, 0.08)",
        lg: "0 8px 24px rgba(0, 0, 0, 0.12)",
        xl: "0 16px 48px rgba(0, 0, 0, 0.16)",
        stat: "0 4px 16px rgba(232, 67, 34, 0.25)",
        focus: "0 0 0 3px rgba(232, 67, 34, 0.2)",
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(90deg, #E84322 0%, #1F1F1F 100%)",
        "gradient-stat": "linear-gradient(135deg, #FF5F3F 0%, #C73415 100%)",
        "gradient-token": "linear-gradient(135deg, #E84322 0%, #1F1F1F 100%)",
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
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
};
