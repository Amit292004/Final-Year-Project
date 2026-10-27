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
        headline: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        standard: '12px',
        btn: '9px',
      }
    },
  },
  plugins: [],
}
