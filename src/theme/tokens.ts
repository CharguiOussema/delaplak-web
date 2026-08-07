// Single source of truth for the DeLAPLAK design tokens.
// Consumed directly by the antd ConfigProvider (App.tsx). The CSS custom
// properties in index.css mirror these same values for Tailwind utilities —
// keep both in sync when changing a token here.

export const palette = {
  // brass = primary accent (wood tone, echoes the logo's wood-diamond half)
  primary: { 500: "#B8863E", 600: "#96692C", 100: "#F1E4CC", 700: "#7A5423" },
  // azure = secondary accent (echoes the logo's blue-diamond half)
  accent: { 500: "#3E7CA6", 600: "#2A5A78" },
  info: { 500: "#0EA5E9", 100: "#E0F2FE" },
  success: { 500: "#22C55E", 100: "#DCFCE7" },
  warning: { 500: "#F59E0B", 100: "#FEF3C7" },
  danger: { 500: "#EF4444", 100: "#FEE2E2" },
  // warm neutrals, matching the "Atelier"-inspired reference template
  slate: {
    50: "#F6F1EA",  // ivory
    100: "#EDE6DA", // cream
    200: "#DBCFBE", // sand
    300: "#C7B9A4",
    400: "#7A7267", // stone
    500: "#3A362F", // charcoal
    600: "#2A2721",
    900: "#1C1A17", // ink
  },
} as const;

export const radius = {
  sm: 2,
  md: 4,
  lg: 8,
  pill: 999,
} as const;

export const shadow = {
  softPrimary: `0 8px 20px ${palette.primary[500]}59`, // ~35% alpha
  card: "0 10px 30px rgba(15, 23, 42, 0.08)",
  cardHover: "0 16px 40px rgba(15, 23, 42, 0.14)",
} as const;
