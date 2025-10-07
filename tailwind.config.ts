import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Tech-Forward palette (aligned with culturabuilder.com)
        background: {
          dark: '#0a0a0a',
          darker: '#000000',
          card: '#111111',
          cardHover: '#1a1a1a',
        },
        neon: {
          green: '#00ff88',
          greenDim: '#00cc6a',
          cyan: '#00d9ff',
          cyanDim: '#00a8cc',
          purple: '#b16ced',
          purpleDim: '#8f4fc7',
        },
        tech: {
          gray: {
            100: '#f5f5f5',
            200: '#e5e5e5',
            300: '#d4d4d4',
            400: '#a3a3a3',
            500: '#737373',
            600: '#525252',
            700: '#404040',
            800: '#262626',
            900: '#171717',
          },
        },
        accent: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        doto: ['var(--font-doto)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-dark': 'linear-gradient(135deg, #0a0a0a 0%, #000000 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(17,17,17,0.8) 0%, rgba(10,10,10,0.9) 100%)',
        'gradient-neon': 'linear-gradient(135deg, #00ff88 0%, #00d9ff 100%)',
      },
      boxShadow: {
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'neon-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(177, 108, 237, 0.3)',
        'card-dark': '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 32px rgba(0, 255, 136, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.8), 0 0 40px rgba(0, 255, 136, 0.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
