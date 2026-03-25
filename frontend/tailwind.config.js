/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        insight: {
          black: '#0a0a0a',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          dark: '#121212',
          card: '#1e1e1e',
        }
      }
    },
  },
  plugins: [],
}
