// src/config/theme.js
// Single source of truth for StyleSheet-based styling (used alongside NativeWind)

export const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#DBEAFE",

  success: "#16A34A",
  successLight: "#DCFCE7",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  info: "#0891B2",
  infoLight: "#CFFAFE",

  ink: "#0F172A",
  inkSoft: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  surface: "#F8FAFC",
  card: "#FFFFFF",
  white: "#FFFFFF",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};