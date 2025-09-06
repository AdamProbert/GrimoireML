/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          base: '#0D0D0D', // charcoal
          elevated: '#1C1C1C', // volcanic rock
          sunken: '#2C003E', // void violet-black (used sparingly)
        },
        text: {
          primary: '#FAFAFA',
          muted: '#E0E0E0',
          subtle: '#B5B5B5',
        },
        border: {
          DEFAULT: '#37474F',
        },
        charcoal: '#0D0D0D',
        rock: '#1C1C1C',
        void: '#2C003E',
        ember: '#FF6F00',
        blaze: '#D32F2F',
        gold: '#FFB300',
        mist: '#E0E0E0',
        ivory: '#FAFAFA',
        steel: '#37474F',
      },
      boxShadow: {
        ember: '0 0 0 1px #FF6F001A, 0 0 10px -2px #FF6F0044, 0 0 22px -4px #FFB30033',
        emberStrong:
          '0 0 0 1px #FF6F0040, 0 0 14px -2px #FF6F0070, 0 0 30px -6px #FFB30070',
        voidInset: 'inset 0 0 0 1px #37474F66, inset 0 0 14px -4px #2C003Eaa',
      },
      backgroundImage: {
        'fire-gradient': 'linear-gradient(130deg,#1C1C1C 0%,#2C003E 55%,#1C1C1C 100%)',
        'ember-radial':
          'radial-gradient(circle at 35% 25%,#FF6F0018,#FFB30008 40%,#2C003E00 70%)',
        'ember-bar': 'linear-gradient(90deg,#FF6F00,#FFB300,#FF6F00)',
      },
      keyframes: {
        shimmer: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        heat: {
          '0%': { filter: 'blur(0px) brightness(1)' },
          '50%': { filter: 'blur(0.4px) brightness(1.05)' },
          '100%': { filter: 'blur(0px) brightness(1)' },
        },
      },
      animation: {
        shimmer: 'shimmer 6s ease-in-out infinite',
        heat: 'heat 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
