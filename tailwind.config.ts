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
        secondary: '#00C6B2',
        'primary-light': '#EDE9F7',
        'dark-bg': '#F8F7FF',
        sidebar: '#FFFFFF',
        card: '#FFFFFF',
        border: '#EDE9F7',
        input: '#F8F7FF',
        'input-border': '#EDE9F7',
        'text-primary': '#1A1A2E',
        'text-secondary': '#6B7280',
        'text-muted': '#9CA3AF',
        gold: '#F59E0B',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        'light-bg': '#EDE9F7',
        'dark-text': '#1A1A2E',
        'body-text': '#6B7280',
        'page-bg': '#F8F7FF',
      },
      borderRadius: {
        pill: '9999px',
        card: '20px',
        input: '14px',
        sm: '10px',
      },
      boxShadow: {
        card: '0 4px 24px rgba(124, 92, 191, 0.08)',
        'card-hover': '0 8px 32px rgba(124, 92, 191, 0.16)',
        button: '0 4px 12px rgba(124, 92, 191, 0.3)',
        nav: '0 2px 8px rgba(124, 92, 191, 0.2)',
        glow: '0 0 0 4px rgba(124, 92, 191, 0.16)',
      },
      backgroundImage: {
        'purple-gradient':
          'linear-gradient(135deg, #7C5CBF 0%, #9B7FD4 100%)',
        'teal-gradient':
          'linear-gradient(135deg, #00C6B2 0%, #7C5CBF 100%)',
        'sidebar-gradient':
          'linear-gradient(135deg, rgba(124, 92, 191, 0.12), rgba(237, 233, 247, 0.35))',
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
