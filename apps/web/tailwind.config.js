/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101418",
        mist: "#eef4ef",
        pine: "#224936",
        ember: "#ff6b35",
        sand: "#f2d9a6"
      },
      boxShadow: {
        panel: "0 24px 80px rgba(16, 20, 24, 0.14)"
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"]
      }
    }
  },
  plugins: []
};
