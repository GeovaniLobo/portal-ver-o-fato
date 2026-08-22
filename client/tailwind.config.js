/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'para-red': '#D32F2F',
        'para-blue': '#1976D2',
      }
    },
  },
  plugins: [],
}