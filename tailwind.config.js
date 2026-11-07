/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0D12',
          secondary: '#121722',
          card: '#191F2B',
          hover: '#222938',
          border: '#2A3447',
        },
        brand: {
          primary: '#7C5CFC',
          secondary: '#A78BFA',
          glow: 'rgba(124, 92, 252, 0.35)',
        },
        status: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        }
      },
      boxShadow: {
        'glow-primary': '0 0 20px -3px rgba(124, 92, 252, 0.4)',
        'glow-accent': '0 0 15px -3px rgba(167, 139, 250, 0.3)',
        'dpad': '0 8px 30px rgba(0, 0, 0, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
        'dpad-btn': '0 4px 10px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
