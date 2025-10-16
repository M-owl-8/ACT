import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'inverse';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'title' | 'h1';
  weight?: 'regular' | 'medium' | 'bold';
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  variant = 'primary',
  size = 'base',
  weight = 'regular',
  style, 
  ...props 
}) => {
  const { theme } = useTheme();

  const color = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    accent: theme.colors.accent,
    inverse: '#FFFFFF',
  }[variant];

  const fontFamily = {
    regular: 'NotoSansJP_400Regular',
    medium: 'NotoSansJP_500Medium',
    bold: 'NotoSansJP_700Bold',
  }[weight];

  const textStyle = theme.typography[size];

  return (
    <Text 
      style={[
        { 
          color, 
          fontFamily,
          fontSize: textStyle?.fontSize,
          lineHeight: textStyle?.lineHeight,
          fontWeight: textStyle?.fontWeight,
        }, 
        style
      ]} 
      {...props} 
    />
  );
};

export default ThemedText;