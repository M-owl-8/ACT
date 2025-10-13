import React from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface ThemedInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const ThemedInput: React.FC<ThemedInputProps> = ({ 
  label,
  error,
  style,
  ...props 
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: theme.spacing(2) }]}>
      {label && (
        <Text style={[
          styles.label, 
          { 
            color: theme.colors.textSecondary,
            fontSize: theme.typography.sm.fontSize,
            marginBottom: theme.spacing(0.5),
            fontFamily: 'NotoSansJP_500Medium',
          }
        ]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.accent : theme.colors.border,
            color: theme.colors.textPrimary,
            borderRadius: theme.roundness,
            padding: theme.spacing(1.5),
            fontSize: theme.typography.base.fontSize,
            fontFamily: 'NotoSansJP_400Regular',
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textSecondary}
        {...props}
      />
      {error && (
        <Text style={[
          styles.error, 
          { 
            color: theme.colors.accent,
            fontSize: theme.typography.xs.fontSize,
            marginTop: theme.spacing(0.5),
            fontFamily: 'NotoSansJP_400Regular',
          }
        ]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
  },
  error: {},
});

export default ThemedInput;