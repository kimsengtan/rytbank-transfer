import type { TextStyle } from 'react-native';

export const colors = {
  primary: '#4B3BD6',
  primarySoft: '#EEECFC',
  text: '#101828',
  textMuted: '#667085',
  textInverse: '#FFFFFF',
  textInverseMuted: 'rgba(255, 255, 255, 0.75)',
  background: '#F5F6F8',
  surface: '#FFFFFF',
  border: '#E4E7EC',
  danger: '#D92D20',
  dangerSoft: '#FEF3F2',
  success: '#079455',
  overlay: 'rgba(16, 24, 40, 0.5)',
};

export type ColorName = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 999,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' },
  heading: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 16 },
  label: { fontSize: 14, fontWeight: '500' },
  caption: { fontSize: 13 },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Keeps forms readable on tablets and web instead of stretching edge to edge. */
export const MAX_CONTENT_WIDTH = 560;
