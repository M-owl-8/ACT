# 🎯 YOUR MANUAL TASKS - Step-by-Step Guide

## ✅ Environment Check - COMPLETE!

Your Android development environment is **fully configured**:
- ✅ Java JDK 17 installed
- ✅ Android Studio installed
- ✅ Android SDK API 34 installed
- ✅ ANDROID_HOME environment variable set
- ✅ ADB (Android Debug Bridge) working
- ✅ Gradle wrapper configured

**You're ready to build!** 🚀

---

## 📋 Task Checklist

### ✅ DONE (By AI)
- [x] Environment verification script
- [x] Firebase configuration preparation
- [x] Sentry configuration preparation
- [x] Keystore generation scripts
- [x] CI/CD workflow templates
- [x] Build scripts and automation
- [x] Comprehensive documentation

### 🔴 YOUR TASKS (Manual - Required)
- [ ] **Task 1**: Test local build on emulator (15 min)
- [ ] **Task 2**: Test local build on physical device (15 min)
- [ ] **Task 3**: Configure Firebase & FCM (30 min)
- [ ] **Task 4**: Generate release keystore (10 min)
- [ ] **Task 5**: Configure Sentry crash reporting (20 min)
- [ ] **Task 6**: Test notifications on physical device (30 min)
- [ ] **Task 7**: Build and test release APK (20 min)
- [ ] **Task 8**: Setup GitHub Actions CI (30 min)

**Total estimated time: ~3 hours**

---

## 🚀 TASK 1: Test Local Build on Emulator

### Why This Matters
Verify that your app builds correctly and runs on an Android emulator before testing on physical devices.

### Prerequisites
- ✅ Android Studio installed
- ✅ Android SDK API 34 installed

### Step-by-Step Instructions

#### Step 1.1: Start Android Emulator

1. **Open Android Studio**
   - Launch Android Studio from Start Menu

2. **Open Device Manager**
   - Click the **Device Manager** icon (phone icon) on the right toolbar
   - Or go to: `Tools → Device Manager`

