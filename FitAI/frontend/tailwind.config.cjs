/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./main.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layout/**/*.{js,ts,jsx,tsx}",
    "./charts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand color
        primary: {
          DEFAULT: '#3B82F6', // Blue-500
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        // Dashboard background
        dashboardBg: {
          DEFAULT: '#F8FAFC', // Slate-50
        },
        // Text colors
        textDark: {
          DEFAULT: '#0F172A', // Slate-900
        },
        // Border colors
        borderGray: {
          DEFAULT: '#E2E8F0', // Slate-200
        },
        // Blue gradient colors
        blueDark: {
          DEFAULT: '#1E40AF', // Blue-800
        },
        blueLight: {
          DEFAULT: '#3B82F6', // Blue-500
        },
        // Secondary blue
        secondaryBlue: {
          DEFAULT: '#60A5FA', // Blue-400
        },
      },
    },
  },
  plugins: [],
}
