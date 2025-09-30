/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue,html}"
  ],
  theme: {
    extend: {

      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },



      colors: {
        primary: "oklch(0.827 0.119 306.383)",
        secondary: "oklch(0.714 0.203 305.504)",
        tertiary: "oklch(0.627 0.265 303.9)",
        quaternary: "oklch(0.558 0.288 302.321)",
        quinary: "oklch(0.496 0.265 301.924)",
        senary: "oklch(0.438 0.218 303.724)",
        septenary: "oklch(0.381 0.176 304.987)",
        octonary: "oklch(0.291 0.149 302.717)",
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "3rem",
        },
      },
    },
  },
  plugins: [],
};

