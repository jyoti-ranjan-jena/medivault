/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A', // Navy Blue (Professional)
        secondary: '#1E293B',
        accent: '#3B82F6', // Medical Blue
      }
    },
  },
  plugins: [],
}