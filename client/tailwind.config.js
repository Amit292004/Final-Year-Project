/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#09090b',
        surface: '#111114',
        surfaceCard: '#18181b',
        surfaceBorder: 'rgba(255, 255, 255, 0.08)',
        surfaceHighlight: 'rgba(255, 255, 255, 0.03)',
        brandOrange: '#f97316',
        brandOrangeHover: '#ea580c',
        brandOrangeLight: 'rgba(249, 115, 22, 0.1)',
        brandOrangeBorder: 'rgba(249, 115, 22, 0.25)',
        foreground: '#f4f4f5',
        secondary: '#a1a1aa',
        muted: '#71717a',
        carbon: '#f4f4f5', // Remapped from black to crisp light foreground for dark obsidian theme
        graphite: '#27272a',
        signature: '#F97316',
        burnt: '#f97316',
        ivory: '#09090b', // Updated to obsidian for seamless compatibility
        peach: 'rgba(249, 115, 22, 0.12)',
        neutralLight: '#18181b',
        textPrimary: '#fafafa',
        textSecondary: '#a1a1aa',
        textMuted: '#71717a',
        textDisabled: '#52525b',
        borderStandard: 'rgba(255, 255, 255, 0.08)',
        borderStrong: 'rgba(255, 255, 255, 0.16)',
        semanticSuccess: '#10B981',
        semanticSuccessBg: 'rgba(16, 185, 129, 0.15)',
        semanticWarning: '#F59E0B',
        semanticError: '#EF4444',
        semanticErrorBg: 'rgba(239, 68, 68, 0.15)'
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
      transitionTimingFunction: {
        'custom-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'custom-in-out': 'cubic-bezier(0.77, 0, 0.175, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        zoomIn95: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
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
        fadeIn: 'fadeIn 0.25s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        fadeUp: 'fadeUp 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        fadeDown: 'fadeDown 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        zoomIn95: 'zoomIn95 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        slideInLeft: 'slideInLeft 0.25s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        slideInBottom: 'slideInBottom 0.25s cubic-bezier(0.23, 1, 0.32, 1) forwards',
        shimmer: 'shimmer 1.5s infinite linear',
      }
    },
  },
  plugins: [],
}
