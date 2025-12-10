/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Aqui definimos a Open Sans como padrão
        sans: ['"Open Sans"', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: '#000000',
          sidebar: '#09090b',
          'sidebar-text': '#a1a1aa',
          text: '#ffffff',
          primary: '#a855f7', // Roxo (Purple-500)
          secondary: '#27272a',
        }
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    require('tailwind-scrollbar'),
  ],
}