import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'transparent';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  variant = 'background', 
  style, 
  ...props 
}) => {
  const { theme } = useTheme();

  const backgroundColor = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    transparent: 'transparent',
  }[variant];

  return (
    <View 
      style={[{ backgroundColor }, style]} 
      {...props} 
    />
  );
};

export default ThemedView;