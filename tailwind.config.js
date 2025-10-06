// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // colors: {
      //   primary: '#0f766e', // Dark teal/blue-green from logo
      //   secondary: '#a16207', // Brown from logo
      //   accent: '#94a3b8', // Light gray from logo
      //   success: '#059669', // Emerald green - complements the teal
      //   warning: '#d97706', // Amber orange - complements the brown
      // },
      // fontFamily: {
      //   sans: ['Inter', 'sans-serif'],
      //   serif: ['Merriweather', 'serif'],
      // },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
