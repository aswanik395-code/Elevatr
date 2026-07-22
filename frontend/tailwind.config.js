/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',
        'paper-line': '#E7E0D2',
        ink: '#1D2B3A',
        'ink-soft': '#4A5A6A',
        pen: '#C1401F',
        'pen-soft': '#E4572E',
        marker: '#F2C230',
        sage: '#3F8F5F',
        'sage-soft': '#DCEDE1',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        paper: '0 1px 0 rgba(29,43,58,0.06), 0 8px 24px -12px rgba(29,43,58,0.18)',
      },
    },
  },
  plugins: [],
}