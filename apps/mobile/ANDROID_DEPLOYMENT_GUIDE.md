# ACT Android Deployment Guide

## 📋 Overview
This guide walks you through deploying your ACT app to Android using EAS Build (Managed Workflow).

## 🚀 Prerequisites

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Create Expo Account
- Go to https://expo.dev/signup
- Create an account (free tier is sufficient for testing)
- Remember your username

### 3. Login to EAS
```bash
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
eas login
```

## 📝 Configuration Steps

### Step 1: Update app.config.js
1. Open `app.config.js`
2. Replace `YOUR_EXPO_USERNAME` with your actual Expo username
3. The `projectId` will be automatically set when you run `eas build:configure`

### Step 2: Initialize EAS Build
```bash
eas build:configure
```
This will:
- Create/update `eas.json`
- Link your project to EAS
- Set up the project ID

### Step 3: Build Development APK (Testing)
```bash
# Build a development APK for testing on your phone
eas build --platform android --profile development
```

**What this does:**
- Creates a debug APK
- Includes development tools
- Can be installed directly on your phone
- Good for testing before production

**Installation:**
1. Download the APK from the EAS build page
2. Transfer to your Android phone
3. Enable "Install from Unknown Sources"
4. Install the APK

### Step 4: Build Preview APK (Pre-Production Testing)
```bash
# Build a preview APK (similar to production but as APK)
eas build --platform android --profile preview
```

**What this does:**
- Creates a release APK
- No development tools
- Smaller file size
- Good for final testing before Play Store

### Step 5: Build Production AAB (Play Store)
```bash
# Build production AAB for Google Play Store
eas build --platform android --profile production
```

**What this does:**
- Creates an Android App Bundle (.aab)
- Optimized for Play Store
- Required format for Play Store submission

## 🔐 Android Keystore Management

### Option 1: Let EAS Manage (Recommended)
When you run your first production build, EAS will ask:
```
? Would you like to automatically create a new Android keystore? (Y/n)
```
**Choose YES** - EAS will:
- Generate a secure keystore
- Store it securely in the cloud
- Use it for all future builds
- You can download it later if needed

### Option 2: Use Your Own Keystore
If you already have a keystore:
```bash
eas credentials
```
Then follow prompts to upload your keystore.

## 🔔 Firebase Setup (For Push Notifications)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "ACT" or similar
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Add Android App to Firebase
1. In Firebase Console, click "Add app" → Android icon
2. Enter package name: `com.act.app`
3. App nickname: "ACT Android"
4. Click "Register app"

### Step 3: Download google-services.json
1. Download the `google-services.json` file
2. Place it in: `C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\`
3. **DO NOT commit this file to git** (already in .gitignore)

### Step 4: Enable Firebase Cloud Messaging (FCM)
1. In Firebase Console, go to "Project Settings" → "Cloud Messaging"
2. Enable "Cloud Messaging API (Legacy)" if needed
3. Copy the "Server Key" - you'll need this for your backend

### Step 5: Update app.config.js
The configuration is already set up to use `google-services.json` automatically.

### Step 6: Rebuild with Firebase
```bash
eas build --platform android --profile production
```

## 📱 Testing on Physical Device

### Method 1: Development Build
```bash
# Build and install development version
eas build --platform android --profile development

# After build completes, scan QR code or download APK
# Install on your phone
```

### Method 2: Expo Go (Limited)
**Note:** Expo Go has limitations with custom native code. Use development builds instead.

## 🏪 Google Play Store Submission

### Step 1: Create Google Play Console Account
1. Go to https://play.google.com/console
2. Pay one-time $25 registration fee
3. Complete account setup

### Step 2: Create App in Play Console
1. Click "Create app"
2. Fill in app details:
   - App name: "ACT"
   - Default language: English
   - App or game: App
   - Free or paid: Free
3. Complete declarations

### Step 3: Set Up App Content
1. **App access**: Describe any login requirements
2. **Ads**: Declare if app contains ads (No for now)
3. **Content rating**: Complete questionnaire
4. **Target audience**: Select age groups
5. **Privacy policy**: Provide URL (required)
6. **Data safety**: Describe data collection

### Step 4: Create Internal Testing Track
1. Go to "Testing" → "Internal testing"
2. Click "Create new release"
3. Upload your `.aab` file from EAS build
4. Add release notes
5. Review and rollout

### Step 5: Add Testers
1. Create email list of testers
2. Share testing link with them
3. They can install via Play Store

### Step 6: Production Release (When Ready)
1. Go to "Production" → "Create new release"
2. Upload production `.aab`
3. Complete store listing:
   - App description
   - Screenshots (required)
   - Feature graphic
   - App icon
4. Set pricing & distribution
5. Submit for review

## 🔄 Automated Submission with EAS

### Step 1: Create Service Account
1. In Google Play Console, go to "Setup" → "API access"
2. Click "Create new service account"
3. Follow link to Google Cloud Console
4. Create service account with "Service Account User" role
5. Create JSON key
6. Download as `google-play-service-account.json`
7. Place in mobile app directory (already in .gitignore)

### Step 2: Grant Permissions
1. Back in Play Console, grant permissions to service account
2. Give "Release to testing tracks" permission

### Step 3: Submit via EAS
```bash
# Build and submit in one command
eas build --platform android --profile production --auto-submit

