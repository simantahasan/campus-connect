/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          red: '#990000', // Deep Red
          bg: '#f8f9fa',  // Light Grey Background
        }
      }
    },
  },
  plugins: [],
}