/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          active: '#6D28D9',
          light: 'rgba(139, 92, 246, 0.12)',
        },
        ai: {
          DEFAULT: '#A855F7',
          light: 'rgba(168, 85, 247, 0.10)',
        },
        bg: '#09090B',
        surface: {
          DEFAULT: '#18181B',
          2: '#1E1E23',
        },
        text: {
          DEFAULT: '#F4F4F5',
          secondary: '#A1A1AA',
          muted: '#71717A',
        },
        border: {
          DEFAULT: '#27272A',
          strong: '#3F3F46',
        },
        success: {
          DEFAULT: '#22C55E',
          bg: 'rgba(34, 197, 94, 0.10)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.10)',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.10)',
        },
        'header-btn': {
          DEFAULT: '#FFFFFF',
          hover: '#E4E4E7',
          text: '#09090B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      spacing: {
        /* 8px base unit, allow 4px for tight gaps */
        '0.5': '4px',
        '1': '8px',
        '1.5': '12px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '6': '48px',
        '8': '64px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.30)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.40), 0 1px 2px rgba(0, 0, 0, 0.30)',
        md: '0 4px 12px rgba(0, 0, 0, 0.50)',
        lg: '0 12px 32px rgba(0, 0, 0, 0.60)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      maxWidth: {
        'content': '1280px',
      },
      width: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
      },
    },
  },
  plugins: [],
}
