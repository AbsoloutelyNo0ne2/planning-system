import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ColorSchemeId = 
  | 'cyan-night'
  | 'forest-mist'
  | 'amber-glow'
  | 'midnight-violet'
  | 'deep-ocean'
  | 'slate-storm'
  | 'rose-quartz'
  | 'purple-haze'
  | 'crimson-tide'
  | 'copper-wire';

interface ColorScheme {
  id: ColorSchemeId;
  name: string;
  colors: {
    bgBase: string;
    bgSurface: string;
    bgElevated: string;
    bgInput: string;
    bgHover: string;
    borderSubtle: string;
    borderDefault: string;
    borderFocus: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent500: string;
    accent600: string;
    accent700: string;
    accent400: string;
    accentSoft: string;
  };
  blob: {
    baseHue: number; // Hue for blob (0-360)
    hueShiftRange: number; // How much hue shifts with speed (± degrees)
    lightnessShiftRange: number; // How much lightness shifts with speed (± %)
  };
}

const COLOR_SCHEMES: Record<ColorSchemeId, ColorScheme> = {
  'cyan-night': {
    id: 'cyan-night',
    name: 'Cyan Night',
    colors: {
      bgBase: '#050a0f',
      bgSurface: '#0a141c',
      bgElevated: '#11222e',
      bgInput: '#03070a',
      bgHover: '#1a2f3d',
      borderSubtle: '#1a2f3d',
      borderDefault: '#1f3d4a',
      borderFocus: '#06b6d4',
      textPrimary: '#ecfeff',
      textSecondary: '#6d9ca8',
      textMuted: '#4a6f7a',
      accent500: '#06b6d4',
      accent600: '#0891b2',
      accent700: '#0e7490',
      accent400: '#22d3ee',
      accentSoft: 'rgba(6, 182, 212, 0.15)',
    },
    blob: {
      baseHue: 185, // Cyan
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'forest-mist': {
    id: 'forest-mist',
    name: 'Forest Mist',
    colors: {
      bgBase: '#050a08',
      bgSurface: '#0a1410',
      bgElevated: '#112418',
      bgInput: '#030705',
      bgHover: '#1a3d2a',
      borderSubtle: '#1a3d2e',
      borderDefault: '#1f3d2e',
      borderFocus: '#10b981',
      textPrimary: '#ecfdf5',
      textSecondary: '#6d9c8a',
      textMuted: '#4a6f62',
      accent500: '#10b981',
      accent600: '#059669',
      accent700: '#047857',
      accent400: '#34d399',
      accentSoft: 'rgba(16, 185, 129, 0.15)',
    },
    blob: {
      baseHue: 145, // Green
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'amber-glow': {
    id: 'amber-glow',
    name: 'Amber Glow',
    colors: {
      bgBase: '#0a0805',
      bgSurface: '#14100a',
      bgElevated: '#241811',
      bgInput: '#070503',
      bgHover: '#3d2a1a',
      borderSubtle: '#3d2e1f',
      borderDefault: '#3d2e1f',
      borderFocus: '#f59e0b',
      textPrimary: '#fffbeb',
      textSecondary: '#a89474',
      textMuted: '#7a6f4a',
      accent500: '#f59e0b',
      accent600: '#d97706',
      accent700: '#b45309',
      accent400: '#fbbf24',
      accentSoft: 'rgba(245, 158, 11, 0.15)',
    },
    blob: {
      baseHue: 38, // Amber
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'midnight-violet': {
    id: 'midnight-violet',
    name: 'Midnight Violet',
    colors: {
      bgBase: '#0a0a0f',
      bgSurface: '#12121a',
      bgElevated: '#1a1a2e',
      bgInput: '#050508',
      bgHover: '#2a2a3e',
      borderSubtle: '#2a2a3e',
      borderDefault: '#2a2a3e',
      borderFocus: '#8b5cf6',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent500: '#8b5cf6',
      accent600: '#7c3aed',
      accent700: '#6d28d9',
      accent400: '#a78bfa',
      accentSoft: 'rgba(139, 92, 246, 0.15)',
    },
    blob: {
      baseHue: 280, // Purple
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'deep-ocean': {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    colors: {
      bgBase: '#050a14',
      bgSurface: '#0a1424',
      bgElevated: '#111f3a',
      bgInput: '#03070a',
      bgHover: '#1a2f4a',
      borderSubtle: '#1e3a5f',
      borderDefault: '#1e3a5f',
      borderFocus: '#3b82f6',
      textPrimary: '#e2e8f0',
      textSecondary: '#64748b',
      textMuted: '#4a5568',
      accent500: '#3b82f6',
      accent600: '#2563eb',
      accent700: '#1d4ed8',
      accent400: '#60a5fa',
      accentSoft: 'rgba(59, 130, 246, 0.15)',
    },
    blob: {
      baseHue: 215, // Blue
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'slate-storm': {
    id: 'slate-storm',
    name: 'Slate Storm',
    colors: {
      bgBase: '#0a0c0f',
      bgSurface: '#12161c',
      bgElevated: '#1c222b',
      bgInput: '#050608',
      bgHover: '#2a313d',
      borderSubtle: '#2d3748',
      borderDefault: '#2d3748',
      borderFocus: '#64748b',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      accent500: '#64748b',
      accent600: '#475569',
      accent700: '#334155',
      accent400: '#94a3b8',
      accentSoft: 'rgba(100, 116, 139, 0.15)',
    },
    blob: {
      baseHue: 220, // Slate blue
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'rose-quartz': {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    colors: {
      bgBase: '#0a0508',
      bgSurface: '#140a11',
      bgElevated: '#24111c',
      bgInput: '#050305',
      bgHover: '#3d1f2a',
      borderSubtle: '#3d1f2a',
      borderDefault: '#3d1f2a',
      borderFocus: '#f43f5e',
      textPrimary: '#fff1f3',
      textSecondary: '#a8748a',
      textMuted: '#7a4a5f',
      accent500: '#f43f5e',
      accent600: '#e11d48',
      accent700: '#be123c',
      accent400: '#fb7185',
      accentSoft: 'rgba(244, 63, 94, 0.15)',
    },
    blob: {
      baseHue: 350, // Rose
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'purple-haze': {
    id: 'purple-haze',
    name: 'Purple Haze',
    colors: {
      bgBase: '#0a0514',
      bgSurface: '#120a1c',
      bgElevated: '#1f112e',
      bgInput: '#050308',
      bgHover: '#3d1f4a',
      borderSubtle: '#3d1f4a',
      borderDefault: '#3d1f4a',
      borderFocus: '#a855f7',
      textPrimary: '#faf5ff',
      textSecondary: '#a874c7',
      textMuted: '#7a4a8f',
      accent500: '#a855f7',
      accent600: '#9333ea',
      accent700: '#7c3aed',
      accent400: '#c084fc',
      accentSoft: 'rgba(168, 85, 247, 0.15)',
    },
    blob: {
      baseHue: 300, // Purple
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'crimson-tide': {
    id: 'crimson-tide',
    name: 'Crimson Tide',
    colors: {
      bgBase: '#0a0505',
      bgSurface: '#140a0a',
      bgElevated: '#241111',
      bgInput: '#050303',
      bgHover: '#3d1f1f',
      borderSubtle: '#3d1f1f',
      borderDefault: '#3d1f1f',
      borderFocus: '#dc2626',
      textPrimary: '#fef2f2',
      textSecondary: '#a87474',
      textMuted: '#7a4a4a',
      accent500: '#dc2626',
      accent600: '#b91c1c',
      accent700: '#991b1b',
      accent400: '#f87171',
      accentSoft: 'rgba(220, 38, 38, 0.15)',
    },
    blob: {
      baseHue: 0, // Red
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
  'copper-wire': {
    id: 'copper-wire',
    name: 'Copper Wire',
    colors: {
      bgBase: '#0a0806',
      bgSurface: '#14100a',
      bgElevated: '#241811',
      bgInput: '#050403',
      bgHover: '#3d2a1a',
      borderSubtle: '#3d2a1f',
      borderDefault: '#3d2a1f',
      borderFocus: '#c2410c',
      textPrimary: '#fffbf5',
      textSecondary: '#a88a74',
      textMuted: '#7a5f4a',
      accent500: '#c2410c',
      accent600: '#9a3412',
      accent700: '#7c2d12',
      accent400: '#ea580c',
      accentSoft: 'rgba(194, 65, 12, 0.15)',
    },
    blob: {
      baseHue: 20, // Orange
      hueShiftRange: 15,
      lightnessShiftRange: 10,
    },
  },
};

interface ColorSchemeContextType {
  currentScheme: ColorScheme;
  setScheme: (schemeId: ColorSchemeId) => void;
  schemes: typeof COLOR_SCHEMES;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>(COLOR_SCHEMES['cyan-night']);

  useEffect(() => {
    const saved = localStorage.getItem('color-scheme') as ColorSchemeId | null;
    if (saved && COLOR_SCHEMES[saved]) {
      setCurrentScheme(COLOR_SCHEMES[saved]);
    }
  }, []);

  const setScheme = useCallback((schemeId: ColorSchemeId) => {
    const scheme = COLOR_SCHEMES[schemeId];
    if (scheme) {
      setCurrentScheme(scheme);
      localStorage.setItem('color-scheme', schemeId);
    }
  }, []);

  return (
    <ColorSchemeContext.Provider value={{ currentScheme, setScheme, schemes: COLOR_SCHEMES }}>
      <StyleVars scheme={currentScheme} />
      {children}
    </ColorSchemeContext.Provider>
  );
}

function StyleVars({ scheme }: { scheme: ColorScheme }) {
  return (
    <style>{`
      :root {
        --color-bg-base: ${scheme.colors.bgBase};
        --color-bg-surface: ${scheme.colors.bgSurface};
        --color-bg-elevated: ${scheme.colors.bgElevated};
        --color-bg-input: ${scheme.colors.bgInput};
        --color-bg-hover: ${scheme.colors.bgHover};
        --color-border-subtle: ${scheme.colors.borderSubtle};
        --color-border-default: ${scheme.colors.borderDefault};
        --color-border-focus: ${scheme.colors.borderFocus};
        --color-text-primary: ${scheme.colors.textPrimary};
        --color-text-secondary: ${scheme.colors.textSecondary};
        --color-text-muted: ${scheme.colors.textMuted};
        --color-accent-500: ${scheme.colors.accent500};
        --color-accent-600: ${scheme.colors.accent600};
        --color-accent-700: ${scheme.colors.accent700};
        --color-accent-400: ${scheme.colors.accent400};
      }
    `}</style>
  );
}

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error('useColorScheme must be used within ColorSchemeProvider');
  }
  return context;
}

export { COLOR_SCHEMES };
export type { ColorSchemeId };
