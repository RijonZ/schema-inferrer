/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0f14',
        panel: '#11161d',
        edge: '#1f2630',
        accent: '#7c5cff',
        accent2: '#22d3ee'
      }
    }
  },
  plugins: []
}
