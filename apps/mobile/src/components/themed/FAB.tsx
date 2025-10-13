import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme";

export const FAB: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[fabStyles.fab, {
        backgroundColor: theme.colors.matcha,
        shadowColor: theme.colors.sumi,
      }]}
    >
      <Text style={{ color: "#fff", fontFamily: "NotoSansJP_700Bold", fontSize: 20 }}>＋</Text>
    </TouchableOpacity>
  );
};

const fabStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 18,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});