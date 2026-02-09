/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#d4af37',
          dark: '#aa8c2c',
        },
        silver: '#c0c0c0',
      },
    },
  },
  plugins: [],
}
