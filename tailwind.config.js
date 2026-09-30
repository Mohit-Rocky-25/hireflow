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
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
          active: '#0369A1',
          light: 'rgba(14, 165, 233, 0.12)',
          glow: 'rgba(14, 165, 233, 0.30)',
        },
        ai: {
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9',
          light: 'rgba(139, 92, 246, 0.12)',
          glow: 'rgba(139, 92, 246, 0.30)',
        },
        bg: '#F9FAFB',
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F3F4F6',
          3: '#E5E7EB',
        },
        text: {
          DEFAULT: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280',
        },
        border: {
          DEFAULT: '#E5E7EB',
          strong: '#D1D5DB',
          accent: 'rgba(14, 165, 233, 0.40)',
        },
        success: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.10)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.10)',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.10)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.10)',
        },
        'header-btn': {
          DEFAULT: '#111827',
          hover: '#000000',
          text: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '24px',
      },
      spacing: {
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
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 16px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)',
        'glow-orange': '0 0 24px rgba(14, 165, 233, 0.25), 0 4px 16px rgba(14, 165, 233, 0.15)',
        'glow-violet': '0 0 24px rgba(139, 92, 246, 0.25), 0 4px 16px rgba(139, 92, 246, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'slide-in': 'slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
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
