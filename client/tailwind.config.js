/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: '#171717',
        graphite: '#262626',
        signature: '#F97316',
        burnt: '#EA580C',
        ivory: '#F7F5F0',
        peach: '#FFF0E5',
        neutralLight: '#F3F2EF',
        textPrimary: '#171717',
        textSecondary: '#525252',
        textMuted: '#737373',
        textDisabled: '#A3A3A3',
        borderStandard: '#E7E5E4',
        borderStrong: '#D6D3D1',
        semanticSuccess: '#15803D',
        semanticSuccessBg: '#DCEFE5',
        semanticWarning: '#B45309',
        semanticError: '#B42318',
        semanticErrorBg: '#FEECEC'
      },
      fontFamily: {
        headline: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        standard: '12px',
        card: '14px',
        btn: '9px',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        soft: '0 4px 20px -2px rgba(23, 23, 23, 0.05)',
        elevated: '0 12px 32px -4px rgba(23, 23, 23, 0.08), 0 4px 12px -2px rgba(23, 23, 23, 0.04)',
        glow: '0 0 25px -5px rgba(249, 115, 22, 0.25)',
        glowEmerald: '0 0 25px -5px rgba(21, 128, 61, 0.25)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn95: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        zoomIn95: 'zoomIn95 0.15s ease-out forwards',
        slideInLeft: 'slideInLeft 0.2s ease-out forwards',
        slideInBottom: 'slideInBottom 0.2s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite linear',
      }
    },
  },
  plugins: [],
}
