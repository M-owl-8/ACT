import * as fs from 'fs';
import * as path from 'path';

export default ({ config }) => {
  // Check if google-services.json exists
  const googleServicesPath = path.resolve(__dirname, 'google-services.json');
  const hasGoogleServices = fs.existsSync(googleServicesPath);

  const androidConfig = {
    package: "com.act.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff"
    },
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "POST_NOTIFICATIONS"
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false
  };

  // Only add googleServicesFile if the file exists
  if (hasGoogleServices) {
    androidConfig.googleServicesFile = "./google-services.json";
  }

  return {
    ...config,
    name: "ACT",
    slug: "act-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.act.app"
    },
    android: androidConfig,
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-secure-store",
      "expo-sqlite",
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff",
          sounds: []
        }
      ],
      "./plugins/android-manifest-fix.js"
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || "0d2ff065-1b12-4766-b547-3bdeea01cb0a"
      },
      apiUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "https://act-production-8080.up.railway.app"
    },
    owner: process.env.EXPO_OWNER || "owl_wilde"
  };
};