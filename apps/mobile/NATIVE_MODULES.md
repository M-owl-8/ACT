# Native Modules Setup

This document explains how to fix native module issues like `expo-blur` warnings.

## Problem

When you see warnings like:
```
WARN  The native view manager for module(ExpoBlurView) from NativeViewManagerAdapter isn't exported by expo-modules-core
```

This means the native module needs to be rebuilt in your development client.

## Solution

### Option 1: Rebuild Development Client (Recommended)

When using `expo-dev-client`, native modules need to be compiled into the development build.

#### For Android:

```bash
# Navigate to mobile app directory
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Clean previous builds
npx expo prebuild --clean

# Build the development client for Android
npx expo run:android
```

This will:
1. Generate native Android project files
2. Install all native modules (including expo-blur)
3. Build and install the development client on your device/emulator

#### For iOS (if on Mac):

```bash
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npx expo prebuild --clean
npx expo run:ios
```

### Option 2: Use Expo Go (Limited)

If you don't need custom native modules, you can use Expo Go:

```bash
npm start
# Then scan QR code with Expo Go app
```

**Note**: Expo Go doesn't support all native modules. `expo-blur` should work, but custom native code won't.

### Option 3: Use EAS Build (Production)

For production builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

## Current Fallback

The app currently has a fallback for `expo-blur`:
- ✅ If expo-blur is available: Uses native blur effect
- ✅ If expo-blur is not available: Uses semi-transparent View as fallback

This means the app will work even without rebuilding, but you'll see the warning and won't get the blur effect.

## Checking if Native Modules are Working

After rebuilding, you should see:
- ✅ No warnings about ExpoBlurView
- ✅ Blur effects working properly in the UI
- ✅ Console log: "✅ Sentry package loaded" (if Sentry is installed)

## Troubleshooting

### "Port 8081 is being used"
```bash
# Kill the process using port 8081
npx kill-port 8081
# Or use a different port
npx expo start --port 8082
```

### "Build failed"
```bash
# Clean everything and start fresh
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npx expo prebuild --clean
```

## Summary

- **Quick Fix**: The app works with fallbacks (current state)
- **Proper Fix**: Run `npx expo run:android` to rebuild with native modules
- **Production**: Use EAS Build for production apps

Choose the option that best fits your development workflow!