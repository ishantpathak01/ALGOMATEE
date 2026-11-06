/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode
  theme: {
    extend: {
      colors: {
        black_A: "#08080d",
        black_B: "#141826",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif", "Montserrat", "open-sans"],
        teko: ["Teko", "sans-serif"],
      },
      fontSize: {
        xsm: "13px",
      },
      width: {
        120: "600px",
      },
      height: {
        120: "550px",
      },
    },
  },
  plugins: [],
};
