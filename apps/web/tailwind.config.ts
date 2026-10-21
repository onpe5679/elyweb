import type { Config } from "tailwindcss";

// 색은 모두 CSS 변수(RGB 3값)로 정의되어 있고 app/globals.css 에서 브랜드·테마별로 바뀐다.
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        "paper-2": token("paper-2"),
        "paper-3": token("paper-3"),
        ink: token("ink"),
        "ink-2": token("ink-2"),
        "ink-3": token("ink-3"),
        accent: token("accent"),
        "accent-text": token("accent-text"),
        "accent-ink": token("accent-ink"),
        sub: token("sub"),
        grid: token("grid"),
      },
      fontFamily: {
        // display/serif/sans 는 브랜드에 따라 --font-* 가 바뀐다.
        display: ["var(--font-display)"],
        serif: ["var(--font-serif)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        ui: "var(--radius-ui)",
        card: "var(--radius-card)",
      },
      maxWidth: {
        page: "88rem",
      },
      transitionTimingFunction: {
        page: "cubic-bezier(.2,.7,.1,1)",
      },
    },
  },
  plugins: [],
};
export default config;
