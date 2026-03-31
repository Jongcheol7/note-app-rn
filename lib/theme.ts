import { useColorScheme } from 'react-native';

// ==================
// COLOR TOKENS
// ==================
const lightColors = {
  // Background
  background: '#FFFBF0',        // Warm cream (from original web app)
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#1a1a1a',
  textSecondary: '#555555',
  textTertiary: '#999999',
  textDisabled: '#cccccc',

  // Brand
  primary: '#FF6B6B',            // Coral (from original gradient)
  primaryForeground: '#FFFFFF',
  accent: '#3b82f6',             // Blue
  accentForeground: '#FFFFFF',

  // Destructive
  destructive: '#ef4444',
  destructiveForeground: '#FFFFFF',

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Border
  border: '#e5e7eb',
  borderLight: '#f0f0f0',

  // Components
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.08)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#e5e5e5',
  inputBackground: '#f3f4f6',
  modalOverlay: 'rgba(0,0,0,0.3)',
  skeleton: '#e5e7eb',
  skeletonHighlight: '#f3f4f6',

  // Chat
  bubbleMe: '#FF6B6B',
  bubbleMeText: '#FFFFFF',
  bubbleOther: '#f3f4f6',
  bubbleOtherText: '#1a1a1a',
};

const darkColors: typeof lightColors = {
  background: '#000000',
  surface: '#1a1a1a',
  surfaceElevated: '#262626',

  text: '#FFFFFF',
  textSecondary: '#cccccc',
  textTertiary: '#888888',
  textDisabled: '#555555',

  primary: '#FF8A8A',
  primaryForeground: '#FFFFFF',
  accent: '#60a5fa',
  accentForeground: '#FFFFFF',

  destructive: '#f87171',
  destructiveForeground: '#FFFFFF',

  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  border: '#333333',
  borderLight: '#2a2a2a',

  card: '#1a1a1a',
  cardBorder: 'rgba(255,255,255,0.08)',
  tabBar: '#1a1a1a',
  tabBarBorder: '#333333',
  inputBackground: '#333333',
  modalOverlay: 'rgba(0,0,0,0.5)',
  skeleton: '#333333',
  skeletonHighlight: '#444444',

  bubbleMe: '#FF8A8A',
  bubbleMeText: '#FFFFFF',
  bubbleOther: '#333333',
  bubbleOtherText: '#FFFFFF',
};

export type ThemeColors = typeof lightColors;

// ==================
// TYPOGRAPHY
// ==================
export const typography = {
  display:    { fontSize: 28, fontWeight: '800' as const, lineHeight: 34 },
  heading:    { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  subheading: { fontSize: 18, fontWeight: '700' as const, lineHeight: 24 },
  body:       { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyBold:   { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  caption:    { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  tiny:       { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
};

// ==================
// SPACING
// ==================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ==================
// RADIUS
// ==================
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// ==================
// SHADOWS
// ==================
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

// ==================
// HOOK
// ==================
export function useThemeColors(): ThemeColors {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export { lightColors, darkColors };
