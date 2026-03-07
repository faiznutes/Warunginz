/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // Force light mode unless 'dark' class is present
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb', // Royal Blue (Blue-600)
          hover: '#1d4ed8',   // Blue-700
          light: '#dbeafe',   // Blue-100
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Role-Based Colors
        'role-super-admin': '#2563eb',  // Blue
        'role-admin-tenant': '#dc2626', // Red
        'role-supervisor': '#f97316',   // Orange
        'role-cashier': '#10b981',      // Green
        'role-kitchen': '#8b5cf6',      // Purple

        // Semantic Colors matches Roles
        'primary-hover': '#1d4ed8',
        'primary-light': '#dbeafe',

        'background-light': '#f9fafb', // Gray-50
        'background-dark': '#1f2937',  // Gray-800
        'surface-light': '#ffffff',
        'surface-dark': '#111827',     // Gray-900 (Sidebar/Cards)

        'text-primary': '#111827',     // Gray-900
        'text-secondary': '#6b7280',   // Gray-500
        'text-muted': '#9ca3af',       // Gray-400
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      boxShadow: {
        "soft": "0 2px 10px rgba(0, 0, 0, 0.03)",
        "card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

