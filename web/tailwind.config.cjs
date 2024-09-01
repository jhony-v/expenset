const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{tsx,ts}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              100: "#FFD6B0",
              200: "#FFBB8C",
              300: "#FFA068",
              400: "#FF8544",
              500: "#F16312",
              600: "#D25910",
              700: "#B34E0E",
              800: "#94420C",
              900: "#75360A",
              50: "#FFEAD8",
              DEFAULT: "#F16312",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};
