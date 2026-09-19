// Powered by OnSpace.AI
export const Colors = {
  // Base
  bg: '#0F1117',
  surface: '#1A1D27',
  surfaceElevated: '#22263A',
  border: '#2A2E42',
  borderLight: '#343850',

  // Brand
  primary: '#6C8EFF',
  primaryDim: '#3D5299',
  primaryLight: '#8AAAFF',
  accent: '#A78BFA',

  // Text
  textPrimary: '#F0F2FF',
  textSecondary: '#9EA3C0',
  textMuted: '#5A6080',

  // Semantic
  success: '#34D399',
  successDim: '#064E3B',
  danger: '#F87171',
  dangerDim: '#7F1D1D',
  warning: '#FBBF24',
  warningDim: '#78350F',
  cancelled: '#6B7280',

  // Subject colors (cycling palette)
  subjectColors: [
    '#6C8EFF', // blue
    '#A78BFA', // purple
    '#34D399', // green
    '#FBBF24', // amber
    '#F87171', // red
    '#38BDF8', // sky
    '#FB923C', // orange
    '#E879F9', // fuchsia
  ],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