# Or submit existing build
eas submit --platform android --latest
```

## 📊 Build Profiles Explained

### Development Profile
```json
"development": {
  "developmentClient": true,
  "distribution": "internal",
  "android": {
    "gradleCommand": ":app:assembleDebug",
    "buildType": "apk"
  }
}
```
- **Use for:** Local testing on your phone
- **Output:** Debug APK
- **Features:** Development tools, hot reload
- **Size:** Larger

### Preview Profile
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- **Use for:** Pre-production testing
- **Output:** Release APK
- **Features:** Production-like, no dev tools
- **Size:** Smaller

### Production Profile
```json
"production": {
  "android": {
    "buildType": "aab"
  }
}
```
- **Use for:** Play Store submission
- **Output:** Android App Bundle (AAB)
- **Features:** Fully optimized
- **Size:** Smallest (Play Store optimizes per device)

## 🔧 Common Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]

# Manage credentials
eas credentials

# Update app version
# Edit app.config.js: version and android.versionCode

# Build for specific profile
eas build --platform android --profile [development|preview|production]

# Submit to Play Store
eas submit --platform android

# View project info
eas project:info
```

## 🐛 Troubleshooting

### Build Fails
1. Check build logs: `eas build:view [BUILD_ID]`
2. Verify all dependencies are compatible
3. Check `eas.json` configuration
4. Ensure `google-services.json` is present (if using Firebase)

### APK Won't Install
1. Enable "Install from Unknown Sources" on Android
2. Check if you have enough storage
3. Try uninstalling previous version first

### Keystore Issues
```bash
# View current credentials
eas credentials

# Reset credentials (careful!)
eas credentials --platform android
```

### Firebase Not Working
1. Verify `google-services.json` is in correct location
2. Check package name matches: `com.act.app`
3. Rebuild after adding Firebase config
4. Check Firebase Console for errors

## 📈 Version Management

### Updating Version
Edit `app.config.js`:
```javascript
version: "1.0.1",  // User-facing version
android: {
  versionCode: 2,  // Must increment for each Play Store release
  // ...
}
```

**Rules:**
- `version`: Semantic versioning (1.0.0, 1.0.1, 1.1.0, 2.0.0)
- `versionCode`: Integer, must always increase
- Play Store requires new `versionCode` for each upload

## 🎯 Recommended Workflow

### For Development
```bash
# 1. Make changes to code
# 2. Test locally with Expo
npm start

# 3. Build development APK for phone testing
eas build --platform android --profile development

# 4. Install and test on phone
```

### For Production Release
```bash
# 1. Update version in app.config.js
# 2. Test thoroughly with preview build
eas build --platform android --profile preview

# 3. Build production AAB
eas build --platform android --profile production

# 4. Submit to Play Store
eas submit --platform android --latest

# 5. Monitor Play Console for review status
```

## 📚 Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android App Bundle](https://developer.android.com/guide/app-bundle)

## 🎉 Quick Start Checklist

- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Create Expo account at expo.dev
- [ ] Login: `eas login`
- [ ] Update `app.config.js` with your Expo username
- [ ] Initialize EAS: `eas build:configure`
- [ ] Build development APK: `eas build --platform android --profile development`
- [ ] Test on your phone
- [ ] Set up Firebase (optional, for push notifications)
- [ ] Build production AAB: `eas build --platform android --profile production`
- [ ] Create Google Play Console account
- [ ] Submit to internal testing track
- [ ] Add testers and gather feedback
- [ ] Submit to production when ready

## 💡 Tips

1. **Start with development builds** - Test on your phone before production
2. **Use internal testing** - Don't go straight to production
3. **Keep keystore safe** - If using your own, back it up securely
4. **Monitor build times** - First build takes longer (15-30 min)
5. **Check build queue** - Free tier may have wait times
6. **Use environment variables** - For API URLs and secrets
7. **Test on multiple devices** - Different Android versions behave differently
8. **Read Play Store policies** - Avoid rejection by following guidelines

## 🔒 Security Notes

- Never commit `google-services.json` to git
- Never commit `google-play-service-account.json` to git
- Keep your keystore secure and backed up
- Use environment variables for sensitive data
- Review app permissions regularly
- Follow Play Store security best practices

---

**Need Help?**
- EAS Build Issues: https://expo.dev/eas
- Play Store Issues: https://support.google.com/googleplay/android-developer
- Firebase Issues: https://firebase.google.com/support