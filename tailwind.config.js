/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGreen: "#049254",
        customPurple: "#5710B6",
        customYellow: "#F4B915",
        customBlackLight: "#333",
      },
      fontFamily: {
        // padrão do site: Open Sans
        sans: ['var(--font-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        // para títulos: Raleway
        heading: ['var(--font-heading)', 'var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
