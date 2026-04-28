import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-hover)",
          light: "var(--accent-light)",
        },
        navy: {
          900: "var(--bg-primary)",
          800: "var(--bg-surface)",
          700: "var(--border)",
          600: "var(--border-subtle)",
        },
      },
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
        full: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
      },
    },
  },
  plugins: [],
};
export default config;
