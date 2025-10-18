import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { Appearance, ColorSchemeName } from "react-native";

// 8px grid scale
export const spacing = (n: number) => n * 8;

// Typography scale (8px grid)
export const typography = {
  xs: { fontSize: 12, lineHeight: 16 },   // 12 ~ 8 * 1.5
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 26 },
  xl: { fontSize: 20, lineHeight: 28 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: "700" as const },
};

// Color tokens inspired by Japanese minimal palette - SAMURAI THEME
const lightColors = {
  background: "#0B0B0E",    // Deep dark background (samurai night)
  surface: "#111217",       // Card surface (dark)
  textPrimary: "#F4F4F5",   // Light text (sumi white)
  textSecondary: "#BDBDBD", // Secondary text
  sumi: "#ECECEC",          // Light sumi
  accent: "#EF5350",        // Samurai red accent (matches web app)
  accentSoft: "#3A0E0E",    // Dark red for backgrounds
  matcha: "#66BB6A",        // Green for income
  border: "#1A1A1F",        // Dark border
  shadow: "rgba(0,0,0,0.7)",
  warning: "#FF9800",       // Orange for neutral
  error: "#D32F2F",         // Red for errors
};

const darkColors = {
  background: "#0B0B0E",    // Same dark theme (always dark)
  surface: "#111217",       // Card surface
  textPrimary: "#F4F4F5",   // Light text
  textSecondary: "#BDBDBD", // Secondary text
  sumi: "#ECECEC",          // Light sumi
  accent: "#EF5350",        // Samurai red
  accentSoft: "#3A0E0E",    // Dark red
  matcha: "#66BB6A",        // Green
  border: "#1A1A1F",        // Dark border
  shadow: "rgba(0,0,0,0.7)",
  warning: "#FF9800",       // Orange
  error: "#D32F2F",         // Red
};

export type ThemeColors = typeof lightColors;
export type Theme = {
  colors: ThemeColors;
  spacing: (n: number) => number;
  typography: typeof typography;
  roundness: number;
};

const createTheme = (mode: ColorSchemeName): Theme => {
  const colors = mode === "dark" ? darkColors : lightColors;
  return {
    colors,
    spacing,
    typography,
    roundness: 12,
  };
};

const ThemeContext = createContext<{
  theme: Theme;
  mode: ColorSchemeName;
  setMode: (m: ColorSchemeName) => void;
}>(null as any);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState<ColorSchemeName>(colorScheme ?? "light");

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) setMode(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const theme = useMemo(() => createTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);