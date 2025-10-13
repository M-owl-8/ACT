import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  variant = 'primary',
  size = 'base',
  loading = false,
  disabled,
  style,
  children,
  ...props 
}) => {
  const { theme } = useTheme();

  const buttonStyles = {
    primary: {
      backgroundColor: theme.colors.accent,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: theme.colors.accent,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
  }[variant];

  const textColor = {
    primary: '#FFFFFF',
    secondary: theme.colors.accent,
    ghost: theme.colors.accent,
  }[variant];

  const sizeStyles = {
    sm: {
      paddingVertical: theme.spacing(1),
      paddingHorizontal: theme.spacing(2),
      fontSize: theme.typography.sm.fontSize,
    },
    base: {
      paddingVertical: theme.spacing(1.5),
      paddingHorizontal: theme.spacing(3),
      fontSize: theme.typography.base.fontSize,
    },
    lg: {
      paddingVertical: theme.spacing(2),
      paddingHorizontal: theme.spacing(4),
      fontSize: theme.typography.lg.fontSize,
    },
  }[size];

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        buttonStyles,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize: sizeStyles.fontSize }]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Accessibility minimum touch target
  },
  text: {
    fontWeight: '600',
    fontFamily: 'NotoSansJP_500Medium',
  },
});

export default ThemedButton;