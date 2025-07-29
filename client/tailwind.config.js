/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1C2B64',
        accent: '#FBECB2',
        highlight: '#F8BDEB',
        info: '#5272F2',
        deep: '#072541',
        darkBg: '#0E0D0D',
        gold: '#E2AA4D',
        softLight: '#E2E9ED',
      },
      fontFamily: {
        mont: ['Montserrat', 'sans-serif'],
        nastaliq: ['Noto Nastaliq Urdu', 'serif'],
      },
    },
  },
  plugins: [],
};
