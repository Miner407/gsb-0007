/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0f0f0f",
          secondary: "#1a1a1a",
          tertiary: "#2d2d2d",
        },
        accent: {
          DEFAULT: "#ff6b35",
          hover: "#ff8555",
          glow: "rgba(255, 107, 53, 0.3)",
        },
        gold: {
          DEFAULT: "#f7c59f",
          light: "#fbdcc3",
        },
        text: {
          DEFAULT: "#e0e0e0",
          muted: "#888888",
          dim: "#555555",
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Impact"', 'sans-serif'],
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
        'glow-lg': '0 0 40px rgba(255, 107, 53, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flame': 'flame 1s ease-in-out infinite alternate',
        'count': 'count 0.6s ease-out',
      },
      keyframes: {
        flame: {
          '0%': { transform: 'scale(1) rotate(-2deg)', opacity: '0.9' },
          '100%': { transform: 'scale(1.1) rotate(2deg)', opacity: '1' },
        },
        count: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
