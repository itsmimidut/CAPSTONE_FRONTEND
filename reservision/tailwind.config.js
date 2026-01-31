/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2B6CB0',
        'accent-blue': '#63B3ED',
        'warm-brown': '#C19A6B',
        'deep-brown': '#8B5E3C',
        'neutral-gray': '#F5F5F5',
      },
    },
  },
  plugins: [],
}