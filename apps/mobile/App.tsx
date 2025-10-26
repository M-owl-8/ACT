// apps/mobile/App.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
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

// Import auto-save services
import { initDatabase } from "./src/services/database";
import { initializeSyncService, cleanupSyncService } from "./src/services/syncService";
import { useSettingsStore } from "./src/store/settings";

// Initialize Sentry at app startup
initSentry();

export default function App() {
  const { t, i18n } = useTranslation();
  const { initializeAuth, isLoading } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const [appInitialized, setAppInitialized] = React.useState(false);
  const [languageReady, setLanguageReady] = React.useState(false);
  const [appKey, setAppKey] = React.useState(0); // Force full app re-render on language change
  
  // Load Noto Sans JP fonts
  const [fontsLoaded] = useFonts({
    NotoSansJP_400Regular,
    NotoSansJP_500Medium,
    NotoSansJP_700Bold,
  });

  // Listen for language changes and force full app re-render
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log(`🌍 App.tsx: LANGUAGE CHANGED TO: ${lng}`);
      // Force the ENTIRE app to re-render by changing the key
      setAppKey(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Wait for i18n to be ready and language to be detected
  useEffect(() => {
    const waitForI18n = async () => {
      try {
        console.log('⏳ App.tsx: Waiting for i18n and language detection...');
        console.log(`  ├─ i18n.isInitialized: ${i18n.isInitialized}`);
        console.log(`  └─ i18n.language: ${i18n.language}`);
        
        // Create a promise that resolves when 'loaded' event fires (language detection complete)
        const languageDetectionPromise = new Promise<void>(resolve => {
          // If already loaded, resolve immediately
          if (i18n.isInitialized) {
            console.log('✅ App.tsx: i18n already initialized with language:', i18n.language);
            resolve();
          } else {
            // Otherwise wait for 'loaded' event which fires after language detection
            const handleLoaded = () => {
              console.log('✅ App.tsx: i18n loaded event fired with language:', i18n.language);
              i18n.off('loaded', handleLoaded);
              resolve();
            };
            i18n.on('loaded', handleLoaded);
            
            // Also timeout after 5 seconds just to be safe
            setTimeout(() => {
              i18n.off('loaded', handleLoaded);
              console.warn('⚠️ App.tsx: i18n loading timeout, continuing with language:', i18n.language);
              resolve();
            }, 5000);
          }
        });
        
        await languageDetectionPromise;
        console.log(`✅ App.tsx: Language detection complete. Current language: ${i18n.language}`);
        console.log(`  ├─ t('settings'): "${t('settings')}"`);
        console.log(`  ├─ t('accountDetails'): "${t('accountDetails')}"`);
        console.log(`  └─ t('login'): "${t('login')}"`);
        setLanguageReady(true);
      } catch (error) {
        console.error('App.tsx: Error waiting for i18n:', error);
        setLanguageReady(true);
      }
    };

    waitForI18n();
  }, [i18n, t]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Make sure we wait for language to be ready
        if (!languageReady) {
          console.log('⏳ Waiting for language to be ready...');
          return;
        }

        // Initialize local database
        await initDatabase();
        
        // Initialize auth on app start
        await initializeAuth();
        
        // Load user settings from storage (including language)
        await loadSettings();
        
        console.log(`✅ App initialization complete. Current language: ${i18n.language}`);
        setAppInitialized(true);
        
        // Initialize sync service for offline support
        await initializeSyncService();
        
        // Initialize notifications
        await initializeNotifications();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppInitialized(true); // Still continue even if initialization fails
      }
    };

    if (languageReady && fontsLoaded) {
      initializeApp();
    }

    // Cleanup on app unmount
    return () => {
      cleanupSyncService();
    };
  }, [languageReady, fontsLoaded]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <JapaneseNightBackdrop intensity={0.85} vignetteOpacity={0.3} />
        <ActivityIndicator size="large" color="#EF5350" style={styles.centerIndicator} />
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
    <ThemeProvider key={`app-theme-${appKey}`}>
      <AppNavigator key={`app-navigator-${appKey}`} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
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










