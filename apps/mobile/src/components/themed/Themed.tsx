import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { useTheme } from "../../theme";

export const Header: React.FC<{ title: string }> = ({ title }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.headerText, { color: theme.colors.sumi, fontFamily: "NotoSansJP_500Medium" }]}>
        {title}
      </Text>
    </View>
  );
};

export const Card: React.FC<{ style?: ViewStyle; children?: React.ReactNode }> = ({ children, style }) => {
  const { theme } = useTheme();
  return (
    <View style={[{
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness,
      padding: theme.spacing(2),
      shadowColor: theme.colors.sumi,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    }, style]}>
      {children}
    </View>
  );
};

export const PrimaryButton: React.FC<{ 
  onPress?: () => void; 
  label: string; 
  style?: ViewStyle;
  disabled?: boolean;
}> = ({ onPress, label, style, disabled }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[{
        backgroundColor: theme.colors.accent,
        paddingVertical: theme.spacing(1.5),
        paddingHorizontal: theme.spacing(3),
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }, style]}
    >
      <Text style={{ 
        color: "#fff", 
        fontFamily: "NotoSansJP_700Bold", 
        fontSize: theme.typography.base.fontSize 
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerText: {
    fontSize: 20,
  },
});