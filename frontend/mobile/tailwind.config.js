/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'din-bold': ['FONTSPRING DEMO - DIN 2014 Rounded Bold'],
        'din-demi': ['FONTSPRING DEMO - DIN 2014 Rounded Demi'],
        'feather':  ['Feather Bold NC'],
      },
    },
  },
  plugins: [],
};
