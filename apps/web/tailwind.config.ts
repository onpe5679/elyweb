import type { Config } from "tailwindcss";

// Colours are CSS variables (see app/globals.css) so each studio label can re-theme the
// same components: `.theme-elysian` (paper / ink / vermilion) and `.theme-habom` (cream / pink / butter).
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: v("paper"),
        "paper-deep": v("paper-deep"),
        ink: v("ink"),
        "ink-soft": v("ink-soft"),
        "ink-mute": v("ink-mute"),
        rule: v("rule"),
        accent: v("accent"),
        "accent-ink": v("accent-ink"),
        night: v("night"),
        "night-2": v("night-2"),
        "on-night": v("on-night"),
        "on-night-mute": v("on-night-mute"),
        "accent-night": v("accent-night"),
        // Habom palette (also exposed as fixed colours for cross-label previews)
        cream: "#FFF8F0",
        blush: "#FDE7EE",
        petal: "#F49AB5",
        rose: "#C9416D",
        butter: "#FFD978",
        "butter-soft": "#FFF1C7",
        plum: "#4A2B38",
        "plum-soft": "#7A5866",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-serif-ja)", "serif"],
        sans: ["var(--font-sans)", "var(--font-sans-ja)", "system-ui", "sans-serif"],
        latin: ["var(--font-latin)", "var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        round: ["var(--font-round)", "var(--font-round-latin)", "var(--font-sans)", "sans-serif"],
        "round-latin": ["var(--font-round-latin)", "var(--font-round)", "sans-serif"],
      },
      maxWidth: {
        page: "82rem",
      },
      letterSpacing: {
        label: "0.18em",
      },
      keyframes: {
        "cell-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "rise-in": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "cell-in": "cell-in 0.5s cubic-bezier(.2,.7,.2,1) both",
        "rise-in": "rise-in 0.8s cubic-bezier(.2,.7,.2,1) both",
        blink: "blink 1.1s steps(1) infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")({ strategy: "class" })],
};
export default config;
