// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         primary: '#0F172A', // Navy Blue (Professional)
//         secondary: '#1E293B',
//         accent: '#3B82F6', // Medical Blue
//       }
//     },
//   },
//   plugins: [],
// }

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Sets Inter as default
      },
      colors: {
        // Our Medical Color Palette
        background: '#F8FAFC', // Very light slate for the app background
        surface: '#FFFFFF',    // Pure white for the Bento cards
        primary: {
          DEFAULT: '#2563EB',  // Clinical Blue
          hover: '#1D4ED8',    // Darker blue for hover states
          light: '#DBEAFE',    // Very light blue for active backgrounds
        },
        text: {
          main: '#0F172A',     // Almost black for readable headings
          muted: '#64748B',    // Gray for secondary text
        },
        status: {
          success: '#10B981',  // Emerald for "In Stock"
          warning: '#F59E0B',  // Amber for "Low Stock"
          danger: '#EF4444',   // Red for "Expired / Error"
        }
      },
      boxShadow: {
        // The signature "Bento" shadow - very soft, diffused, and modern
        'bento': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        // Larger border radius for that friendly, modern feel
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}