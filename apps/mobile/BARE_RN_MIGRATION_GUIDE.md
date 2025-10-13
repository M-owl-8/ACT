# 🚀 Expo to Bare React Native Migration Guide

## ✅ What Has Been Done (Automated)

### 1. Pre-Migration Backup
- ✅ All changes committed to Git
- ✅ Created Git tag: `pre-eject-backup`
- ✅ Safe rollback point available: `git checkout pre-eject-backup`

### 2. Native Android Project Generated
- ✅ Ran `npx expo prebuild` successfully
- ✅ Created `android/` folder with full native project
- ✅ Updated `package.json` scripts:
  - `"android": "expo run:android"` (was `expo start --android`)
  - `"ios": "expo run:ios"` (was `expo start --ios`)
- ✅ Updated `.gitignore` to commit Android folder (iOS still ignored)

### 3. Current Project Structure
```
apps/mobile/
├── android/              ✅ NEW - Native Android project
│   ├── app/
│   │   ├── build.gradle  ✅ App-level Gradle config
│   │   └── src/          ✅ Native Android source
│   ├── build.gradle      ✅ Project-level Gradle
│   ├── gradle.properties ✅ Gradle properties
│   └── settings.gradle   ✅ Gradle settings
├── src/                  ✅ Your React Native code (unchanged)
├── app.config.js         ✅ Expo config (still used)
├── package.json          ✅ Updated scripts
└── .gitignore            ✅ Updated to commit android/
```

---

## 📋 MANUAL TASKS YOU NEED TO DO

### 🔴 CRITICAL - Must Do Before Running App

#### Task 1: Install Android Development Environment
**Status**: ⚠️ REQUIRED - Cannot build without this

**What to do**:
1. **Install Java JDK 17** (required for React Native 0.81.4):
   ```powershell
   # Download from: https://adoptium.net/temurin/releases/
   # Or use Chocolatey:
   choco install temurin17
   ```

2. **Install Android Studio**:
   - Download: https://developer.android.com/studio
   - During installation, ensure these are checked:
     - ✅ Android SDK
     - ✅ Android SDK Platform
     - ✅ Android Virtual Device (AVD)

3. **Configure Android SDK**:
   - Open Android Studio
   - Go to: Settings → Appearance & Behavior → System Settings → Android SDK
   - Install:
     - ✅ Android 14.0 (API 34) - matches your app
     - ✅ Android SDK Build-Tools 34.0.0
     - ✅ Android SDK Platform-Tools
     - ✅ Android SDK Command-line Tools

4. **Set Environment Variables**:
   ```powershell
   # Add to System Environment Variables:
   ANDROID_HOME = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   
   # Add to PATH:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

5. **Verify Installation**:
   ```powershell
   java -version        # Should show Java 17
   adb version          # Should show Android Debug Bridge
   ```

**Time Estimate**: 30-60 minutes

---

#### Task 2: Test Android Build
**Status**: ⚠️ REQUIRED - Verify everything works

**What to do**:
1. **Start an Android Emulator**:
   - Open Android Studio
   - Click "Device Manager" (phone icon)
   - Create a new Virtual Device (Pixel 5, API 34 recommended)
   - Start the emulator

2. **Run the app**:
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm run android
   ```

3. **Expected outcome**:
   - Gradle builds successfully
   - App installs on emulator
   - App launches and shows login screen

4. **If build fails**:
   - Open `android/` folder in Android Studio
   - Let Gradle sync
   - Check error messages in "Build" tab
   - Fix any SDK version mismatches

**Time Estimate**: 15-30 minutes

---

### 🟡 IMPORTANT - Recommended for Production

#### Task 3: Configure Firebase Cloud Messaging (FCM)
**Status**: 🟡 OPTIONAL NOW - Required for push notifications

**What to do**:
1. **Get google-services.json**:
   - Go to Firebase Console: https://console.firebase.google.com
   - Select your project (or create one)
   - Add Android app with package: `com.act.app`
   - Download `google-services.json`

