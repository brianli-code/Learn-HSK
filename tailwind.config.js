/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
  content: [
    "./renderer/**/*.{html,js}",
    "./index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}