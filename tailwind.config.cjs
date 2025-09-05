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
          teal: '#00E5FF',
          violet: '#9C27FF',
          magenta: '#FF4081',
          gold: '#FFD54F'
        },
        surface: {
          base: '#121212',
          elevated: '#1E1E1E',
          sunken: '#0C0C0C'
        },
        text: {
            primary: '#FFFFFF',
            muted: '#E0E0E0',
            subtle: '#A8A8A8'
        },
        border: {
          DEFAULT: '#262626'
        }
      }
    }
  },
  plugins: []
};
