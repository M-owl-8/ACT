/**
 * Japanese-inspired theme for ACT Gen-1
 * 
 * Design principles:
 * - Minimalism (引き算の美学 - Beauty of subtraction)
 * - Vertical rhythm and spacing
 * - Red/Black/White color palette
 * - Subtle textures
 * - Clean typography
 */

export const JapaneseTheme = {
  // ===== COLORS =====
  colors: {
    // Primary palette
    primary: {
      red: '#D32F2F',        // 赤 (Aka) - Primary red
      redLight: '#EF5350',   // Light red for accents
      redDark: '#B71C1C',    // Dark red for emphasis
      redBg: '#FFEBEE',      // Very light red for backgrounds
    },
    
    // Neutral palette
    neutral: {
      black: '#212121',      // 黒 (Kuro) - Primary black
      charcoal: '#424242',   // Dark gray
      gray: '#757575',       // Medium gray
      lightGray: '#BDBDBD',  // Light gray
      paleGray: '#E0E0E0',   // Very light gray
      white: '#FFFFFF',      // 白 (Shiro) - Pure white
      offWhite: '#FAFAFA',   // Off-white for backgrounds
    },
    
    // Semantic colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#D32F2F',
    info: '#2196F3',
    
    // Background
    background: {
      primary: '#FAFAFA',
      secondary: '#FFFFFF',
      tertiary: '#F5F5F5',
    },
    
    // Text
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    
    // Borders
    border: {
      light: '#E0E0E0',
      medium: '#BDBDBD',
      dark: '#757575',
    },
  },

  // ===== TYPOGRAPHY =====
  typography: {
    // Font families
    fontFamily: {
      primary: 'System',     // Use system font for best performance
      mono: 'Courier',       // Monospace for numbers
    },
    
    // Font sizes (vertical rhythm based on 4px grid)
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 40,
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Line heights (for vertical rhythm)
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  // ===== SPACING =====
  // Based on 4px grid system
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },

  // ===== BORDERS =====
  borders: {
    radius: {
      none: 0,
      sm: 4,
      base: 8,
      md: 12,
      lg: 16,
      full: 9999,
    },
    width: {
      thin: 1,
      base: 2,
      thick: 4,
    },
  },

  // ===== SHADOWS =====
  shadows: {
    // Subtle shadows for depth
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // ===== COMPONENTS =====
  components: {
    // Card
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      },
    },
    
    // Button
    button: {
      primary: {
        backgroundColor: '#D32F2F',
        color: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
      secondary: {
        backgroundColor: '#FFFFFF',
        color: '#D32F2F',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: '#D32F2F',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#D32F2F',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
    },
    
    // Input
    input: {
      backgroundColor: '#FAFAFA',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      padding: 12,
      fontSize: 16,
      color: '#212121',
    },
    
    // Header
    header: {
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },

  // ===== DARK MODE =====
  dark: {
    colors: {
      primary: {
        red: '#EF5350',
        redLight: '#FF6F6F',
        redDark: '#D32F2F',
        redBg: '#3E2723',
      },
      neutral: {
        black: '#FAFAFA',
        charcoal: '#E0E0E0',
        gray: '#BDBDBD',
        lightGray: '#757575',
        paleGray: '#424242',
        white: '#121212',
        offWhite: '#1E1E1E',
      },
      background: {
        primary: '#121212',
        secondary: '#1E1E1E',
        tertiary: '#2C2C2C',
      },
      text: {
        primary: '#FAFAFA',
        secondary: '#BDBDBD',
        disabled: '#757575',
        inverse: '#212121',
      },
      border: {
        light: '#424242',
        medium: '#757575',
        dark: '#BDBDBD',
      },
    },
  },
};

// ===== HELPER FUNCTIONS =====

/**
 * Get color with opacity
 */
export const withOpacity = (color: string, opacity: number): string => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

/**
 * Get spacing value
 */
export const spacing = (multiplier: number): number => {
  return JapaneseTheme.spacing.base * multiplier;
};

/**
 * Get responsive font size
 */
export const responsiveFontSize = (size: keyof typeof JapaneseTheme.typography.fontSize): number => {
  return JapaneseTheme.typography.fontSize[size];
};

export default JapaneseTheme;