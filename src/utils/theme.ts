// Theme and customization management for MyVault

export type AccentColor = 'indigo' | 'emerald' | 'blue' | 'violet' | 'rose' | 'amber' | 'slate';
export type RadiusLevel = 'sharp' | 'compact' | 'subtle';

export interface ThemeConfig {
  accent: AccentColor;
  radius: RadiusLevel;
}

export interface ColorOption {
  id: AccentColor;
  name: string;
  hex: string;
  lightHex: string;
  description: string;
}

export interface RadiusOption {
  id: RadiusLevel;
  name: string;
  description: string;
  cardPx: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  {
    id: 'indigo',
    name: 'Modern Indigo',
    hex: '#4F46E5',
    lightHex: '#EEF2FF',
    description: 'Crisp, high-tech & refined (New Default)',
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    hex: '#059669',
    lightHex: '#ECFDF5',
    description: 'Organic, calm & balanced',
  },
  {
    id: 'blue',
    name: 'Sapphire Blue',
    hex: '#2563EB',
    lightHex: '#EFF6FF',
    description: 'Precision & classic clarity',
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    hex: '#7C3AED',
    lightHex: '#F5F3FF',
    description: 'Creative & distinctive',
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    hex: '#E11D48',
    lightHex: '#FFF1F2',
    description: 'Vibrant & energetic',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    hex: '#EA580C',
    lightHex: '#FFF7ED',
    description: 'Warm & welcoming',
  },
  {
    id: 'slate',
    name: 'Obsidian Slate',
    hex: '#18181B',
    lightHex: '#F4F4F5',
    description: 'Monochrome & industrial',
  },
];

export const RADIUS_OPTIONS: RadiusOption[] = [
  {
    id: 'sharp',
    name: 'Crisp / Sharp',
    description: 'Minimalist industrial corners (4px–6px)',
    cardPx: '6px',
  },
  {
    id: 'compact',
    name: 'Modern Compact',
    description: 'Clean reduced curvature (8px–10px)',
    cardPx: '10px',
  },
  {
    id: 'subtle',
    name: 'Subtle Curve',
    description: 'Soft rounded corners (12px–14px)',
    cardPx: '14px',
  },
];

const THEME_STORAGE_KEY = 'myvault_theme_preferences_v2';

export const DEFAULT_THEME: ThemeConfig = {
  accent: 'indigo', // New color as requested!
  radius: 'compact', // Reduced border radius as requested!
};

export function getSavedTheme(): ThemeConfig {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    const parsed = JSON.parse(raw);
    return {
      accent: parsed.accent || DEFAULT_THEME.accent,
      radius: 'compact', // Permanently locked to Modern Compact border radius
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: ThemeConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const lockedTheme: ThemeConfig = { ...theme, radius: 'compact' };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(lockedTheme));
    applyThemeToDOM(lockedTheme);
  } catch {
    // ignore local storage error
  }
}

export function applyThemeToDOM(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.accent);
  root.setAttribute('data-radius', 'compact');
}
