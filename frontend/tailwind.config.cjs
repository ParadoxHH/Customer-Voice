/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        section: '#F7F8FA',
        border: '#EEF0F3',
        heading: '#111827',
        body: '#0B1220',
        muted: '#6B7280',
        sapphire: '#0F52BA',
        emerald: '#00A86B',
        ruby: '#E31B54'
      },
      backgroundImage: {
        'gem-gradient': 'linear-gradient(135deg, #0F52BA 0%, #00A86B 50%, #E31B54 100%)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 14px 35px rgba(15, 18, 32, 0.08)',
        'card-soft': '0 18px 60px rgba(15, 18, 32, 0.06)'
      },
      dropShadow: {
        gem: '0 16px 35px rgba(15, 82, 186, 0.25)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      transitionTimingFunction: {
        'gentle-ease': 'cubic-bezier(0.33, 1, 0.68, 1)'
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 600ms var(--ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)) forwards'
      }
    }
  },
  plugins: []
};

