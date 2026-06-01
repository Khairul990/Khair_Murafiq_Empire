/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#f2c94c',
          light: '#f7df7a',
          dark: '#c9952b',
          deeper: '#a67c1e',
          glow: 'rgba(242, 201, 76, 0.15)',
        },
        obsidian: {
          DEFAULT: '#05070a',
          surface: '#0a0e17',
          card: '#0f1420',
          border: '#1a2035',
          light: '#1e2740',
          text: '#e2e8f0',
          muted: '#8892a4',
        },
        empire: {
          navy: '#0a0e17',
          dark: '#05070a',
          card: 'rgba(15, 20, 32, 0.8)',
          border: 'rgba(26, 32, 53, 0.7)',
          glow: 'rgba(242, 201, 76, 0.08)',
        },
        status: {
          live: '#22c55e',
          dev: '#3b82f6',
          warning: '#eab308',
          error: '#ef4444',
          maintenance: '#8b5cf6',
          paused: '#64748b',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'gold-sm': '0 0 8px rgba(242, 201, 76, 0.12)',
        'gold': '0 0 16px rgba(242, 201, 76, 0.2)',
        'gold-lg': '0 0 32px rgba(242, 201, 76, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'glow-green': '0 0 12px rgba(34, 197, 94, 0.15)',
        'glow-blue': '0 0 12px rgba(59, 130, 246, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(242, 201, 76, 0.12)' },
          '50%': { boxShadow: '0 0 24px rgba(242, 201, 76, 0.25)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
