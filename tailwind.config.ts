import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C5CBF',
        secondary: '#9B7FD4',
        'light-bg': '#EDE9F7',
        'dark-text': '#1A1A2E',
        'body-text': '#6B7280',
        'page-bg': '#F7F5FF',
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(124, 92, 191, 0.08)',
      },
      backgroundImage: {
        'purple-gradient':
          'linear-gradient(135deg, #7C5CBF 0%, #9B7FD4 100%)',
        'sidebar-gradient':
          'linear-gradient(180deg, #7C5CBF 0%, #5E3FA0 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        confetti: 'confetti 1s ease-out forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
