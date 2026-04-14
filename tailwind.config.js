/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage:   '#7C9E87',
        forest: '#1B4332',
        cream:  '#FAF7F2',
        charcoal: '#2D2D2D',
        dark: {
          bg:   '#1E1E2E',
          card: '#2A2A3E',
        }
      },
      keyframes: {
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '60%':  { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.35s cubic-bezier(0.32,0.72,0,1)',
        'fade-in':  'fade-in 0.25s ease-out',
        'pop-in':   'pop-in 0.2s ease-out',
      },
    }
  },
  plugins: []
}
