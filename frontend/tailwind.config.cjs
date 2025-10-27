/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F14',
        sapphire: '#0F52BA',
        emerald: '#00A86B',
        ruby: '#E31B54',
        amethyst: '#9966CC',
        'glass-surface': 'rgba(255,255,255,0.08)',
        'glass-border': 'rgba(255,255,255,0.18)',
        'text-body': 'rgba(255,255,255,0.85)',
        'text-muted': 'rgba(255,255,255,0.65)'
      },
      backgroundImage: {
        'gem-gradient': 'linear-gradient(135deg, #0F52BA 0%, #00A86B 50%, #E31B54 100%)',
        'hero-noise':
          'radial-gradient(circle at 15% 20%, rgba(15,82,186,0.35), transparent 55%), radial-gradient(circle at 85% 15%, rgba(227,27,84,0.28), transparent 58%), radial-gradient(circle at 50% 85%, rgba(0,168,107,0.32), transparent 60%)'
      },
      dropShadow: {
        gem: '0 20px 45px rgba(15, 82, 186, 0.35)',
        emerald: '0 0 25px rgba(0, 168, 107, 0.45)'
      },
      boxShadow: {
        glass: '0 35px 70px rgba(4, 7, 12, 0.55)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      backdropBlur: {
        glass: '12px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      transitionTimingFunction: {
        'gem-ease': 'cubic-bezier(0.4, 0.1, 0.2, 1)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.55 },
          '50%': { opacity: 0.9 }
        }
      },
      animation: {
        float: 'float 14s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 18s ease-in-out infinite'
      }
    }
  },
  plugins: []
};

