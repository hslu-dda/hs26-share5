/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        //ergibt text-swiss-red-100, bg-swiss-red-500, border-swiss-red-600, hover:bg-swiss-red-700 usw.
        'swiss-red':  { 100: '#fae1e2', 500: '#e53940', 600: '#d8232a', 700: '#bf1f25' },
        'swiss-dark': { 500: '#46596b', 600: '#2f4356', 700: '#263645' },
      },
      borderRadius: {
        swiss: '0.1875rem', // ~entspricht dem kleinen Radius im echten Designsystem
      },
    },
  },
  plugins: [],
}

