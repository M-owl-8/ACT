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

    // Hide welcome screen after 2 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
      </View>
    );
  }

  if (showWelcome) {
    return (
      <View style={styles.welcomeContainer}>
        <JapaneseNightBackdrop intensity={0.9} vignetteOpacity={0.28} />
        <View style={styles.welcomeContent}>
          <Text style={styles.appTitle}>ACT Gen-1</Text>
          <Text style={styles.katana}>🗡️</Text>
          <Text style={styles.subtitle}>Dashboard • 7/30 day totals</Text>
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B71C1C" />
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
  },
  welcomeContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 10,
  },
  katana: {
    fontSize: 120,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
});









