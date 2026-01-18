/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Strict grayscale-only design system
        // Primary: white, gray-50 to gray-900
        white: '#ffffff',
        gray: {
          50: '#fafafa',   // Light backgrounds
          100: '#f5f5f5',  // Subtle backgrounds
          200: '#e5e5e5',  // Borders
          300: '#d4d4d4',  // Disabled states
          400: '#a3a3a3',  // Placeholder text
          500: '#737373',  // Secondary text
          600: '#525252',  // Muted text
          700: '#404040',  // Body text (alternative)
          800: '#262626',  // Primary text
          900: '#171717',  // Headings and buttons
        },
      },
      backgroundColor: {
        // Enforce grayscale backgrounds only
        DEFAULT: '#ffffff',
        primary: '#ffffff',
        secondary: '#fafafa',
      },
      textColor: {
        // Enforce grayscale text only
        DEFAULT: '#262626',
        primary: '#262626',
        secondary: '#525252',
        muted: '#737373',
      },
      borderColor: {
        // Enforce grayscale borders only
        DEFAULT: '#e5e5e5',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
        normal: '-0.01em',
      },
    },
  },
  plugins: [],
  // Safelist to ensure grayscale utilities are always available
  safelist: [
    'bg-white',
    'bg-gray-50',
    'bg-gray-100',
    'bg-gray-900',
    'text-gray-800',
    'text-gray-900',
    'text-gray-600',
    'text-gray-500',
    'border-gray-200',
  ],
}
