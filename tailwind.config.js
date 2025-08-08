/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Ensure this aligns with how you apply dark mode
  theme: {
     
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('tailwindcss'),
    require('autoprefixer'),
  ],

  
}

