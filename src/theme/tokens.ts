// Single source of truth for the DeLAPLAK design tokens.
// Consumed directly by the antd ConfigProvider (App.tsx). The CSS custom
// properties in index.css mirror these same values for Tailwind utilities —
// keep both in sync when changing a token here.

export const palette = {
  primary: { 500: "#EC4899", 600: "#DB2777", 100: "#FCE7F3", 700: "#9D174D" },
  accent: { 500: "#8B5CF6", 600: "#7C3AED" },
  info: { 500: "#0EA5E9", 100: "#E0F2FE" },
  success: { 500: "#22C55E", 100: "#DCFCE7" },
  warning: { 500: "#F59E0B", 100: "#FEF3C7" },
  danger: { 500: "#EF4444", 100: "#FEE2E2" },
  slate: {
    50: "#F8FAFC",
    100: "#F1F5F9",
    200: "#E2E8F0",
    300: "#CBD5E1",
    400: "#94A3B8",
    500: "#64748B",
    600: "#475569",
    900: "#0F172A",
  },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const shadow = {
  softPrimary: `0 8px 20px ${palette.primary[500]}59`, // ~35% alpha
  card: "0 10px 30px rgba(15, 23, 42, 0.08)",
  cardHover: "0 16px 40px rgba(15, 23, 42, 0.14)",
} as const;
