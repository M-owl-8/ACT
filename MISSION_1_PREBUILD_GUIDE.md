# 🚀 Mission 1: Expo Prebuild - Complete Guide

## Overview
This guide will help you convert your Expo managed workflow to bare React Native, giving you full control over native code while keeping Expo's excellent developer experience.

---

## ⚠️ Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Android Studio installed (for Android development)
- ✅ Xcode installed (for iOS development - macOS only)
- ✅ Java JDK 17+ installed
- ✅ Git committed (backup your work!)

---

## 📋 Step-by-Step Instructions

### Step 1: Backup Your Project
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1
git add .
git commit -m "Pre-prebuild backup"
```

### Step 2: Navigate to Mobile Directory
```powershell
cd apps\mobile
```

### Step 3: Run Expo Prebuild
```powershell
npx expo prebuild --clean
```

**What this does:**
- Creates `android/` folder with native Android code
- Creates `ios/` folder with native iOS code (macOS only)
- Configures native dependencies
- Sets up build configurations

**Expected output:**
```
✔ Created native projects | /android, /ios
✔ Updated package.json scripts
✔ Config synced
```

### Step 4: Verify Native Folders

Check that these folders were created:
```
apps/mobile/
├── android/
│   ├── app/
│   │   ├── build.gradle
│   │   └── src/
│   ├── gradle/
│   └── build.gradle
└── ios/ (macOS only)
    ├── ACT/
    ├── ACT.xcodeproj/
    └── ACT.xcworkspace/
```

---

## 🔧 Post-Prebuild Configuration

### Android Configuration

#### 1. Update `android/app/build.gradle`

Add these configurations:

```gradle
android {
    // ... existing config ...
    
    defaultConfig {
        // ... existing config ...
        minSdkVersion 23  // Ensure this is at least 23
        targetSdkVersion 34
        multiDexEnabled true
    }
    
    // Add this if not present
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}
```

#### 2. Update `android/gradle.properties`

Add these lines if not present:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
android.enableJetifier=true
```

#### 3. Verify `android/build.gradle`

Ensure you have:
```gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 23
        compileSdkVersion = 34
        targetSdkVersion = 34
        kotlinVersion = "1.9.0"
    }
    // ...
}
```

### iOS Configuration (macOS only)

#### 1. Install CocoaPods Dependencies
```bash
cd ios
pod install
cd ..
```

#### 2. Open Xcode Workspace
```bash
open ios/ACT.xcworkspace
```

#### 3. Configure Signing
- Select your project in Xcode
- Go to "Signing & Capabilities"
- Select your development team
- Ensure bundle identifier is `com.act.app`

---

## 🧪 Testing Native Builds

### Test Android Build

#### Option 1: Using Android Studio
1. Open Android Studio
2. Open the `android` folder
3. Wait for Gradle sync to complete
4. Click "Run" button or press Shift+F10

#### Option 2: Using Command Line
```powershell
# From apps/mobile directory
npx expo run:android
```

**Troubleshooting:**
- If Gradle fails, try: `cd android && .\gradlew clean && cd ..`
- If Metro bundler issues: `npx expo start --clear`
- If dependency issues: `npm install` and retry

### Test iOS Build (macOS only)

```bash
npx expo run:ios
```

Or open `ios/ACT.xcworkspace` in Xcode and press Cmd+R

---

## 🔍 Verify Native Dependencies

After prebuild, verify these critical dependencies work:

### 1. Test expo-secure-store
```typescript
import * as SecureStore from 'expo-secure-store';

// Should work in bare workflow
await SecureStore.setItemAsync('test', 'value');
const value = await SecureStore.getItemAsync('test');
```

### 2. Test expo-notifications
```typescript
import * as Notifications from 'expo-notifications';

// Should work in bare workflow
const { status } = await Notifications.requestPermissionsAsync();
```

### 3. Test expo-blur
```typescript
import { BlurView } from 'expo-blur';

// Should render correctly
<BlurView intensity={80} style={styles.blur} />
```

---

## 📱 Testing on Physical Device

### Android Physical Device

1. **Enable Developer Options:**
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. **Connect Device:**
   - Connect via USB
   - Accept USB debugging prompt on device

3. **Run App:**
   ```powershell
   npx expo run:android --device
   ```

### iOS Physical Device (macOS only)

1. **Register Device:**
   - Connect device via USB
   - Open Xcode
   - Window > Devices and Simulators
   - Trust device

2. **Configure Signing:**
   - Select device in Xcode
   - Ensure proper provisioning profile

3. **Run App:**
   ```bash
   npx expo run:ios --device
   ```

---

## 🐛 Common Issues & Solutions

### Issue 1: Gradle Build Failed
**Solution:**
```powershell
cd android
.\gradlew clean
cd ..
npm install
npx expo prebuild --clean
```

### Issue 2: Metro Bundler Port Conflict
**Solution:**
```powershell
npx expo start --clear --port 8082
```

### Issue 3: Native Module Not Found
**Solution:**
```powershell
# Clear everything
rm -rf node_modules
rm -rf android
rm -rf ios
npm install
npx expo prebuild
```

### Issue 4: Android Build Tools Not Found
**Solution:**
- Open Android Studio
- Tools > SDK Manager
- Install Android SDK Build-Tools 34.0.0
- Install Android SDK Platform 34

### Issue 5: CocoaPods Install Failed (iOS)
**Solution:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

---

## ✅ Success Criteria

You've successfully completed Mission 1 when:

- ✅ `android/` folder exists with proper structure
- ✅ `ios/` folder exists (macOS only)
- ✅ `npx expo run:android` builds successfully
- ✅ `npx expo run:ios` builds successfully (macOS only)
- ✅ App runs on Android emulator
- ✅ App runs on physical Android device
- ✅ expo-secure-store works in bare workflow
- ✅ expo-notifications works in bare workflow
- ✅ All existing features still work
- ✅ No JavaScript errors in Metro bundler

---

## 📊 What Changed?

### Before Prebuild (Managed Workflow)
```
apps/mobile/
├── src/
├── assets/
├── app.json
├── package.json
└── index.ts
```

### After Prebuild (Bare Workflow)
```
apps/mobile/
├── android/          ← NEW: Native Android code
├── ios/              ← NEW: Native iOS code
├── src/
├── assets/
├── app.json
├── package.json
└── index.ts
```

**Key Benefits:**
- ✅ Full control over native code
- ✅ Can add custom native modules
- ✅ Better performance optimization
- ✅ Direct access to native APIs
- ✅ Still use Expo SDK modules
- ✅ Easier to integrate third-party native libraries

---

## 🎯 Next Steps

After completing prebuild:

1. **Test thoroughly** - Verify all 19 screens work
2. **Commit changes** - `git add . && git commit -m "Completed expo prebuild"`
3. **Move to Mission 2** - Set up Firebase Cloud Messaging
4. **Update documentation** - Note any issues encountered

---

## 📚 Additional Resources

- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [Expo Bare Workflow](https://docs.expo.dev/bare/overview/)
- [Android Studio Setup](https://developer.android.com/studio)
- [Xcode Setup](https://developer.apple.com/xcode/)

---

## 💡 Pro Tips

1. **Always backup before prebuild** - Use git!
2. **Clean builds solve 90% of issues** - Use `--clean` flag
3. **Keep Expo SDK updated** - Run `npx expo-doctor` regularly
4. **Test on real devices** - Emulators don't catch everything
5. **Read error messages carefully** - They usually tell you exactly what's wrong

---

**Good luck with Mission 1! 🚀**

If you encounter any issues not covered here, check the Expo documentation or ask for help.