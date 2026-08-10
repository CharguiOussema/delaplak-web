import { palette } from "./tokens";

// Validated categorical set (dataviz skill's default palette — the brand's own accent hues
// don't clear the chroma-floor/CVD checks as a categorical series, see palette.md). Fixed
// order, never cycled or reassigned per filter. Passes every adjacent-pair CVD/contrast
// gate for bar/line charts (light mode) — see the skill's `references/palette.md`.
export const CATEGORICAL_CHART_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
] as const;

// Status colors stay reserved to actual state (order status, stock level) — the app's own
// existing success/warning/danger tokens, never reused as a categorical series color.
export const STATUS_CHART_COLORS = {
  good: palette.success[500],
  warning: palette.warning[500],
  critical: palette.danger[500],
} as const;

// Single-series contexts (one metric, no cross-series CVD concern) stay on-brand.
export const SEQUENTIAL_CHART_COLOR = palette.primary[500];