2. **Place the file**:
   ```powershell
   # Copy to:
   c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app\google-services.json
   ```

3. **Verify it's configured**:
   - File is already referenced in `app.config.js`
   - Expo will auto-configure it during prebuild

**Time Estimate**: 10 minutes

---

#### Task 4: Create Android Release Keystore
**Status**: 🟡 OPTIONAL NOW - Required for Play Store release

**What to do**:
1. **Generate keystore**:
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app
   
   keytool -genkeypair -v -storetype PKCS12 -keystore act-release.keystore -alias act-key -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Enter details when prompted**:
   - Password: (choose strong password - SAVE IT!)
   - Name: Your name or company
   - Organization: Your organization
   - City, State, Country: Your location

3. **⚠️ BACKUP THE KEYSTORE**:
   ```powershell
   # Copy to safe location (USB drive, cloud storage)
   # WITHOUT THIS FILE YOU CANNOT UPDATE YOUR APP ON PLAY STORE!
   ```

4. **Configure Gradle** (create new file):
   ```powershell
   # Create: android/gradle.properties (add to existing file)
   ```
   Add these lines:
   ```properties
   MYAPP_RELEASE_STORE_FILE=act-release.keystore
   MYAPP_RELEASE_KEY_ALIAS=act-key
   MYAPP_RELEASE_STORE_PASSWORD=<your-password>
   MYAPP_RELEASE_KEY_PASSWORD=<your-password>
   ```

5. **Update app/build.gradle**:
   Find the `signingConfigs` section and add:
   ```gradle
   signingConfigs {
       release {
           if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
               storeFile file(MYAPP_RELEASE_STORE_FILE)
               storePassword MYAPP_RELEASE_STORE_PASSWORD
               keyAlias MYAPP_RELEASE_KEY_ALIAS
               keyPassword MYAPP_RELEASE_KEY_PASSWORD
           }
       }
   }
   ```

**Time Estimate**: 15 minutes

---

#### Task 5: Configure Crash Reporting (Sentry)
**Status**: 🟡 OPTIONAL - Recommended for production

**What to do**:
1. **Install Sentry**:
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm install @sentry/react-native
   npx @sentry/wizard -i reactNative -p android
   ```

2. **Follow wizard prompts**:
   - Login to Sentry (or create account)
   - Select/create project
   - Wizard will auto-configure Android

3. **Initialize in App.tsx**:
   ```typescript
   import * as Sentry from '@sentry/react-native';
   
   Sentry.init({
     dsn: 'YOUR_SENTRY_DSN',
     enableAutoSessionTracking: true,
     tracesSampleRate: 1.0,
   });
   ```

**Time Estimate**: 20 minutes

---

### 🟢 OPTIONAL - Nice to Have

#### Task 6: iOS Setup (Requires macOS)
**Status**: 🟢 OPTIONAL - Only if you have Mac

**What to do**:
1. **On macOS machine**:
   ```bash
   cd /path/to/act-gen1/apps/mobile
   npx expo prebuild --platform ios
   cd ios
   pod install
   ```

2. **Open in Xcode**:
   ```bash
   open ios/mobile.xcworkspace
   ```

3. **Configure**:
   - Set Development Team
   - Set Bundle Identifier: `com.act.app`
   - Configure signing certificates

**Time Estimate**: 30-60 minutes (on Mac)

---

#### Task 7: Update CI/CD Pipeline
**Status**: 🟢 OPTIONAL - If you use CI/CD

**What to do**:
1. **Update GitHub Actions / CI config** to:
   - Install JDK 17
   - Install Android SDK
   - Run `./gradlew assembleRelease` for Android builds
   - Upload APK/AAB artifacts

2. **Or use EAS Build** (still works with bare projects):
   ```powershell
   npx eas build --platform android
   ```

**Time Estimate**: 30 minutes

---

## 🧪 Testing Checklist

After completing Task 1 & 2, test these:

- [ ] App builds successfully: `npm run android`
- [ ] App launches on emulator
- [ ] Login screen displays correctly
- [ ] Japanese theme loads (Noto Sans JP fonts)
- [ ] Navigation works (bottom tabs)
- [ ] API calls work (check network in dev tools)
- [ ] Theme switching works (light/dark mode)
- [ ] All screens accessible

---

## 🔧 Troubleshooting

### Build Error: "SDK location not found"
**Solution**:
```powershell
# Create android/local.properties:
sdk.dir=C:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk
```

### Build Error: "Gradle version mismatch"
**Solution**:
- Open `android/` in Android Studio
- Click "File → Sync Project with Gradle Files"
- Accept any Gradle upgrade prompts

### Build Error: "Java version mismatch"
**Solution**:
```powershell
# Check Java version:
java -version

