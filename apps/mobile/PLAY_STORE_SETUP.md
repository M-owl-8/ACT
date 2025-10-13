# 🚀 Google Play Store Submission Guide

## 📋 Complete Checklist for Play Store Release

### ✅ Prerequisites Completed
- [x] Android native project generated
- [x] App builds successfully in debug mode
- [x] Package name configured: `com.act.app`
- [x] Version code: 1
- [x] Version name: 1.0.0

---

## 🔐 STEP 1: Create Release Keystore (CRITICAL!)

### Why This Matters
**⚠️ WARNING**: The keystore is the ONLY way to update your app on Play Store!
- **Lose it** = You can NEVER update your app
- **Forget password** = You can NEVER update your app
- **Must create new app** = Lose all users, reviews, downloads

### Generate Keystore

**Option A: Automated Script (Recommended)**
```powershell
# Run the automated keystore generator
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
.\GENERATE_KEYSTORE.ps1
```

**Option B: Manual Generation**
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\app

keytool -genkeypair -v -storetype PKCS12 `
  -keystore act-release.keystore `
  -alias act-key `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

**You'll be asked for:**
1. **Keystore password** - Choose a STRONG password (save it!)
2. **Key password** - Use the SAME password as keystore
3. **Your name** - Your company/developer name
4. **Organization** - Your company name
5. **City, State, Country** - Your location

**Example:**
```
Enter keystore password: MyStr0ngP@ssw0rd123!
Re-enter new password: MyStr0ngP@ssw0rd123!
What is your first and last name? [Unknown]: ACT Development Team
What is the name of your organizational unit? [Unknown]: Mobile Development
What is the name of your organization? [Unknown]: ACT
What is the name of your City or Locality? [Unknown]: Tokyo
What is the name of your State or Province? [Unknown]: Tokyo
What is the two-letter country code for this unit? [Unknown]: JP
Is CN=ACT Development Team, OU=Mobile Development, O=ACT, L=Tokyo, ST=Tokyo, C=JP correct? [no]: yes
```

### 🔒 BACKUP THE KEYSTORE (CRITICAL!)

**Immediately after creating:**

1. **Copy to USB Drive**
   ```powershell
   # Replace D: with your USB drive letter
   Copy-Item "android\app\act-release.keystore" -Destination "D:\ACT_Keystore_Backup\"
   ```

2. **Upload to Cloud Storage**
   - Google Drive
   - OneDrive
   - Dropbox
   - **Make it PRIVATE!**

3. **Save Password Securely**
   - Use password manager (1Password, LastPass, Bitwarden)
   - Or encrypted document
   - **NEVER commit to Git!**

4. **Create a Recovery Document**
   ```
   ACT App Keystore Information
   ============================
   Keystore File: act-release.keystore
   Keystore Password: [YOUR_PASSWORD]
   Key Alias: act-key
   Key Password: [SAME_AS_KEYSTORE]
   Created: [DATE]
   Location: android/app/act-release.keystore
   Backup Locations:
   - USB Drive: D:\ACT_Keystore_Backup\
   - Cloud: [Your cloud storage link]
   ```

---

## ⚙️ STEP 2: Configure Gradle for Release Signing

### Update gradle.properties

Add these lines to `android/gradle.properties`:

```properties
# Release signing configuration
ACT_RELEASE_STORE_FILE=act-release.keystore
ACT_RELEASE_KEY_ALIAS=act-key
ACT_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
ACT_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

**⚠️ Security Note**: 
- For production, use environment variables instead
- Never commit passwords to Git
- Add `gradle.properties` to `.gitignore` if it contains passwords

### Update build.gradle

The signing config is already prepared. Just verify it's configured:

```gradle
signingConfigs {
    release {
        storeFile file(ACT_RELEASE_STORE_FILE)
        storePassword ACT_RELEASE_STORE_PASSWORD
        keyAlias ACT_RELEASE_KEY_ALIAS
        keyPassword ACT_RELEASE_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

---

## 📦 STEP 3: Build Release APK/AAB

### Build Android App Bundle (AAB) - Recommended for Play Store

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android

# Clean build
.\gradlew clean

# Build release AAB
.\gradlew bundleRelease
```

**Output location:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Build APK (Alternative)

```powershell
# Build release APK
.\gradlew assembleRelease
```

**Output location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Verify the Build

```powershell
# Check file size (should be 20-50 MB for AAB)
Get-Item "app\build\outputs\bundle\release\app-release.aab" | Select-Object Name, Length

# Verify signing
jarsigner -verify -verbose -certs "app\build\outputs\bundle\release\app-release.aab"
```

