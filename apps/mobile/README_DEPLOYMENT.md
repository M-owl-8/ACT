# ACT Android Deployment - Quick Start

## 🎯 What's Been Set Up

Your ACT app is now configured for production Android deployment using **EAS Build (Managed Workflow)**. All configuration files have been created and are ready to use.

## 📁 New Files Created

1. **`app.config.js`** - Dynamic app configuration with environment variables
2. **`eas.json`** - EAS Build profiles (development, preview, production)
3. **`.easignore`** - Files to exclude from EAS builds
4. **`BUILD_ANDROID.ps1`** - PowerShell script for easy building
5. **`ANDROID_DEPLOYMENT_GUIDE.md`** - Comprehensive deployment guide
6. **`FIREBASE_SETUP.md`** - Firebase Cloud Messaging setup guide
7. **`ASSETS_GUIDE.md`** - App assets requirements and guide
8. **`DEPLOYMENT_CHECKLIST.md`** - Complete deployment checklist
9. **`notification-icon.png`** - Notification icon (created from app icon)

## 📝 Configuration Updates

### `app.json` Updated
- App name: "ACT"
- Package name: "com.act.app"
- Version: "1.0.0"
- Android versionCode: 1
- Notification plugin configured
- Permissions added

### `.gitignore` Updated
- Added Firebase files
- Added build artifacts
- Added service account keys

## 🚀 Quick Start (3 Steps)

### Step 1: Install EAS CLI and Login
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Navigate to mobile directory
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Login to Expo
eas login

# Initialize EAS Build
eas build:configure
```

### Step 2: Update Configuration
1. Open `app.config.js`
2. Replace `YOUR_EXPO_USERNAME` with your actual Expo username
3. Save the file

### Step 3: Build Your First APK
```bash
# Option A: Use PowerShell script (recommended)
.\BUILD_ANDROID.ps1 -Profile development

# Option B: Use EAS CLI directly
eas build --platform android --profile development
```

That's it! Your first build will take 15-30 minutes. You'll get a download link for the APK.

## 📱 Build Profiles Explained

### Development Profile
```bash
.\BUILD_ANDROID.ps1 -Profile development
```
- **Output:** Debug APK
- **Use for:** Testing on your phone
- **Features:** Development tools included
- **Size:** Larger (~50-100 MB)

### Preview Profile
```bash
.\BUILD_ANDROID.ps1 -Profile preview
```
- **Output:** Release APK
- **Use for:** Final testing before Play Store
- **Features:** Production-like, no dev tools
- **Size:** Smaller (~20-40 MB)

### Production Profile
```bash
.\BUILD_ANDROID.ps1 -Profile production
```
- **Output:** Android App Bundle (AAB)
- **Use for:** Google Play Store submission
- **Features:** Fully optimized
- **Size:** Smallest (Play Store optimizes per device)

## 🔔 Firebase Setup (Optional)

If you want push notifications:

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Create project named "ACT"

2. **Add Android App**
   - Package name: `com.act.app`
   - Download `google-services.json`
   - Place in: `C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\`

3. **Rebuild App**
   ```bash
   eas build --platform android --profile development
   ```

See `FIREBASE_SETUP.md` for detailed instructions.

## 🏪 Google Play Store Submission

When you're ready to publish:

1. **Build Production AAB**
   ```bash
   .\BUILD_ANDROID.ps1 -Profile production
   ```

2. **Create Play Console Account**
   - Go to https://play.google.com/console
   - Pay $25 one-time fee

3. **Create App and Upload AAB**
   - Follow the Play Console wizard
   - Upload your `.aab` file

4. **Complete Store Listing**
   - Add screenshots
   - Write description
   - Set up privacy policy

See `ANDROID_DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `DEPLOYMENT_CHECKLIST.md` | Complete step-by-step checklist from setup to Play Store |
| `ANDROID_DEPLOYMENT_GUIDE.md` | Comprehensive guide with all details |
| `FIREBASE_SETUP.md` | Firebase Cloud Messaging setup |
| `ASSETS_GUIDE.md` | App icons and assets requirements |
| `README_DEPLOYMENT.md` | This file - quick overview |

## 🎯 Recommended Workflow

### For First-Time Setup
1. ✅ Install EAS CLI: `npm install -g eas-cli`
2. ✅ Login: `eas login`
3. ✅ Configure: `eas build:configure`
4. ✅ Update `app.config.js` with your username
5. ✅ Build development APK: `.\BUILD_ANDROID.ps1 -Profile development`
6. ✅ Install on your phone and test

### For Development
1. Make code changes
2. Test locally: `npm start`
3. Build dev APK: `.\BUILD_ANDROID.ps1 -Profile development`
4. Test on phone

### For Production Release
1. Update version in `app.config.js`
2. Test with preview: `.\BUILD_ANDROID.ps1 -Profile preview`
3. Build production: `.\BUILD_ANDROID.ps1 -Profile production`
4. Upload to Play Console

## 🔧 Useful Commands

```bash
# View all builds
eas build:list

# View specific build details
eas build:view [BUILD_ID]

# Manage credentials (keystore)
eas credentials

# View project information
eas project:info

# Submit to Play Store (after setting up service account)
eas submit --platform android --latest
```

## ⚠️ Important Notes

1. **Keystore Management**
   - EAS will create and manage your keystore automatically
   - NEVER lose your keystore - you can't update your app without it
   - Download and backup: `eas credentials`

2. **Version Management**
   - Update `version` for user-facing version (e.g., "1.0.1")
   - Increment `android.versionCode` for each Play Store upload
   - versionCode must always increase

3. **Environment Variables**
   - Use `.env` files for sensitive data
   - Never commit secrets to git
   - `google-services.json` is already in `.gitignore`

4. **Testing**
   - Always test on physical device before production
   - Test on different Android versions if possible
   - Use preview builds for final testing

## 🐛 Troubleshooting

### Build Fails
```bash
# Check build logs
eas build:view [BUILD_ID]

# Clear cache and retry
eas build --clear-cache --platform android --profile development
```

### Can't Install APK
- Enable "Install from Unknown Sources" on Android
- Check if you have enough storage
- Try uninstalling previous version first

### Firebase Not Working
- Verify `google-services.json` is in correct location
- Check package name matches: `com.act.app`
- Rebuild after adding Firebase config

## 📞 Support Resources

- **EAS Build Issues:** https://expo.dev/eas
- **Play Store Help:** https://support.google.com/googleplay/android-developer
- **Firebase Support:** https://firebase.google.com/support
- **Expo Forums:** https://forums.expo.dev/

## ✅ Next Steps

1. **Right Now:**
   ```bash
   cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   .\BUILD_ANDROID.ps1 -Profile setup
   ```

2. **After Setup:**
   - Build development APK
   - Install on your phone
   - Test all features

3. **When Ready:**
   - Set up Firebase (optional)
   - Build preview APK for testing
   - Create Play Console account
   - Build production AAB
   - Submit to Play Store

## 🎉 You're All Set!

Your ACT app is now configured for Android deployment. Follow the guides and checklist to deploy your app to the Google Play Store.

**Start with:** `.\BUILD_ANDROID.ps1 -Profile setup`

Good luck with your app launch! 🚀

---

**Questions?** Check the detailed guides in this directory:
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `ANDROID_DEPLOYMENT_GUIDE.md` - Complete guide
- `FIREBASE_SETUP.md` - Push notifications setup