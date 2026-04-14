/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage: '#7C9E87',
        forest: '#1B4332',
        cream: '#FAF7F2',
        charcoal: '#2D2D2D',
        dark: {
          bg: '#1E1E2E',
          card: '#2A2A3E',
        }
      }
    }
  },
  plugins: []
}
