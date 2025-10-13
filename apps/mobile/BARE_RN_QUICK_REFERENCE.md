# 🚀 Bare React Native - Quick Reference

## 📱 Common Commands

### Development
```powershell
# Start Metro bundler
npm start

# Run on Android (builds + installs + launches)
npm run android

# Run on Android with specific device
npm run android -- --deviceId=<device-id>

# Run on iOS (macOS only)
npm run ios

# Clear cache and restart
npm start -- --reset-cache
```

### Building
```powershell
# Debug APK (for testing)
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk

# Release APK (for distribution)
./gradlew assembleRelease
# Output: android/app/build/outputs/apk/release/app-release.apk

# Release AAB (for Play Store)
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Debugging
```powershell
# View Android logs
adb logcat | Select-String "ReactNative"

# View all logs
adb logcat

# List connected devices
adb devices

# Reverse port (for API access)
adb reverse tcp:8000 tcp:8000

# Clear app data
adb shell pm clear com.act.app

# Uninstall app
adb uninstall com.act.app

# Install APK manually
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Gradle
```powershell
# Clean build
cd android
./gradlew clean

# Sync dependencies
./gradlew --refresh-dependencies

# List all tasks
./gradlew tasks

# Build with stacktrace (for debugging)
./gradlew assembleDebug --stacktrace
```

---

## 🔧 Common Issues & Fixes

### Issue: "SDK location not found"
```powershell
# Create android/local.properties
echo "sdk.dir=C:\\Users\\$env:USERNAME\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

### Issue: "Execution failed for task ':app:mergeDebugResources'"
```powershell
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### Issue: "Unable to load script from assets"
```powershell
# Ensure Metro is running
npm start

# In another terminal
npm run android
```

### Issue: "Could not connect to development server"
```powershell
# Reverse the port
adb reverse tcp:8081 tcp:8081

# Or shake device and change bundle location to:
# <your-computer-ip>:8081
```

### Issue: Fonts not loading
```powershell
# Clear cache
npm start -- --reset-cache

# Reinstall app
adb uninstall com.act.app
npm run android
```

### Issue: "Duplicate resources"
```powershell
# Clean Gradle cache
cd android
./gradlew clean cleanBuildCache
cd ..
rm -rf android/app/build
npm run android
```

---

## 📂 Important File Locations

### Android
```
android/
├── app/
│   ├── build.gradle              # App-level config (dependencies, signing)
│   ├── src/main/
│   │   ├── AndroidManifest.xml   # Permissions, activities
│   │   ├── java/                 # Native Java/Kotlin code
│   │   └── res/                  # Native resources (icons, strings)
│   └── google-services.json      # Firebase config (add manually)
├── build.gradle                  # Project-level config
├── gradle.properties             # Gradle settings (keystore passwords)
└── local.properties              # SDK location (auto-generated)
```

### Key Files
```
app.config.js                     # Expo config (still used!)
package.json                      # Dependencies & scripts
index.ts                          # Entry point
App.tsx                           # Root component
```

---

## 🔑 Environment Variables

### Required
```powershell
ANDROID_HOME=C:\Users\<YourUsername>\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.x
```

### PATH additions
```powershell
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
%JAVA_HOME%\bin
```

---

## 🎯 Native Module Integration

### Adding a new native module
```powershell
# 1. Install package
npm install <package-name>

# 2. Auto-link (usually automatic)
npx react-native-asset

# 3. Rebuild
npm run android
```

### Manual linking (rare)
```powershell
# If auto-link fails, check package docs
# Usually involves editing:
# - android/app/build.gradle
# - android/settings.gradle
# - android/app/src/main/java/.../MainApplication.java
```

---

## 🔔 Push Notifications Setup

### 1. Add google-services.json
```powershell
# Download from Firebase Console
# Place at: android/app/google-services.json
```

### 2. Verify configuration
```powershell
# Check android/app/build.gradle has:
apply plugin: 'com.google.gms.google-services'

# Check AndroidManifest.xml has notification permissions
# (Already configured by expo-notifications)
```

### 3. Test notifications
```typescript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Get FCM token
const token = (await Notifications.getExpoPushTokenAsync()).data;
console.log('FCM Token:', token);
```

---

## 🏗️ Build Variants

### Debug (default)
- Includes debugging tools
- Connects to Metro bundler
- Larger APK size
- Not optimized

