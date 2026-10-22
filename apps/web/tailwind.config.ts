import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elysian: paper and ink
        paper: {
          DEFAULT: "#F3EFE6",
          alt: "#E9E3D4",
          raised: "#FBF9F4",
        },
        ink: {
          DEFAULT: "#1C1B18",
          2: "#4A4740",
          3: "#6B655D",
        },
        rule: "#CDC5B3",
        seal: {
          DEFAULT: "#A4402C",
          soft: "#EBD5CB",
        },
        // Night: title screen and hero surfaces
        night: {
          DEFAULT: "#0F1013",
          2: "#171A20",
          3: "#232730",
        },
        moon: {
          DEFAULT: "#ECE7DA",
          2: "#AFA99B",
        },
        // Hobom: bright, round, casual
        hb: {
          pink: "#F27BA0",
          "pink-deep": "#B9446F",
          "pink-soft": "#FFE1EA",
          yellow: "#FFD35E",
          "yellow-soft": "#FFF1C4",
          cream: "#FFF8F3",
          ink: "#3A2B33",
        },
        // Legacy token names kept so untouched screens still resolve
        primary: "#A4402C",
        "background-light": "#F3EFE6",
        "background-dark": "#0F1013",
        "surface-light": "#FBF9F4",
        "surface-dark": "#171A20",
        "text-light": "#1C1B18",
        "text-dark": "#ECE7DA",
        "romance-pink": "#F27BA0",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        hobom: "var(--font-hobom)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      animation: {
        "fade-in-down": "fadeInDown 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out both",
        blink: "blink 1.2s steps(2, start) infinite",
      },
      keyframes: {
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0.15" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};
export default config;
