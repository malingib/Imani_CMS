import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: {
            DEFAULT: '#173B3A', // Deep teal
            50: '#F5F8F7',
            100: '#E8F0EE',
            200: '#D2E1DD',
            300: '#B0C9C3',
            400: '#83A69F',
            500: '#527D77',
            600: '#285653',
            700: '#173B3A',
            800: '#102D2D',
            900: '#0A2020',
          },
          indigo: {
            DEFAULT: '#0F766E', // Teal
            50: '#F0FDFA',
            100: '#CCFBF1',
            500: '#0F766E',
            600: '#0D625B',
            700: '#115E59',
          },
          gold: {
            DEFAULT: '#B58A45', // Restrained brass
            50: '#FAF7F0',
            100: '#F1E7D2',
            500: '#B58A45',
            600: '#8D682F',
          },
          emerald: {
            DEFAULT: '#16806D', // Semantic success green
            50: '#EFF8F4',
            100: '#D5EEE4',
            500: '#16806D',
            600: '#116957',
          }
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
