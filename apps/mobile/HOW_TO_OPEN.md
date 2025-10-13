# 📱 How to Open and Run ACT Mobile App

## 🚀 Quick Start

### Option 1: Open in Visual Studio Code (Recommended)

```powershell
# Navigate to mobile app directory
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Open in VS Code
code .
```

**Or:**
1. Open VS Code
2. File → Open Folder
3. Navigate to: `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile`
4. Click "Select Folder"

---

### Option 2: Open Android Project in Android Studio

```powershell
# Open Android Studio
# Then: File → Open
# Navigate to: c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
# Click OK
```

**Or use command line:**
```powershell
# If Android Studio is in PATH
studio "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android"
```

---

## 🏃 Running the App

### Development Mode (Debug)

**Terminal 1 - Start Metro Bundler:**
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm start
```

**Terminal 2 - Run on Android:**
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm run android
```

**Or combined (single command):**
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm run android
# Metro will start automatically
```

---

### Release Mode (Testing Production Build)

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android

# Build release APK
.\gradlew assembleRelease

# Install on device/emulator
adb install app\build\outputs\apk\release\app-release.apk
```

---

## 📂 Project Structure

```
c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\
│
├── android/                    # Native Android project
│   ├── app/
│   │   ├── build.gradle       # App build configuration
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/act/app/
│   └── build.gradle           # Project build configuration
│
├── src/                       # React Native source code
│   ├── components/           # Reusable components
│   ├── screens/              # App screens
│   ├── navigation/           # Navigation setup
│   ├── services/             # API services
│   └── theme/                # Theme configuration
│
├── assets/                    # Images, fonts, etc.
│
├── app.config.js             # Expo configuration
├── package.json              # Dependencies & scripts
│
├── PLAY_STORE_SETUP.md       # Play Store submission guide
├── GENERATE_KEYSTORE.ps1     # Keystore generator script
└── HOW_TO_OPEN.md            # This file
```

---

## 🛠️ Development Workflow

### 1. Open Project
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
code .
```

### 2. Install Dependencies (if needed)
```powershell
npm install
```

### 3. Start Development
```powershell
# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android
```

### 4. Make Changes
- Edit files in `src/` folder
- Hot reload will update automatically
- Press `r` in Metro terminal to reload manually
- Press `d` to open developer menu

### 5. Debug
- **Chrome DevTools**: Press `d` → "Debug"
- **React DevTools**: `npm install -g react-devtools` → `react-devtools`
- **Android Studio**: Open `android/` folder, use Logcat

---

## 📦 Building for Play Store

### Step 1: Generate Keystore (First Time Only)

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
.\GENERATE_KEYSTORE.ps1
```

**Follow the prompts:**
- Enter strong password
- Enter your details (name, organization, etc.)
- **BACKUP the keystore file!**

### Step 2: Build Release AAB

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android

# Clean previous builds
.\gradlew clean

# Build Android App Bundle (for Play Store)
.\gradlew bundleRelease
```

**Output:**
```
android\app\build\outputs\bundle\release\app-release.aab
```

### Step 3: Upload to Play Console

1. Go to: https://play.google.com/console
2. Select your app (or create new)
3. Production → Create Release
4. Upload `app-release.aab`
5. Fill in release notes
6. Submit for review

**Full guide:** See `PLAY_STORE_SETUP.md`

---

## 🔧 Common Commands

### Development
```powershell
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Clear cache and restart
npm start -- --reset-cache
```

### Building
```powershell
cd android

# Debug APK
.\gradlew assembleDebug

# Release APK
.\gradlew assembleRelease

# Release AAB (Play Store)
.\gradlew bundleRelease

# Clean build
.\gradlew clean
```

### Debugging
```powershell
# View logs
adb logcat

# View React Native logs only
adb logcat | Select-String "ReactNative"

# List devices
adb devices

# Reverse port (for API on localhost)
adb reverse tcp:8000 tcp:8000
```

### Gradle
```powershell
cd android

# List tasks
.\gradlew tasks

# Build info
.\gradlew app:dependencies

# Clean
.\gradlew clean
```

---

## 🐛 Troubleshooting

### Metro Bundler Won't Start
```powershell
# Kill existing Metro
Get-Process -Name node | Stop-Process -Force

