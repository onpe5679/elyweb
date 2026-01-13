import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED", 
        "background-light": "#F3F4F6", 
        "background-dark": "#0F172A", 
        "surface-light": "#FFFFFF",
        "surface-dark": "#1E293B",
        "text-light": "#111827",
        "text-dark": "#E2E8F0",
        "accent-light": "#4F46E5",
        "accent-dark": "#818CF8",
        "romance-pink": "#FF8DA1",
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Noto Sans KR", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
export default config;
