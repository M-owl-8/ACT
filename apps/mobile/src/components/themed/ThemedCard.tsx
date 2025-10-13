import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedCardProps extends ViewProps {
  padding?: number;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({ 
  padding,
  style, 
  children,
  ...props 
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness,
          padding: padding !== undefined ? theme.spacing(padding) : theme.spacing(2),
          shadowColor: theme.colors.sumi,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        style
      ]} 
      {...props} 
    >
      {children}
    </View>
  );
};

export default ThemedCard;