# Clear cache
npm start -- --reset-cache
```

### Build Fails
```powershell
# Clean everything
cd android
.\gradlew clean
cd ..
npm start -- --reset-cache

# Reinstall dependencies
Remove-Item node_modules -Recurse -Force
npm install
```

### App Won't Install
```powershell
# Uninstall old version
adb uninstall com.act.app

# Reinstall
npm run android
```

### Gradle Issues
```powershell
# Open in Android Studio
# File → Open → android/
# Let Gradle sync (may auto-fix issues)
```

### Environment Issues
```powershell
# Check environment
.\CHECK_ANDROID_ENV.ps1
```

---

## 📱 Device Setup

### Using Android Emulator

1. **Open Android Studio**
2. **Device Manager** (phone icon on right)
3. **Create Device**
   - Select: Pixel 5 or similar
   - System Image: API 34 (Android 14)
   - Click Finish
4. **Start Emulator** (▶️ button)
5. **Run app**: `npm run android`

### Using Physical Device

1. **Enable Developer Options**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect via USB**
   - Connect phone to computer
   - Allow USB debugging on phone

4. **Verify Connection**
   ```powershell
   adb devices
   # Should show your device
   ```

5. **Run App**
   ```powershell
   npm run android
   ```

---

## 🔑 Environment Variables

### For Development

Create `.env` file in project root:
```env
API_URL=http://localhost:8000
EXPO_PROJECT_ID=0d2ff065-1b12-4766-b547-3bdeea01cb0a
```

### For Production

Set in `app.config.js`:
```javascript
extra: {
  apiUrl: process.env.API_URL || "https://api.act.app"
}
```

---

## 📚 Documentation Files

- **PLAY_STORE_SETUP.md** - Complete Play Store submission guide
- **BARE_RN_MIGRATION_GUIDE.md** - Migration from Expo managed workflow
- **BARE_RN_QUICK_REFERENCE.md** - Command reference and tips
- **MIGRATION_COMPLETE.md** - Migration summary
- **HOW_TO_OPEN.md** - This file

---

## 🆘 Getting Help

### Check Documentation
1. Read `PLAY_STORE_SETUP.md` for Play Store
2. Read `BARE_RN_QUICK_REFERENCE.md` for commands
3. Read `BARE_RN_MIGRATION_GUIDE.md` for troubleshooting

### Run Environment Check
```powershell
.\CHECK_ANDROID_ENV.ps1
```

### Common Issues
- **Build fails**: Clean build (`.\gradlew clean`)
- **Metro issues**: Clear cache (`npm start -- --reset-cache`)
- **Device not found**: Check `adb devices`
- **Gradle sync fails**: Open in Android Studio

### Resources
- React Native Docs: https://reactnative.dev
- Expo Docs: https://docs.expo.dev
- Android Developer: https://developer.android.com

---

## ✅ Quick Checklist

### First Time Setup
- [ ] Install Android Studio
- [ ] Install Android SDK (API 34)
- [ ] Set ANDROID_HOME environment variable
- [ ] Run `.\CHECK_ANDROID_ENV.ps1`
- [ ] Create emulator or connect device
- [ ] Run `npm install`
- [ ] Run `npm run android`

### Before Play Store
- [ ] Generate keystore (`.\GENERATE_KEYSTORE.ps1`)
- [ ] Backup keystore to USB and cloud
- [ ] Update version in `app.config.js`
- [ ] Build release AAB (`.\gradlew bundleRelease`)
- [ ] Test release build
- [ ] Prepare screenshots and graphics
- [ ] Create Play Console account
- [ ] Upload and submit

---

## 🎯 Summary

### To Open and Run:
```powershell
# 1. Navigate to project
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# 2. Open in VS Code
code .

# 3. Run on Android
npm run android
```

### To Build for Play Store:
```powershell
# 1. Generate keystore (first time)
.\GENERATE_KEYSTORE.ps1

# 2. Build release
cd android
.\gradlew bundleRelease

# 3. Find AAB
# Location: android\app\build\outputs\bundle\release\app-release.aab

# 4. Upload to Play Console
# https://play.google.com/console
```

---

## 🎉 You're Ready!

Your ACT mobile app is ready for development and Play Store submission!

**Project Location:**
```
c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
```

**Quick Start:**
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
code .
npm run android
```

**Good luck! 🚀**