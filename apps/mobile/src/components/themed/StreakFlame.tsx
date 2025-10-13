import React from "react";
import { Animated, Easing, View, Text } from "react-native";
import { useTheme } from "../../theme";

export const StreakFlame: React.FC<{ days: number }> = ({ days }) => {
  const { theme } = useTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { 
          toValue: 1.07, 
          duration: 500, 
          easing: Easing.inOut(Easing.ease), 
          useNativeDriver: true 
        }),
        Animated.timing(scale, { 
          toValue: 1, 
          duration: 500, 
          easing: Easing.inOut(Easing.ease), 
          useNativeDriver: true 
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }], alignItems: 'center' }}>
      <View style={{
        backgroundColor: theme.colors.accent,
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text style={{ fontSize: 28 }}>🔥</Text>
      </View>
      <Text style={{ 
        color: theme.colors.textSecondary, 
        marginTop: 6, 
        fontFamily: "NotoSansJP_400Regular",
        fontSize: 12,
      }}>
        {days} days
      </Text>
    </Animated.View>
  );
};