---

## 🎨 STEP 4: Prepare Play Store Assets

### Required Graphics

1. **App Icon** (Already have: `assets/icon.png`)
   - 512x512 PNG
   - No transparency
   - High quality

2. **Feature Graphic** (Create this)
   - 1024x500 PNG
   - Showcases your app
   - No transparency

3. **Screenshots** (Take these)
   - **Phone**: At least 2, up to 8
   - Recommended: 1080x1920 or 1440x2560
   - Show key features
   - Japanese UI (your app is in Japanese)

4. **Promo Video** (Optional)
   - YouTube link
   - 30 seconds to 2 minutes

### How to Take Screenshots

**Using Android Emulator:**
```powershell
# Start emulator
# Open your app
# Navigate to key screens

# Take screenshot (in emulator)
# Click camera icon in emulator toolbar
# Or use: Ctrl + S

# Screenshots saved to:
# C:\Users\user\.android\avd\[device_name].avd\screenshots\
```

**Using ADB:**
```powershell
# Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# Pull to computer
adb pull /sdcard/screenshot.png ./screenshots/
```

---

## 📝 STEP 5: Create Play Store Listing

### App Information

**App Name:**
```
ACT
```

**Short Description** (80 characters max):
```
ACT - Advanced Collaboration Tool for team productivity
```

**Full Description** (4000 characters max):
```
ACT (Advanced Collaboration Tool) is a powerful mobile application designed to enhance team productivity and collaboration.

Key Features:
• Secure authentication and user management
• Real-time notifications
• Beautiful Japanese-themed UI
• Offline support with secure local storage
• Fast and responsive performance

Perfect for teams looking to streamline their workflow and improve communication.

Download ACT today and experience seamless collaboration!
```

**Category:**
- Primary: Productivity
- Secondary: Business

**Contact Details:**
- Email: support@act.app (or your email)
- Website: https://act.app (or your website)
- Privacy Policy URL: (Required - create one)

### Privacy Policy

**⚠️ REQUIRED**: You must have a privacy policy URL

**Quick Solution - Use a Generator:**
1. Go to: https://www.privacypolicygenerator.info/
2. Fill in your app details
3. Generate policy
4. Host on your website or GitHub Pages

**Or create simple one:**
```markdown
# Privacy Policy for ACT

Last updated: [DATE]

## Information Collection
ACT collects minimal user information necessary for app functionality:
- Email address for authentication
- User preferences and settings
- Usage analytics (optional)

## Data Storage
- All data is stored securely
- We use industry-standard encryption
- Data is not shared with third parties

## Contact
For privacy concerns, contact: support@act.app
```

---

## 🚀 STEP 6: Upload to Play Console

### Create Play Console Account

1. Go to: https://play.google.com/console
2. Sign in with Google account
3. Pay one-time fee: $25 USD
4. Complete account setup

### Create New App

1. Click **"Create app"**
2. Fill in:
   - **App name**: ACT
   - **Default language**: Japanese (日本語) or English
   - **App or game**: App
   - **Free or paid**: Free (or Paid)
3. Accept declarations
4. Click **"Create app"**

### Complete Setup Checklist

**1. App Access**
- Select: "All functionality is available without restrictions"

**2. Ads**
- Select: "No, my app does not contain ads" (or Yes if you have ads)

**3. Content Rating**
- Complete questionnaire
- Get rating (likely: Everyone or Teen)

**4. Target Audience**
- Select age groups
- Comply with policies

