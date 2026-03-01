// hero.ts - Import HeroUI theme from tailwind config
import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        primary: {
          50: '#fbf1e9',
          100: '#f4dec9',
          200: '#eecbaa',
          300: '#e8b88a',
          400: '#e1a56b',
          500: '#db924b',
          600: '#b5783e',
          700: '#8e5f31',
          800: '#684524',
          900: '#422c17',
          DEFAULT: '#db924b',
          foreground: '#000',
        },
        secondary: {
          50: '#eaf0f0',
          100: '#cedadb',
          200: '#b1c5c6',
          300: '#94afb0',
          400: '#779a9b',
          500: '#5a8486',
          600: '#4a6d6f',
          700: '#3b5657',
          800: '#2b3f40',
          900: '#1b2828',
          DEFAULT: '#5a8486',
          foreground: '#000',
        },
      },
    },
    dark: {
      colors: {
        primary: {
          50: '#422c17',
          100: '#684524',
          200: '#8e5f31',
          300: '#b5783e',
          400: '#db924b',
          500: '#e1a56b',
          600: '#e8b88a',
          700: '#eecbaa',
          800: '#f4dec9',
          900: '#fbf1e9',
          DEFAULT: '#db924b',
          foreground: '#000',
        },
        secondary: {
          50: '#1b2828',
          100: '#2b3f40',
          200: '#3b5657',
          300: '#4a6d6f',
          400: '#5a8486',
          500: '#779a9b',
          600: '#94afb0',
          700: '#b1c5c6',
          800: '#cedadb',
          900: '#eaf0f0',
          DEFAULT: '#5a8486',
          foreground: '#000',
        },
      },
    },
  },
});