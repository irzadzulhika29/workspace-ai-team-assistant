/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f5faff',
          100: '#c4e7ff',
          200: '#7cd0ff',
          400: '#007ba7',
          500: '#00658b',
          600: '#006184',
          700: '#004c69',
          800: '#00384d',
          900: '#001e2c',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          raised: '#ffffff',
          sunken: '#f3f4f5',
          high: '#e7e8e9',
          highest: '#e1e3e4',
          variant: '#e1e3e4',
        },
        slateui: {
          500: '#545e76',
          700: '#3f484e',
          900: '#191c1d',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