**5. News App**
- Select: "No" (unless it's a news app)

**6. COVID-19 Contact Tracing**
- Select: "No"

**7. Data Safety**
- Describe data collection
- Specify security practices
- Link privacy policy

**8. Government Apps**
- Select: "No" (unless government app)

### Upload App Bundle

1. Go to: **Production** → **Create new release**
2. Click **"Upload"**
3. Select your AAB file: `app-release.aab`
4. Wait for upload and processing
5. Fill in **Release notes**:
   ```
   Initial release of ACT
   - Secure user authentication
   - Real-time notifications
   - Japanese-themed UI
   - Offline support
   ```

### Add Store Listing

1. Go to: **Store presence** → **Main store listing**
2. Upload:
   - App icon (512x512)
   - Feature graphic (1024x500)
   - Screenshots (at least 2)
3. Fill in descriptions
4. Add contact details
5. Save

### Set Pricing & Distribution

1. Go to: **Pricing & distribution**
2. Select countries (or "All countries")
3. Confirm pricing (Free or Paid)
4. Accept content guidelines
5. Save

---

## ✅ STEP 7: Submit for Review

### Pre-submission Checklist

- [ ] App builds successfully
- [ ] Keystore created and backed up
- [ ] Release AAB generated and signed
- [ ] All Play Console sections completed (green checkmarks)
- [ ] Screenshots uploaded (at least 2)
- [ ] Privacy policy URL added
- [ ] Content rating received
- [ ] Pricing & distribution set
- [ ] Release notes written

### Submit

1. Go to: **Production** → **Releases**
2. Review your release
3. Click **"Review release"**
4. Check everything is correct
5. Click **"Start rollout to Production"**
6. Confirm submission

### Review Process

- **Time**: Usually 1-7 days
- **Status**: Check in Play Console
- **Notifications**: Via email
- **If rejected**: Fix issues and resubmit

---

## 🔄 STEP 8: Update Version for Future Releases

### Before Next Release

**Update version in `app.config.js`:**
```javascript
android: {
  versionCode: 2,  // Increment by 1 each release
  // ...
}
version: "1.0.1",  // Semantic versioning
```

**Update in `android/app/build.gradle`:**
```gradle
defaultConfig {
    versionCode 2
    versionName "1.0.1"
}
```

**Build new release:**
```powershell
cd android
.\gradlew clean
.\gradlew bundleRelease
```

---

## 🛠️ Troubleshooting

### Build Fails

**Error: Keystore not found**
```
Solution: Check path in gradle.properties
Verify: android/app/act-release.keystore exists
```

**Error: Wrong password**
```
Solution: Double-check password in gradle.properties
Try: Re-enter password carefully
```

**Error: Out of memory**
```
Solution: Increase Gradle memory
Edit: android/gradle.properties
Add: org.gradle.jvmargs=-Xmx4096m
```

### Upload Fails

**Error: Version code already used**
```
Solution: Increment versionCode in build.gradle
Must be higher than previous release
```

**Error: APK/AAB not signed**
```
Solution: Verify signing config in build.gradle
Check: gradle.properties has correct values
```

### Play Console Issues

**Missing required fields**
```
Solution: Check all sections have green checkmarks
Complete: All setup checklist items
```

**Privacy policy required**
```
Solution: Create and host privacy policy
Add: URL in Play Console settings
```

---

## 📊 Post-Launch Monitoring

### Track Performance

**Play Console Analytics:**
- Installs and uninstalls
- Ratings and reviews
- Crashes and ANRs
- User acquisition

**Set Up Crash Reporting:**
```powershell
# Install Sentry (optional)
npm install @sentry/react-native

# Configure in app
# See: BARE_RN_MIGRATION_GUIDE.md Task 5
```

### Respond to Reviews

- Reply to user feedback
- Fix reported bugs
- Release updates regularly

---

## 🎯 Quick Commands Reference

```powershell
# Navigate to project
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Generate keystore (first time only)
.\GENERATE_KEYSTORE.ps1

# Build release AAB
cd android
.\gradlew clean
.\gradlew bundleRelease

# Build release APK
.\gradlew assembleRelease

# Verify signing
jarsigner -verify -verbose -certs "app\build\outputs\bundle\release\app-release.aab"

# Check file
Get-Item "app\build\outputs\bundle\release\app-release.aab"
```

---

## 📞 Resources

- **Play Console**: https://play.google.com/console
- **Android Publishing Guide**: https://developer.android.com/studio/publish
- **App Signing**: https://developer.android.com/studio/publish/app-signing
- **Play Console Help**: https://support.google.com/googleplay/android-developer

---

## ✅ Summary

### What You Need to Do:

1. **Create Keystore** (15 min)
   - Run `.\GENERATE_KEYSTORE.ps1`
   - Backup keystore file
   - Save password securely

2. **Configure Signing** (5 min)
   - Update `gradle.properties`
   - Verify `build.gradle`

3. **Build Release** (10 min)
   - Run `.\gradlew bundleRelease`
   - Verify AAB file

4. **Prepare Assets** (30-60 min)
   - Take screenshots
   - Create feature graphic
   - Write descriptions

5. **Play Console Setup** (30-60 min)
   - Create account ($25)
   - Create app
   - Complete checklist

6. **Upload & Submit** (15 min)
   - Upload AAB
   - Fill store listing
   - Submit for review

**Total Time**: 2-3 hours

**Review Time**: 1-7 days

---

## 🎉 You're Ready!

Your app is prepared for Play Store submission. Follow the steps above, and you'll have your app published soon!

**Good luck with your launch! 🚀**