### Release
- Optimized & minified
- No debugging tools
- Smaller APK size
- Requires signing keystore

### Commands
```powershell
# Debug
./gradlew assembleDebug

# Release
./gradlew assembleRelease

# Install debug
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Install release
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔐 Signing Configuration

### Debug (auto-generated)
- Keystore: `android/app/debug.keystore`
- Alias: `androiddebugkey`
- Password: `android`

### Release (you create)
```powershell
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore act-release.keystore -alias act-key -keyalg RSA -keysize 2048 -validity 10000

# Add to gradle.properties
MYAPP_RELEASE_STORE_FILE=act-release.keystore
MYAPP_RELEASE_KEY_ALIAS=act-key
MYAPP_RELEASE_STORE_PASSWORD=<password>
MYAPP_RELEASE_KEY_PASSWORD=<password>
```

---

## 📊 Performance Profiling

### Enable Hermes (already enabled)
```gradle
// android/app/build.gradle
project.ext.react = [
    enableHermes: true  // ✅ Already enabled
]
```

### Profile with Hermes
```powershell
# Generate profile
npm run android -- --variant=release

# Download profile
adb pull /data/user/0/com.act.app/cache/hermes.profile

# Analyze with Chrome DevTools
# chrome://tracing
```

---

## 🧪 Testing

### Unit tests
```powershell
npm test
```

### E2E tests (if configured)
```powershell
# Detox, Appium, etc.
# See testing framework docs
```

### Manual testing checklist
- [ ] App launches
- [ ] Login works
- [ ] Navigation works
- [ ] API calls work
- [ ] Theme switching works
- [ ] Fonts load correctly
- [ ] Notifications work (if configured)

---

## 📦 Release Checklist

Before releasing to Play Store:

- [ ] Update version in `android/app/build.gradle`:
  ```gradle
  versionCode 2
  versionName "1.0.1"
  ```
- [ ] Update version in `package.json`
- [ ] Update version in `app.config.js`
- [ ] Build release AAB: `./gradlew bundleRelease`
- [ ] Test release build on device
- [ ] Generate signed AAB with keystore
- [ ] Upload to Play Console
- [ ] Fill out store listing
- [ ] Submit for review

---

## 🆘 Getting Help

### Logs
```powershell
# Metro bundler logs
# (shown in terminal where you ran 'npm start')

# Android native logs
adb logcat

# React Native logs only
adb logcat | Select-String "ReactNative"

# Gradle build logs
# (shown during build, or in Android Studio)
```

### Useful commands
```powershell
# Check environment
./CHECK_ANDROID_ENV.ps1

# React Native info
npx react-native info

# Expo diagnostics
npx expo-doctor
```

### Resources
- React Native Docs: https://reactnative.dev
- Expo Docs: https://docs.expo.dev
- Android Docs: https://developer.android.com
- Stack Overflow: https://stackoverflow.com/questions/tagged/react-native

---

## 🎓 Learning Resources

### Understanding the build
1. **Gradle** builds the native Android app
2. **Metro** bundles your JavaScript code
3. **React Native** bridges JS and native code
4. **Expo modules** provide native functionality

### Key concepts
- **Prebuild**: Generates native projects from `app.config.js`
- **Auto-linking**: Automatically links native modules
- **Hermes**: Optimized JavaScript engine for React Native
- **JSC**: Alternative JavaScript engine (older)

---

## 💡 Pro Tips

1. **Use Android Studio** for native debugging
   - Open `android/` folder
   - Use "Logcat" tab for logs
   - Use "Build" tab for Gradle errors

2. **Keep Metro running** in a separate terminal
   - Don't close it while developing
   - Restart if you see bundling errors

3. **Clear cache often** when things break
   ```powershell
   npm start -- --reset-cache
   ```

4. **Use EAS Build** for complex builds
   ```powershell
   npx eas build --platform android
   ```

5. **Backup your keystore!**
   - Without it, you can't update your app
   - Store in multiple safe locations

---

## 🔄 Rollback to Managed Workflow

If you need to go back:

```powershell
# Checkout pre-migration state
git checkout pre-eject-backup

# Or manually
git rm -rf android/
git checkout HEAD -- package.json .gitignore
```

---

**Last Updated**: After Expo prebuild migration
**Project**: ACT Gen-1 Mobile App
**Package**: com.act.app