import type { Config } from 'tailwindcss';

const config: Omit<Config, 'content'> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'background-light': '#F3F4F6',
        'background-dark': '#0F172A',
        'surface-light': '#FFFFFF',
        'surface-dark': '#1E293B',
        'text-light': '#111827',
        'text-dark': '#E2E8F0',
        'accent-light': '#4F46E5',
        'accent-dark': '#818CF8',
        'romance-pink': '#FF8DA1',
      },
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Noto Sans KR', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
