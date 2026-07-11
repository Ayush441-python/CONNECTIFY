/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#EC1380',
          'pink-light': '#F6459E',
          purple: '#7C3AED',
          'purple-dark': '#5B21B6',
        },
        ink: '#150F1F',
        canvas: '#FDFCFF',
        mist: '#F5F1FB',
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(115deg, #EC1380 0%, #B421B8 50%, #7C3AED 100%)',
        'brand-gradient-soft': 'linear-gradient(115deg, rgba(236,19,128,0.12) 0%, rgba(124,58,237,0.12) 100%)',
        'radial-fade': 'radial-gradient(circle at top right, rgba(236,19,128,0.18), transparent 60%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(90, 30, 120, 0.10)',
        'glass-lg': '0 20px 60px rgba(90, 30, 120, 0.16)',
        glow: '0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(236,19,128,0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-14px) rotate(1.5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
