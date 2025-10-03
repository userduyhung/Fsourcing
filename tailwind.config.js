/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      colors: {
        'tech-blue': '#2563EB',
        'cyan': '#0EA5E9',
        'slate-dark': '#1E293B',
      },
    },
  },
  plugins: [],
};
