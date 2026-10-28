/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#061a2e',
          800: '#082542',
          700: '#0f3861',
          600: '#174d82',
        },
        brand: {
          cyan: '#0097DA',
          hover: '#0284c7',
        }
      }
    },
  },
  plugins: [],
}

