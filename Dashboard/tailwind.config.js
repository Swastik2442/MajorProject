// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        "dash-bg": "#0b1217",
        "card-bg": "#0f1720",
        "muted": "#9ca3af",
        "accent-red": "#ef4444",
        "accent-green": "#10b981",
        "accent-yellow": "#f59e0b",
      },
    },
  },
  plugins: [],
};
