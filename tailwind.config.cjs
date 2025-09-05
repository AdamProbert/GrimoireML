/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f6ff',
          100: '#e6e8ff',
          200: '#c2c9fe',
          300: '#9da9fd',
          400: '#7583fa',
          500: '#4d5ef7',
          600: '#3644d4',
          700: '#2833a7',
          800: '#1b2379',
          900: '#10184f'
        }
      }
    }
  },
  plugins: []
};
