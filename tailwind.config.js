/** @type {import('tailwindcss').Config} */
export const content= [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './Components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
];

export const theme = {
  extend: {
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
    },
  },
};
export const plugins = [
  require('tailwind-scrollbar')({ nocompatible: true }),
];

