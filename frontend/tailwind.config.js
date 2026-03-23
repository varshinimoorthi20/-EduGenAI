/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    "bg-indigo-100","text-indigo-600",
    "bg-blue-100","text-blue-600",
    "bg-cyan-100","text-cyan-600",
    "bg-emerald-100","text-emerald-600",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
