/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Noto Sans', 'Poppins', 'sans-serif'],
        'body': ['Noto Sans', 'Inter', 'sans-serif'],
        // Ensure default sans utility maps to Noto Sans for Vietnamese support
        sans: ['Noto Sans', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Inter', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
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
