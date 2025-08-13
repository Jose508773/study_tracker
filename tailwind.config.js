/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0A0A0A',
        'secondary': '#1A1A1A',
        'accent': {
          'blue': '#00F5FF',
          'purple': '#9D4EDD',
          'teal': '#00FFD1',
        },
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.accent.blue), 0 0 20px theme(colors.accent.blue)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} 