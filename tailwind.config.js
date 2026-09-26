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
          DEFAULT: '#F97316',
          hover: '#EA580C',
          active: '#C2410C',
          light: 'rgba(249, 115, 22, 0.12)',
          glow: 'rgba(249, 115, 22, 0.30)',
        },
        ai: {
          DEFAULT: '#A78BFA',
          dark: '#7C3AED',
          light: 'rgba(167, 139, 250, 0.12)',
          glow: 'rgba(124, 58, 237, 0.30)',
        },
        bg: '#0A0A0F',
        surface: {
          DEFAULT: '#111118',
          2: '#1A1A24',
          3: '#22222F',
        },
        text: {
          DEFAULT: '#EDEDF5',
          secondary: '#8888AA',
          muted: '#55556A',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.13)',
          accent: 'rgba(249, 115, 22, 0.40)',
        },
        success: {
          DEFAULT: '#34D399',
          bg: 'rgba(52, 211, 153, 0.10)',
        },
        warning: {
          DEFAULT: '#FCD34D',
          bg: 'rgba(252, 211, 77, 0.10)',
        },
        danger: {
          DEFAULT: '#F87171',
          bg: 'rgba(248, 113, 113, 0.10)',
        },
        info: {
          DEFAULT: '#60A5FA',
          bg: 'rgba(96, 165, 250, 0.10)',
        },
        'header-btn': {
          DEFAULT: '#F97316',
          hover: '#EA580C',
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
        xs: '0 1px 2px rgba(0, 0, 0, 0.50)',
        sm: '0 2px 8px rgba(0, 0, 0, 0.40), 0 1px 2px rgba(0, 0, 0, 0.50)',
        md: '0 4px 16px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.35)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.65), 0 4px 12px rgba(0, 0, 0, 0.45)',
        'glow-orange': '0 0 24px rgba(249, 115, 22, 0.40), 0 4px 16px rgba(249, 115, 22, 0.20)',
        'glow-violet': '0 0 24px rgba(124, 58, 237, 0.40), 0 4px 16px rgba(124, 58, 237, 0.20)',
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
