/**
 * Samurai Dark Theme - Color Palette
 * Inspired by Japanese minimalism and the web app design
 * 
 * Usage:
 * import { SAMURAI_COLORS } from './SAMURAI_COLORS';
 * 
 * Then use: backgroundColor: SAMURAI_COLORS.background.primary
 */

export const SAMURAI_COLORS = {
  // Background colors
  background: {
    primary: "#0B0B0E",      // Deep black (main background)
    surface: "#111217",      // Dark charcoal (cards, sections)
    overlay: "#0B0B0E99",    // Semi-transparent overlay
  },

  // Text colors
  text: {
    primary: "#F4F4F5",      // Light white (headings, important)
    secondary: "#BDBDBD",    // Medium gray (descriptions)
    tertiary: "#757575",     // Darker gray (subtle, disabled)
    inverse: "#0B0B0E",      // For light backgrounds
  },

  // Accent colors
  accent: {
    red: "#EF5350",          // Primary red (buttons, highlights, headers)
    redDark: "#D32F2F",      // Darker red (hover, active)
    redLight: "#FF6B6B",     // Lighter red (hover states)
  },

  // Semantic colors (matching web app)
  semantic: {
    income: "#66BB6A",       // Green for income/success
    expense: "#EF5350",      // Red for expenses/cost
    neutral: "#FF9800",      // Orange for neutral category
    excess: "#D32F2F",       // Dark red for excess
    warning: "#FF9800",      // Orange for warnings
    info: "#2196F3",         // Blue for info
  },

  // Border colors
  border: {
    light: "#424242",        // Light dark border
    primary: "#1A1A1F",      // Primary dark border
    accent: "#EF5350",       // Red accent border
  },

  // Special colors
  special: {
    flame: "#FF9800",        // Flame emoji color (orange)
    trophy: "#FFD700",       // Trophy/gold
    moon: "#FFD06B",         // Moon color from backdrop
    shadow: "rgba(0,0,0,0.7)", // Dark shadow
  },

  // Opacity helpers
  opacity: {
    subtle: "rgba(244,244,245,0.2)",     // 20% white
    light: "rgba(244,244,245,0.5)",      // 50% white
    medium: "rgba(244,244,245,0.8)",     // 80% white
    redSubtle: "rgba(239,83,80,0.1)",    // 10% red
    redLight: "rgba(239,83,80,0.15)",    // 15% red
  },
};

/**
 * Quick reference for common style patterns
 */
export const SAMURAI_PATTERNS = {
  // Header with red bottom border
  headerWithBorder: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 2,
    borderBottomColor: SAMURAI_COLORS.accent.red,
  },

  // Card with red left border
  cardWithAccent: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderLeftWidth: 3,
    borderLeftColor: SAMURAI_COLORS.accent.red,
    borderRadius: 12,
  },

  // Card with income green border
  cardWithIncome: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderLeftWidth: 3,
    borderLeftColor: SAMURAI_COLORS.semantic.income,
    borderRadius: 12,
  },

  // Primary button
  primaryButton: {
    backgroundColor: SAMURAI_COLORS.accent.red,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },

  // Input field
  inputField: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: SAMURAI_COLORS.text.primary,
  },

  // Shadow elevation
  shadowSmall: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  shadowMedium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  shadowLarge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  // Loading indicator colors by context
  activityIndicators: {
    income: SAMURAI_COLORS.semantic.income,
    expense: SAMURAI_COLORS.accent.red,
    default: SAMURAI_COLORS.accent.red,
  },

  // Refresh control colors
  refreshControl: {
    android: [SAMURAI_COLORS.accent.red],
    ios: SAMURAI_COLORS.accent.red,
  },
};

/**
 * Migration helper: Old colors to new colors mapping
 */
export const COLOR_MIGRATION = {
  "#f5f5f5": SAMURAI_COLORS.background.primary,      // Old light gray → Dark background
  "#FAFAFA": SAMURAI_COLORS.background.primary,      // Old off-white → Dark background
  "#FFFFFF": SAMURAI_COLORS.background.surface,      // Old white → Dark surface
  "#fff": SAMURAI_COLORS.background.surface,         // Old white shorthand → Dark surface
  "#333": SAMURAI_COLORS.text.primary,               // Old dark text → Light text
  "#333333": SAMURAI_COLORS.text.primary,
  "#666": SAMURAI_COLORS.text.secondary,             // Old medium text → Light secondary
  "#666666": SAMURAI_COLORS.text.secondary,
  "#999": SAMURAI_COLORS.text.tertiary,              // Old light text → Dark tertiary
  "#999999": SAMURAI_COLORS.text.tertiary,
  "#4CAF50": SAMURAI_COLORS.semantic.income,         // Old green → New green
  "#F44336": SAMURAI_COLORS.accent.red,              // Old red → New red
  "#FF9800": SAMURAI_COLORS.semantic.neutral,        // Old orange → New orange
  "#2196F3": SAMURAI_COLORS.semantic.info,           // Old blue → New blue (keep)
};

export default SAMURAI_COLORS;