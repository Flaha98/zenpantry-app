/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sage:   '#52796F',
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
        // Bell shake — triggered on hover when notifications are pending
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(-16deg)' },
          '30%': { transform: 'rotate(16deg)' },
          '45%': { transform: 'rotate(-10deg)' },
          '60%': { transform: 'rotate(10deg)' },
          '75%': { transform: 'rotate(-5deg)' },
        },
        // Pulsing ring for the FAB — draws attention to the primary action
        'ring-pulse': {
          '0%':   { boxShadow: '0 0 0 0px rgba(249,115,22,0.45)' },
          '70%':  { boxShadow: '0 0 0 12px rgba(249,115,22,0)' },
          '100%': { boxShadow: '0 0 0 0px rgba(249,115,22,0)' },
        },
        // Gentle float for the help button
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        // Shimmer sweep across the progress bar fill
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
        // Notification item emoji — quick bounce on row hover
        'bounce-emoji': {
          '0%':   { transform: 'scale(1)    translateY(0)' },
          '30%':  { transform: 'scale(1.25) translateY(-6px) rotate(-8deg)' },
          '55%':  { transform: 'scale(1.15) translateY(-3px) rotate(6deg)' },
          '75%':  { transform: 'scale(1.05) translateY(-1px) rotate(-3deg)' },
          '100%': { transform: 'scale(1)    translateY(0)   rotate(0deg)' },
        },
        // Greeting emoji — wave hello on mount, then idles
        'wave': {
          '0%':   { transform: 'scale(1)    rotate(0deg)' },
          '10%':  { transform: 'scale(1.2)  rotate(-12deg)' },
          '20%':  { transform: 'scale(1.2)  rotate(12deg)' },
          '30%':  { transform: 'scale(1.15) rotate(-7deg)' },
          '40%':  { transform: 'scale(1.05) rotate(4deg)' },
          '50%':  { transform: 'scale(1)    rotate(0deg)' },
          '100%': { transform: 'scale(1)    rotate(0deg)' },
        },
        // Soft halo behind the greeting emoji
        'glow-pulse': {
          '0%, 100%': { opacity: '0',   transform: 'scale(1)' },
          '50%':      { opacity: '0.55', transform: 'scale(1.5)' },
        },
        // Toast entry — drops in from just above the header
        'slide-down': {
          from: { transform: 'translateY(-120%)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
      },
      animation: {
        'slide-up':   'slide-up 0.35s cubic-bezier(0.32,0.72,0,1)',
        'fade-in':    'fade-in 0.25s ease-out',
        'pop-in':     'pop-in 0.2s ease-out',
        'wiggle':     'wiggle 0.5s ease-in-out',
        'ring-pulse': 'ring-pulse 2s ease-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2.2s ease-in-out infinite',
        'slide-down':  'slide-down 0.3s cubic-bezier(0.32,0.72,0,1)',
        'bounce-emoji': 'bounce-emoji 0.45s cubic-bezier(0.36,0.07,0.19,0.97)',
        'wave':         'wave 3s ease-in-out infinite',
        'glow-pulse':  'glow-pulse 2.5s ease-in-out infinite',
      },
    }
  },
  plugins: []
}
