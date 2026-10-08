/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0b0f17',
          850: '#0f1420',
          800: '#141b2d',
          750: '#1a2238',
          700: '#1f2942',
          600: '#2b395b',
        },
        cyber: {
          blue: '#00f0ff',
          teal: '#00ffcc',
          purple: '#9d4edd',
          amber: '#ffb703',
          red: '#ff0055',
          green: '#10b981',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 240, 255, 0.25)',
        'glow-teal': '0 0 20px rgba(0, 255, 204, 0.25)',
        'glow-purple': '0 0 20px rgba(157, 78, 221, 0.25)',
        'glow-amber': '0 0 20px rgba(255, 183, 3, 0.25)',
      },
    },
  },
  plugins: [],
}
