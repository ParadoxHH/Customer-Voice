/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F14',
        sapphire: '#0F52BA',
        emerald: '#00A86B',
        ruby: '#E31B54',
        amethyst: '#9966CC',
        glass: 'rgba(255,255,255,0.08)'
      },
      backgroundImage: {
        'gem-gradient': 'linear-gradient(135deg, #0F52BA 0%, #00A86B 50%, #E31B54 100%)'
      },
      borderRadius: {
        '4xl': '2rem'
      },
      dropShadow: {
        glow: '0 12px 35px rgba(15, 82, 186, 0.35)'
      },
      backdropBlur: {
        glass: '12px'
      },
      boxShadow: {
        glass: '0 24px 60px rgba(0, 0, 0, 0.25)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