3. **Create Emulator (if you don't have one)**
   - Click **"Create Device"**
   - Select **"Pixel 5"** or **"Pixel 6"** (recommended)
   - Click **"Next"**
   - Select **"Tiramisu"** (API 34, Android 14)
   - If not downloaded, click **"Download"** next to it
   - Click **"Next"**
   - Name it: `ACT_Test_Emulator`
   - Click **"Finish"**

4. **Start the Emulator**
   - In Device Manager, find your emulator
   - Click the **▶️ Play** button
   - Wait for emulator to fully boot (30-60 seconds)
   - You should see the Android home screen

#### Step 1.2: Build and Run the App

1. **Open PowerShell**
   - Press `Win + X` → Select "Windows PowerShell"

2. **Navigate to Project**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   ```

3. **Start Metro Bundler** (in first terminal)
   ```powershell
   npm start
   ```
   - Keep this terminal open
   - Wait for "Metro waiting on exp://..."

4. **Open Second PowerShell Terminal**
   - Press `Win + X` → Select "Windows PowerShell" again

5. **Build and Install App**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm run android
   ```

6. **Wait for Build** (first time: 5-10 minutes)
   - You'll see Gradle downloading dependencies
   - Then building the app
   - Finally installing on emulator

#### Step 1.3: Verify App Works

Once the app launches, test these features:

**Authentication:**
- [ ] Login screen appears with Japanese theme
- [ ] Can type in email/password fields
- [ ] "Forgot Password?" link visible
- [ ] Can navigate to Register screen

**Theme:**
- [ ] Japanese fonts load correctly
- [ ] Background gradient displays
- [ ] Icons render properly

**Navigation:**
- [ ] Bottom tabs work (if logged in)
- [ ] Screen transitions smooth
- [ ] Back button works

#### Step 1.4: Check for Errors

**In Metro Terminal:**
- [ ] No red error messages
- [ ] No yellow warnings (minor ones OK)

**In App:**
- [ ] No crash on launch
- [ ] No "Network Error" (backend should be running)
- [ ] Images load correctly

### ✅ Success Criteria
- App builds without errors
- App installs on emulator
- App launches and shows login screen
- No crashes during basic navigation

### 🐛 Troubleshooting

**Problem: "ANDROID_HOME not found"**
```powershell
# Verify environment variable
echo $env:ANDROID_HOME
# Should show: C:\Users\user\AppData\Local\Android\Sdk

# If empty, restart PowerShell or computer
```

**Problem: "No connected devices"**
```powershell
# Check if emulator is running
adb devices
# Should show: emulator-5554    device

# If empty, start emulator in Android Studio
```

**Problem: Build fails with "Gradle error"**
```powershell
# Clean Gradle cache
cd android
.\gradlew clean
cd ..

# Try again
npm run android
```

**Problem: Metro bundler error**
```powershell
# Clear Metro cache
npm start -- --reset-cache
```

**Problem: App crashes on launch**
```powershell
# Check logs
adb logcat | Select-String "ReactNative"
```

---

## 📱 TASK 2: Test Local Build on Physical Device

### Why This Matters
Physical devices behave differently than emulators (performance, sensors, notifications). Always test on real hardware.

### Prerequisites
- ✅ Android phone with USB cable
- ✅ USB Debugging enabled on phone

### Step-by-Step Instructions

#### Step 2.1: Enable Developer Mode on Phone

1. **Open Settings** on your Android phone

2. **Find "About Phone"**
   - Usually in: `Settings → About Phone`
   - Or: `Settings → System → About Phone`

3. **Tap "Build Number" 7 Times**
   - Find "Build Number" or "Build Version"
   - Tap it **7 times rapidly**
   - You'll see: "You are now a developer!"

4. **Enable USB Debugging**
   - Go back to main Settings
   - Find **"Developer Options"** (now visible)
   - Enable **"USB Debugging"**
   - Enable **"Install via USB"** (if available)

#### Step 2.2: Connect Phone to Computer

1. **Connect USB Cable**
   - Plug phone into computer

2. **Allow USB Debugging**
   - On phone, you'll see popup: "Allow USB debugging?"
   - Check **"Always allow from this computer"**
   - Tap **"OK"**

3. **Verify Connection**
   ```powershell
   adb devices
   ```
   - Should show your device:
     ```
     List of devices attached
     ABC123XYZ    device
     ```

4. **If Shows "unauthorized"**
   - Disconnect and reconnect USB
   - Check phone for authorization popup
   - Tap "OK" again

#### Step 2.3: Build and Install on Phone

1. **Make Sure Metro is Running**
   ```powershell
   # Terminal 1
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm start
   ```

2. **Build and Install**
   ```powershell
   # Terminal 2
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm run android
   ```

3. **App Will Install on Phone**
   - Gradle builds (faster than first time)
   - APK installs on phone
   - App launches automatically

#### Step 2.4: Test on Physical Device

**Performance:**
- [ ] App launches quickly (< 3 seconds)
- [ ] Animations smooth (60 FPS)
- [ ] No lag when scrolling
- [ ] Transitions fluid

**Features:**
- [ ] Touch gestures work
- [ ] Keyboard appears correctly
- [ ] Date/time pickers native
- [ ] Camera works (if used)
- [ ] Location works (if used)

**Network:**
- [ ] API calls work (check backend URL in .env)
- [ ] Images load
- [ ] Data syncs

**Sensors:**
- [ ] Screen rotation works (if enabled)
- [ ] Notifications appear (after Task 6)

### ✅ Success Criteria
- App installs on physical device
- App runs smoothly without lag
- All features work as expected
- No crashes during testing

### 🐛 Troubleshooting

**Problem: "Device not found"**
```powershell
# Check USB connection
adb devices

# If empty:
# 1. Try different USB cable
# 2. Try different USB port
# 3. Restart ADB
adb kill-server
adb start-server
adb devices
```

**Problem: "Installation failed"**
```powershell
# Uninstall old version first
adb uninstall com.act.app

# Try again
npm run android
```

**Problem: "Cannot connect to Metro"**
- Make sure phone and computer on same WiFi
- Or enable "USB Debugging" and keep USB connected

**Problem: App crashes on phone but not emulator**
```powershell
# Check device logs
adb logcat | Select-String "ACT"
```

---

## 🔥 TASK 3: Configure Firebase & FCM

### Why This Matters
Firebase Cloud Messaging (FCM) enables push notifications. Required for reminders and real-time updates.

### Prerequisites
- ✅ Google account
- ✅ App builds successfully

### Step-by-Step Instructions

#### Step 3.1: Create Firebase Project

1. **Go to Firebase Console**
   - Open: https://console.firebase.google.com
   - Sign in with Google account

2. **Create New Project**
   - Click **"Add project"**
   - Project name: `ACT Gen-1` (or your choice)
   - Click **"Continue"**

3. **Disable Google Analytics** (optional for now)
   - Toggle off "Enable Google Analytics"
   - Click **"Create project"**
   - Wait for project creation (30 seconds)
   - Click **"Continue"**

#### Step 3.2: Add Android App to Firebase

1. **Click "Add app"**
   - Select **Android** icon (robot)

2. **Register App**
   - **Android package name**: `com.act.app`
   - **App nickname**: `ACT Mobile` (optional)
   - **Debug signing certificate SHA-1**: Leave empty for now
   - Click **"Register app"**

3. **Download google-services.json**
   - Click **"Download google-services.json"**
   - Save file to your Downloads folder

4. **Move File to Project**
   ```powershell
   # Move from Downloads to project
   Move-Item "$env:USERPROFILE\Downloads\google-services.json" "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app\google-services.json" -Force
   ```

5. **Verify File Placement**
   ```powershell
   # Check file exists
   Test-Path "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app\google-services.json"
   # Should return: True
   ```

6. **Click "Next"** in Firebase Console
   - Skip "Add Firebase SDK" (already configured)
   - Click **"Next"**
   - Click **"Continue to console"**

#### Step 3.3: Enable Firebase Cloud Messaging

1. **In Firebase Console**
   - Select your project
   - Click **⚙️ Settings** (gear icon) → **Project settings**

2. **Go to Cloud Messaging Tab**
   - Click **"Cloud Messaging"** tab
   - You'll see **"Cloud Messaging API (Legacy)"**

3. **Enable Cloud Messaging API**
   - Click the **3 dots** (⋮) next to "Cloud Messaging API"
   - Click **"Manage API in Google Cloud Console"**
   - Click **"Enable"** button
   - Wait for API to enable (30 seconds)

4. **Get Server Key** (for backend)
   - Go back to Firebase Console
   - Under **"Cloud Messaging API (Legacy)"**
   - Copy **"Server key"**
   - Save it for later (you'll need it for backend)

#### Step 3.4: Update Backend with Firebase Credentials

1. **Install Firebase Admin SDK**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
   pip install firebase-admin
   ```

2. **Download Service Account Key**
   - In Firebase Console → **⚙️ Settings** → **Project settings**
   - Click **"Service accounts"** tab
   - Click **"Generate new private key"**
   - Click **"Generate key"**
   - Save `firebase-service-account.json` to Downloads

3. **Move Service Account Key**
   ```powershell
   # Move to backend
   Move-Item "$env:USERPROFILE\Downloads\firebase-service-account.json" "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\firebase-service-account.json" -Force
   ```

4. **Update Backend .env**
   ```powershell
   # Add to .env file
   Add-Content "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\.env" "`nFIREBASE_CREDENTIALS_PATH=firebase-service-account.json"
   ```

#### Step 3.5: Rebuild App with Firebase

1. **Clean Previous Build**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
   .\gradlew clean
   cd ..
   ```

2. **Rebuild App**
   ```powershell
   npm run android
   ```

3. **Verify Firebase Integration**
   - App should build without errors
   - Check logs for "Firebase initialized"

### ✅ Success Criteria
- Firebase project created
- `google-services.json` in `android/app/` folder
- Firebase Admin SDK installed in backend
- Service account key in backend folder
- App rebuilds successfully

### 🐛 Troubleshooting

**Problem: "google-services.json not found"**
```powershell
# Check file location
Get-ChildItem "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app" | Where-Object {$_.Name -like "*google*"}

# Should show: google-services.json
```

**Problem: Build fails after adding Firebase**
```powershell
# Clean and rebuild
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
.\gradlew clean
cd ..
npm run android
```

**Problem: "Firebase API not enabled"**
- Go to Google Cloud Console
- Search for "Cloud Messaging API"
- Click "Enable"

---

## 🔐 TASK 4: Generate Release Keystore

### Why This Matters
**CRITICAL**: The keystore is used to sign your app for Google Play Store. If you lose it, you can NEVER update your app again. You'll have to publish a completely new app.

### Prerequisites
- ✅ Java JDK installed

### Step-by-Step Instructions

#### Step 4.1: Generate Keystore

1. **Navigate to Android App Folder**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app
   ```

2. **Generate Keystore**
   ```powershell
   keytool -genkeypair -v -storetype PKCS12 -keystore act-release.keystore -alias act-key -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **Enter Information** (when prompted)
   ```
   Enter keystore password: [CREATE STRONG PASSWORD - SAVE IT!]
   Re-enter new password: [SAME PASSWORD]
   
   What is your first and last name?
   [Your Name or Company Name]
   
   What is the name of your organizational unit?
   [Your Team/Department or press Enter]
   
   What is the name of your organization?
   [Your Company or press Enter]
   
   What is the name of your City or Locality?
   [Your City or press Enter]
   
   What is the name of your State or Province?
   [Your State or press Enter]
   
   What is the two-letter country code for this unit?
   [Your Country Code, e.g., US, UK, UZ]
   
   Is CN=..., OU=..., O=..., L=..., ST=..., C=... correct?
   [Type: yes]
   
   Enter key password for <act-key>
   [Press Enter to use same password as keystore]
   ```

4. **Verify Keystore Created**
   ```powershell
   Test-Path "act-release.keystore"
   # Should return: True
   ```

#### Step 4.2: BACKUP THE KEYSTORE (CRITICAL!)

**⚠️ WARNING**: If you lose this file and password, you can NEVER update your app on Play Store!

1. **Copy to Safe Location**
   ```powershell
   # Copy to multiple locations
   Copy-Item "act-release.keystore" "$env:USERPROFILE\Desktop\act-release-BACKUP.keystore"
   Copy-Item "act-release.keystore" "$env:USERPROFILE\Documents\act-release-BACKUP.keystore"
   ```

2. **Upload to Cloud Storage**
   - Upload to Google Drive / OneDrive / Dropbox
   - Store in password manager (1Password, LastPass, etc.)
   - Email to yourself (encrypted)

3. **Save Password Securely**
   - Write down password on paper
   - Store in password manager
   - Save in encrypted file

4. **Create Backup USB**
   - Copy keystore to USB drive
   - Store USB in safe place

#### Step 4.3: Configure Gradle Properties

1. **Navigate Back to Mobile Folder**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   ```

2. **Create gradle.properties for Keystore**
   
   The AI has already prepared a template. You need to add your actual password:

   ```powershell
   # Open gradle.properties
   notepad android\gradle.properties
   ```

3. **Add These Lines at the End** (replace YOUR_PASSWORD)
   ```properties
   # Release keystore configuration
   ACT_RELEASE_STORE_FILE=act-release.keystore
   ACT_RELEASE_KEY_ALIAS=act-key
   ACT_RELEASE_STORE_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
   ACT_RELEASE_KEY_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
   ```

4. **Save and Close**

5. **Verify Configuration**
   ```powershell
   # Check if properties added
   Select-String "ACT_RELEASE" android\gradle.properties
   ```

### ✅ Success Criteria
- Keystore file created: `android/app/act-release.keystore`
- Keystore backed up to 3+ locations
- Password saved securely
- Gradle properties configured

### 🐛 Troubleshooting

**Problem: "keytool not found"**
```powershell
# Check Java installation
java -version

# If not found, add to PATH or use full path:
& "C:\Program Files\Eclipse Adoptium\jdk-17.0.16-hotspot\bin\keytool.exe" -genkeypair ...
```

**Problem: "Keystore already exists"**
```powershell
# Backup existing keystore first!
Copy-Item "act-release.keystore" "act-release-OLD.keystore"

# Then delete and regenerate
Remove-Item "act-release.keystore"
# Run keytool command again
```

---

## 🐛 TASK 5: Configure Sentry Crash Reporting

### Why This Matters
Sentry captures crashes and errors in production, helping you fix bugs before users complain.

### Prerequisites
- ✅ Sentry account (free tier available)

### Step-by-Step Instructions

#### Step 5.1: Create Sentry Account & Project

1. **Go to Sentry**
   - Open: https://sentry.io
   - Click **"Get Started"**
   - Sign up with email or GitHub

2. **Create New Project**
   - Select platform: **"React Native"**
   - Alert frequency: **"Alert me on every new issue"**
   - Project name: `act-mobile`
   - Click **"Create Project"**

3. **Copy DSN**
   - You'll see: `Sentry.init({ dsn: "https://...@sentry.io/..." })`
   - Copy the DSN URL (starts with `https://`)
   - Save it for next step

#### Step 5.2: Install Sentry SDK

1. **Install Sentry Packages**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm install @sentry/react-native
   ```

2. **Run Sentry Wizard** (configures native integration)
   ```powershell
   npx @sentry/wizard -i reactNative -p android
   ```

3. **Follow Wizard Prompts**
   - Login to Sentry: **Yes**
   - Select project: **act-mobile**
   - Configure Android: **Yes**
   - Configure iOS: **Skip** (we don't have iOS yet)

4. **Wizard Will Automatically:**
   - Add Sentry to `android/app/build.gradle`
   - Create `sentry.properties`
   - Configure source maps upload

#### Step 5.3: Initialize Sentry in App

The AI has already created the Sentry service. You just need to add your DSN:

1. **Update .env File**
   ```powershell
   # Add Sentry DSN to .env
   Add-Content "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\.env" "`nSENTRY_DSN=YOUR_SENTRY_DSN_HERE"
   ```

2. **Replace YOUR_SENTRY_DSN_HERE** with actual DSN from Step 5.1

3. **Verify Sentry Service**
   ```powershell
   # Check if service exists
   Test-Path "src\services\sentryService.ts"
   # Should return: True
   ```

#### Step 5.4: Test Sentry Integration

1. **Rebuild App**
   ```powershell
   npm run android
   ```

2. **Trigger Test Error**
   - Open app on device/emulator
   - The app will automatically send a test event to Sentry on launch

3. **Check Sentry Dashboard**
   - Go to: https://sentry.io
   - Select your project
   - Go to **"Issues"**
   - You should see test error appear within 1 minute

### ✅ Success Criteria
- Sentry account created
- Sentry SDK installed
- DSN configured in .env
- Test error appears in Sentry dashboard

### 🐛 Troubleshooting

**Problem: "Sentry wizard fails"**
```powershell
# Install manually
npm install @sentry/react-native

# Then configure manually (see SENTRY_SETUP_GUIDE.md)
```

**Problem: "No errors in Sentry dashboard"**
- Check internet connection
- Verify DSN is correct in .env
- Check Sentry project settings
- Wait 2-3 minutes for events to appear

**Problem: "Build fails after Sentry"**
```powershell
# Clean build
cd android
.\gradlew clean
cd ..
npm run android
```

---

## 📲 TASK 6: Test Notifications on Physical Device

### Why This Matters
Push notifications only work on physical devices (not emulators). Must test on real hardware.

### Prerequisites
- ✅ Firebase configured (Task 3)
- ✅ App installed on physical device (Task 2)
- ✅ Backend running

### Step-by-Step Instructions

#### Step 6.1: Start Backend Server

1. **Open PowerShell**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
   ```

2. **Activate Virtual Environment**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. **Start Server**
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Keep Terminal Open**

#### Step 6.2: Update Mobile App API URL

1. **Find Your Computer's IP Address**
   ```powershell
   # Get local IP
   (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi").IPAddress
   # Example output: 192.168.1.100
   ```

2. **Update .env File**
   ```powershell
   # Open .env
   notepad c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\.env
   ```

3. **Change API_URL**
   ```
   API_URL=http://YOUR_IP_ADDRESS:8000
   # Example: API_URL=http://192.168.1.100:8000
   ```

4. **Save and Close**

5. **Rebuild App**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npm run android
   ```

#### Step 6.3: Register for Push Notifications

1. **Launch App on Phone**

2. **Login or Register**
   - Create account or login

3. **Grant Notification Permission**
   - App will ask: "Allow ACT to send notifications?"
   - Tap **"Allow"**

4. **Verify Token Registered**
   - Check backend logs
   - Should see: "Push token registered for user..."

#### Step 6.4: Test Local Notifications

1. **In App, Go to Reminders**
   - Tap "Reminders" tab

2. **Create Test Reminder**
   - Tap **"+ Add Reminder"**
   - Title: "Test Notification"
   - Amount: 100
   - Date: Today
   - Time: 2 minutes from now
   - Tap **"Save"**

3. **Wait for Notification**
   - Lock phone or go to home screen
   - Wait for scheduled time
   - Notification should appear!

4. **Tap Notification**
   - Should open app to Reminders screen

#### Step 6.5: Test Push Notifications (FCM)

1. **Send Test Notification from Firebase**
   - Go to Firebase Console
   - Select your project
   - Click **"Cloud Messaging"** in left menu
   - Click **"Send your first message"**

2. **Compose Notification**
   - Notification title: "Test from Firebase"
   - Notification text: "This is a test push notification"
   - Click **"Send test message"**

3. **Add FCM Token**
   - In app, go to Settings
   - Copy your FCM token (displayed at bottom)
   - Paste token in Firebase console
   - Click **"Test"**

4. **Check Phone**
   - Notification should appear immediately!

### ✅ Success Criteria
- Notification permission granted
- Push token registered in backend
- Local notifications work
- FCM push notifications work
- Tapping notification opens app

### 🐛 Troubleshooting

**Problem: "Notification permission not requested"**
- Check `notificationService.ts` is initialized in App.tsx
- Rebuild app: `npm run android`

**Problem: "No notification appears"**
- Check phone notification settings
- Settings → Apps → ACT → Notifications → Enabled
- Check Do Not Disturb is off

**Problem: "FCM token not registered"**
- Check backend logs for errors
- Verify Firebase configured correctly
- Check internet connection

**Problem: "Notification appears but doesn't open app"**
- Check notification listeners in `notificationService.ts`
- Verify navigation is configured

---

## 📦 TASK 7: Build and Test Release APK

### Why This Matters
Release builds are optimized, minified, and signed. Always test release builds before publishing to Play Store.

### Prerequisites
- ✅ Release keystore created (Task 4)
- ✅ Gradle properties configured

### Step-by-Step Instructions

#### Step 7.1: Build Release APK

1. **Navigate to Android Folder**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
   ```

2. **Build Release APK**
   ```powershell
   .\gradlew assembleRelease
   ```

3. **Wait for Build** (3-5 minutes)
   - Gradle will:
     - Compile code
     - Minify with R8
     - Optimize resources
     - Sign with release keystore
     - Generate APK

4. **Build Complete!**
   - You'll see: `BUILD SUCCESSFUL`
   - APK location: `android/app/build/outputs/apk/release/app-release.apk`

#### Step 7.2: Verify APK Signature

1. **Check APK Signature**
   ```powershell
   # Verify APK is signed
   & "C:\Users\user\AppData\Local\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify --verbose app\build\outputs\apk\release\app-release.apk
   ```

2. **Should See:**
   ```
   Verifies
   Verified using v1 scheme (JAR signing): true
   Verified using v2 scheme (APK Signature Scheme v2): true
   ```

#### Step 7.3: Install Release APK on Device

1. **Copy APK to Accessible Location**
   ```powershell
   Copy-Item "app\build\outputs\apk\release\app-release.apk" "$env:USERPROFILE\Desktop\ACT-release.apk"
   ```

2. **Install on Connected Device**
   ```powershell
   adb install -r "$env:USERPROFILE\Desktop\ACT-release.apk"
   ```

3. **Or Transfer to Phone**
   - Copy `ACT-release.apk` from Desktop to phone via USB
   - On phone, open file manager
   - Tap APK file
   - Tap "Install"
   - Tap "Open"

#### Step 7.4: Test Release Build

**Performance:**
- [ ] App launches faster than debug build
- [ ] Animations smoother
- [ ] Smaller app size

**Functionality:**
- [ ] All features work
- [ ] API calls work
- [ ] Notifications work
- [ ] No crashes

**Security:**
- [ ] Cannot access dev menu (shake device)
- [ ] No debug logs visible
- [ ] Secure connections only (HTTPS)

#### Step 7.5: Check APK Size

```powershell
# Check APK size
(Get-Item "$env:USERPROFILE\Desktop\ACT-release.apk").Length / 1MB
# Should be: 30-50 MB (reasonable for React Native app)
```

### ✅ Success Criteria
- Release APK builds successfully
- APK is signed with release keystore
- APK installs on device
- App runs smoothly in release mode
- APK size is reasonable (< 50 MB)

### 🐛 Troubleshooting

**Problem: "Build fails with signing error"**
- Check keystore password in `gradle.properties`
- Verify keystore file exists: `android/app/act-release.keystore`

**Problem: "APK size too large (> 100 MB)"**
```powershell
# Enable ProGuard and resource shrinking
# Already configured in gradle.properties:
# android.enableMinifyInReleaseBuilds=true
# android.enableShrinkResourcesInReleaseBuilds=true
```

**Problem: "App crashes in release but not debug"**
- Check ProGuard rules in `android/app/proguard-rules.pro`
- Check Sentry for crash reports
- Test on multiple devices

**Problem: "Cannot install APK"**
```powershell
# Uninstall old version first
adb uninstall com.act.app

# Install again
adb install -r "$env:USERPROFILE\Desktop\ACT-release.apk"
```

---

## 🤖 TASK 8: Setup GitHub Actions CI

### Why This Matters
Automated builds ensure every commit is tested and buildable. Saves time and catches errors early.

### Prerequisites
- ✅ GitHub repository
- ✅ Release keystore created

### Step-by-Step Instructions

#### Step 8.1: Prepare Secrets

1. **Encode Keystore to Base64**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app
   
   # Convert keystore to base64
   $bytes = [System.IO.File]::ReadAllBytes("act-release.keystore")
   $base64 = [System.Convert]::ToBase64String($bytes)
   $base64 | Out-File "$env:USERPROFILE\Desktop\keystore-base64.txt"
   
   Write-Host "Base64 keystore saved to Desktop\keystore-base64.txt"
   ```

2. **Open GitHub Repository**
   - Go to: https://github.com/YOUR_USERNAME/YOUR_REPO
   - Click **"Settings"** tab
   - Click **"Secrets and variables"** → **"Actions"**

3. **Add Repository Secrets**
   
   Click **"New repository secret"** for each:

   | Name | Value |
   |------|-------|
   | `ANDROID_KEYSTORE_BASE64` | Content of `keystore-base64.txt` |
   | `ANDROID_KEYSTORE_PASSWORD` | Your keystore password |
   | `ANDROID_KEY_ALIAS` | `act-key` |
   | `ANDROID_KEY_PASSWORD` | Your key password |

4. **Add Firebase Secrets** (if using)
   
   | Name | Value |
   |------|-------|
   | `GOOGLE_SERVICES_JSON` | Content of `google-services.json` |

5. **Add Sentry Secrets** (if using)
   
   | Name | Value |
   |------|-------|
   | `SENTRY_AUTH_TOKEN` | From Sentry settings |
   | `SENTRY_ORG` | Your Sentry organization |
   | `SENTRY_PROJECT` | `act-mobile` |

#### Step 8.2: Add Workflow File

The AI has already created the workflow file at:
`.github/workflows/android-build.yml`

1. **Verify Workflow File Exists**
   ```powershell
   Test-Path "c:\Users\user\Desktop\Bitway\Programs\act-gen1\.github\workflows\android-build.yml"
   # Should return: True
   ```

2. **Review Workflow** (optional)
   ```powershell
   notepad "c:\Users\user\Desktop\Bitway\Programs\act-gen1\.github\workflows\android-build.yml"
   ```

3. **Commit and Push**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1
   git add .github/workflows/android-build.yml
   git commit -m "ci: add GitHub Actions workflow for Android builds"
   git push
   ```

#### Step 8.3: Test Workflow

1. **Go to GitHub Actions**
   - In your repo, click **"Actions"** tab
   - You should see workflow running

2. **Monitor Build**
   - Click on the running workflow
   - Watch each step execute
   - Build takes 10-15 minutes

3. **Check Build Artifacts**
   - Once complete, scroll to bottom
   - Download **"app-release"** artifact
   - Contains the built APK

### ✅ Success Criteria
- GitHub secrets configured
- Workflow file committed
- Build runs successfully on GitHub
- APK artifact downloadable

### 🐛 Troubleshooting

**Problem: "Workflow fails with keystore error"**
- Verify `ANDROID_KEYSTORE_BASE64` secret is correct
- Check keystore password secrets

**Problem: "Build fails with dependency error"**
- Check Node.js version in workflow (should be 18 or 20)
- Check Java version in workflow (should be 17)

**Problem: "Workflow doesn't trigger"**
- Check workflow file is in `.github/workflows/` folder
- Check YAML syntax is correct
- Push to `main` or `master` branch

---

## 📊 Progress Tracking

### Completed Tasks
- [x] Environment setup verified
- [x] Documentation created
- [x] Scripts prepared
- [x] Firebase configuration templates
- [x] Sentry configuration templates
- [x] CI/CD workflow templates

### Your Tasks Status
- [ ] Task 1: Test on emulator
- [ ] Task 2: Test on physical device
- [ ] Task 3: Configure Firebase
- [ ] Task 4: Generate keystore
- [ ] Task 5: Configure Sentry
- [ ] Task 6: Test notifications
- [ ] Task 7: Build release APK
- [ ] Task 8: Setup CI/CD

### Estimated Time Remaining
- **Quick path** (Tasks 1-4): ~1.5 hours
- **Full path** (Tasks 1-8): ~3 hours

---

## 🎯 Recommended Order

### Phase 1: Core Functionality (Required)
1. Task 1: Test on emulator (15 min)
2. Task 2: Test on physical device (15 min)
3. Task 4: Generate keystore (10 min) ⚠️ DO THIS EARLY!

### Phase 2: Production Features (Important)
4. Task 3: Configure Firebase (30 min)
5. Task 6: Test notifications (30 min)
6. Task 7: Build release APK (20 min)

### Phase 3: DevOps (Nice to Have)
7. Task 5: Configure Sentry (20 min)
8. Task 8: Setup CI/CD (30 min)

---

## 📞 Need Help?

### Documentation References
- **MISSION_1_PREBUILD_GUIDE.md** - Detailed prebuild guide
- **MISSION_2_FCM_GUIDE.md** - Firebase setup guide
- **BARE_RN_MIGRATION_GUIDE.md** - Migration reference
- **BARE_RN_QUICK_REFERENCE.md** - Quick commands

### Common Issues
- Check troubleshooting sections in each task
- Run `.\CHECK_ANDROID_ENV.ps1` to verify environment
- Check logs: `adb logcat | Select-String "ACT"`

### External Resources
- React Native Docs: https://reactnative.dev
- Firebase Docs: https://firebase.google.com/docs
- Sentry Docs: https://docs.sentry.io
- Android Docs: https://developer.android.com

---

## ✅ Final Checklist

Before considering Phase 1 complete:

- [ ] App builds on emulator
- [ ] App builds on physical device
- [ ] Firebase configured
- [ ] Notifications work
- [ ] Release keystore created and backed up
- [ ] Release APK builds successfully
- [ ] Sentry captures errors
- [ ] CI/CD pipeline working

---

**Good luck! You've got this! 🚀**

If you get stuck on any task, refer to the detailed troubleshooting sections or check the referenced documentation files.