# Should be Java 17. If not, install JDK 17 and set JAVA_HOME:
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x
```

### App crashes on launch
**Solution**:
1. Check Metro bundler is running: `npm start`
2. Check logcat: `adb logcat | Select-String "ReactNative"`
3. Clear cache: `npm start -- --reset-cache`

### Fonts not loading
**Solution**:
- Fonts are loaded via `expo-font` in `App.tsx`
- Check console for font loading errors
- Ensure `@expo-google-fonts/noto-sans-jp` is installed

---

## 📦 What Changed in package.json

### Scripts Updated
```json
{
  "scripts": {
    "start": "expo start",           // Unchanged - starts Metro
    "android": "expo run:android",   // NEW - builds & runs native
    "ios": "expo run:ios",           // NEW - builds & runs native (Mac only)
    "web": "expo start --web"        // Unchanged
  }
}
```

### No New Dependencies
- All Expo packages still work
- `expo-notifications`, `expo-secure-store`, etc. are compatible
- Native modules auto-link via `autolinkLibrariesWithApp()`

---

## 🎯 Key Differences: Managed vs Bare

| Feature | Managed (Before) | Bare (Now) |
|---------|-----------------|------------|
| **Native Code** | Hidden by Expo | Full access in `android/` |
| **Build** | EAS Build only | Local Gradle or EAS |
| **Native Modules** | Limited to Expo | Any React Native module |
| **Push Notifications** | Expo Push | FCM/APNs directly |
| **Updates** | Expo Updates | Custom OTA or app stores |
| **Debugging** | Expo tools | Android Studio / Xcode |

---

## 🚨 Important Notes

1. **iOS Folder Not Created**: 
   - iOS prebuild requires macOS
   - Android-only development works fine
   - Use EAS Build for iOS if needed

2. **Expo Features Still Work**:
   - `expo-notifications` ✅
   - `expo-secure-store` ✅
   - `expo-font` ✅
   - All your Expo packages are compatible

3. **Git Backup**:
   - Rollback anytime: `git checkout pre-eject-backup`
   - Android folder is now committed to Git

4. **Next Steps Priority**:
   1. ✅ Task 1 (Android SDK) - MUST DO
   2. ✅ Task 2 (Test build) - MUST DO
   3. 🟡 Task 3 (Firebase) - Do before production
   4. 🟡 Task 4 (Keystore) - Do before Play Store
   5. 🟢 Others - Optional

---

## 📞 Need Help?

- **Android Studio Issues**: Check Android Studio's "Build" tab for errors
- **Gradle Issues**: Run `./gradlew clean` in `android/` folder
- **Metro Issues**: Run `npm start -- --reset-cache`
- **General RN Issues**: Check React Native docs: https://reactnative.dev/docs/environment-setup

---

## ✅ Summary

**What's Done**:
- ✅ Android native project created
- ✅ Git backup created
- ✅ Scripts updated
- ✅ Ready for native development

**What You Need to Do**:
1. Install Android Studio & SDK (Task 1)
2. Test the build (Task 2)
3. Configure Firebase when ready (Task 3)
4. Create release keystore before publishing (Task 4)

**Estimated Time**: 1-2 hours for Tasks 1-2, then you're ready to develop!

Good luck! 🚀