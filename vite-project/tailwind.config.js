/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          light: '#A78BFA',
        },
        background: {
          DEFAULT: '#0F0F0F',
          secondary: '#1A1A1A',
          tertiary: '#2D2D2D',
        },
      },
    },
  },
  plugins: [],
}

