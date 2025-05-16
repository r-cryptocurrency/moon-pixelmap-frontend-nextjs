/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /(bg-gradient-to-br|from-red-(500|700)|to-orange-(400|700))/ },
  ],
  theme: { extend: {} },
  plugins: [],
};