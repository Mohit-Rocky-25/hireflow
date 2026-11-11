import { create } from 'zustand';

export type Mode = 'light' | 'dark' | 'system';
export type Design = 'spruce' | 'slush' | 'neon-volt';

interface ThemeState {
  mode: Mode;
  design: Design;
  resolvedTheme: 'light' | 'dark';
  setMode: (m: Mode) => void;
  setDesign: (d: Design) => void;
  toggleTheme: () => void;
  supportsThemeToggle: () => boolean;
}

export const THEME_KEY = 'hireflow:v4:theme-mode';
export const DESIGN_KEY = 'hireflow:v4:design';

export const DESIGN_REGISTRY = [
  { id: 'spruce', label: 'Design 3: Spruce', supportsModes: true },
  { id: 'slush', label: 'Design 2: Slush', supportsModes: true },
  { id: 'neon-volt', label: 'Design 1: Neon Volt', supportsModes: false },
] as const;

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyThemeAndDesign(mode: Mode, design: Design): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';

  let resolved: 'light' | 'dark' = 'dark';
  if (design === 'spruce') {
    resolved = mode === 'system' ? getSystemTheme() : mode;
  } else {
    // Design 1: Neon Volt is strictly dark-only (supportsModes: false)
    resolved = 'dark';
  }

  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-design', design);
  return resolved;
}

export const useTheme = create<ThemeState>((set, get) => {
  const initialMode =
    (typeof localStorage !== 'undefined'
      ? (localStorage.getItem(THEME_KEY) as Mode)
      : null) || 'dark';
  const initialDesign =
    (typeof localStorage !== 'undefined'
      ? (localStorage.getItem(DESIGN_KEY) as Design)
      : null) || 'neon-volt';

  const resolved =
    typeof document !== 'undefined'
      ? applyThemeAndDesign(initialMode, initialDesign)
      : 'dark';

  if (typeof window !== 'undefined') {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        if (get().mode === 'system') {
          const newResolved = applyThemeAndDesign('system', get().design);
          set({ resolvedTheme: newResolved });
        }
      });
  }

  return {
    mode: initialMode,
    design: initialDesign,
    resolvedTheme: resolved,
    supportsThemeToggle: () => {
      const current = DESIGN_REGISTRY.find((d) => d.id === get().design);
      return current ? current.supportsModes : false;
    },
    setMode: (mode: Mode) => {
      try {
        localStorage.setItem(THEME_KEY, mode);
      } catch {}
      const resolved = applyThemeAndDesign(mode, get().design);
      set({ mode, resolvedTheme: resolved });
    },
    setDesign: (design: Design) => {
      try {
        localStorage.setItem(DESIGN_KEY, design);
      } catch {}
      const resolved = applyThemeAndDesign(get().mode, design);
      set({ design, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const nextMode: Mode = current === 'dark' ? 'light' : 'dark';
      get().setMode(nextMode);
    },
  };
});
