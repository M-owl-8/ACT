// apps/mobile/App.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { useTranslation } from "react-i18next";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/auth";
import JapaneseNightBackdrop from "./src/components/JapaneseNightBackdrop";
import { ThemeProvider } from "./src/theme";
import { 
  useFonts,
  NotoSansJP_400Regular,
  NotoSansJP_500Medium,
  NotoSansJP_700Bold,
} from "@expo-google-fonts/noto-sans-jp";
import "./src/i18n";

// Import Sentry for crash reporting
import { initSentry } from "./src/services/sentryService";

// Import notification service
import { initializeNotifications } from "./src/services/notificationService";

// Initialize Sentry at app startup
initSentry();

export default function App() {
  const { t } = useTranslation();
  const [showWelcome, setShowWelcome] = useState(true);
  const { initializeAuth, isLoading } = useAuthStore();
  
  // Load Noto Sans JP fonts
  const [fontsLoaded] = useFonts({
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
  });

  useEffect(() => {
    // Initialize auth on app start
    initializeAuth();
    
    // Initialize notifications
    initializeNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });

    // Hide welcome screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.3} />
        <ActivityIndicator size="large" color="#EF5350" style={styles.centerIndicator} />
      </View>
    );
  }

  if (showWelcome) {
    return (
      <View style={styles.welcomeContainer}>
        <JapaneseNightBackdrop intensity={0.9} vignetteOpacity={0.32} />
        <View style={styles.welcomeContent}>
          {/* ACT Header with Japanese characters */}
          <View style={styles.headerRow}>
            <Text style={styles.kanji}>行</Text>
            <Text style={styles.appTitle}>ACT</Text>
          </View>
          
          {/* Red divider line */}
          <View style={styles.redDivider} />
          
          {/* Katana emoji */}
          <Text style={styles.katana}>🗡️</Text>
          
          {/* Subtitle with Japanese and English */}
          <Text style={styles.japaneseSubtitle}>財務管理</Text>
          <Text style={styles.subtitle}>Finance Dashboard • Master Your Money</Text>
          
          {/* Loading indicator */}
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#EF5350" />
            <Text style={styles.loadingText}>Initializing...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.3} />
        <ActivityIndicator size="large" color="#EF5350" style={styles.centerIndicator} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0B0E",
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  kanji: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F4F4F5",
    marginRight: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "700",
    color: "#EF5350",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  redDivider: {
    height: 2,
    width: 80,
    backgroundColor: "#EF5350",
    marginVertical: 12,
  },
  katana: {
    fontSize: 100,
    marginVertical: 12,
  },
  japaneseSubtitle: {
    fontSize: 16,
    color: "rgba(244,244,245,0.7)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(189,189,189,0.9)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 32,
    fontWeight: "500",
  },
  loaderContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: "rgba(189,189,189,0.7)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0B0E",
  },
  centerIndicator: {
    position: "absolute",
    zIndex: 10,
  },
});










