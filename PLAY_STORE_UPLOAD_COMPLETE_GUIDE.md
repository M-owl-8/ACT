# 🚀 Complete Google Play Store Upload Guide for ACT App

## 📋 TABLE OF CONTENTS
1. [Prerequisites & Setup](#prerequisites)
2. [Keystore Generation (Critical!)](#keystore-generation)
3. [Backend Deployment](#backend-deployment)
4. [Build Configuration](#build-configuration)
5. [Release Build](#release-build)
6. [Play Store Submission](#play-store-submission)
7. [Post-Launch](#post-launch)

---

## <a name="prerequisites"></a>🎯 PREREQUISITES & ENVIRONMENT SETUP

### System Requirements
- ✓ Windows 10/11 with PowerShell 5.0+
- ✓ Android SDK installed (API 34+)
- ✓ Java Development Kit (JDK 17+)
- ✓ Node.js 18+ with npm
- ✓ Git
- ✓ Google Play Developer Account ($25 USD one-time fee)
- ✓ Google Cloud Project (for Firebase)

### Verify All Tools Are Installed

```powershell
# Check Java
java -version
javac -version

# Check Node.js
node --version
npm --version

# Check Android SDK
echo $env:ANDROID_HOME

# Check if keytool is available
keytool -help | Select-Object -First 5
```

### Environment Variables Required

```powershell
# Add to your system environment variables:
# ANDROID_HOME: C:\Users\[YourUsername]\AppData\Local\Android\Sdk
# JAVA_HOME: C:\Program Files\Java\jdk-17

# Verify they're set:
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
```

---

## <a name="keystore-generation"></a>🔐 STEP 1: KEYSTORE GENERATION (CRITICAL!)

### ⚠️ WARNING - Read This First!

The keystore file is the ONLY way to sign app updates on Google Play Store:
- **Lose the keystore** = You CANNOT update your app ever
- **Forget the password** = You CANNOT update your app
- **Need to create new app** = You lose all user reviews, ratings, downloads

### Create the Keystore File

```powershell
cd c:\work\act-gen1\apps\mobile\android\app

# Generate keystore with RSA 2048-bit encryption (valid for ~27 years)
keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore act-release.keystore `
  -alias act-key `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

### Answer the Prompts

When prompted, enter the following information:

```
Enter keystore password: [CREATE_A_STRONG_PASSWORD]
Re-enter new password: [SAME_PASSWORD]
What is your first and last name? [Unknown]: ACT Development Team
What is the name of your organizational unit? [Unknown]: Mobile Development
What is the name of your organization? [Unknown]: ACT
What is the name of your City or Locality? [Unknown]: Tokyo
What is the name of your State or Province? [Unknown]: Tokyo
What is the two-letter country code for this unit? [Unknown]: JP
Is CN=ACT Development Team... correct? [no]: yes

Enter key password for <act-key> (RETURN if same as keystore password): [PRESS ENTER]
Re-enter new password: [PRESS ENTER]
```

### Verify Keystore Was Created

```powershell
cd c:\work\act-gen1\apps\mobile\android\app

# List keystore contents
keytool -list -v -keystore act-release.keystore -alias act-key

# Check file size (should be ~3KB)
Get-Item act-release.keystore | Select-Object Length
```

### 🔒 IMMEDIATELY BACKUP YOUR KEYSTORE (DO THIS NOW!)

**Option 1: USB Drive Backup**
```powershell
# Create backup directory on USB
New-Item -ItemType Directory -Path "D:\ACT_Keystore_Backups" -Force

# Copy keystore
Copy-Item `
  "c:\work\act-gen1\apps\mobile\android\app\act-release.keystore" `
  -Destination "D:\ACT_Keystore_Backups\act-release-backup-$(Get-Date -Format 'yyyy-MM-dd').keystore"
```

**Option 2: Cloud Storage Backup**
1. Go to Google Drive / OneDrive / Dropbox
2. Upload `act-release.keystore` to a private folder
3. Label it: "ACT App - CRITICAL - Release Keystore"

**Option 3: Password Manager**
1. Open 1Password, LastPass, or Bitwarden
2. Create secure note with:
   - Keystore password
   - Key alias: `act-key`
   - Date created: [today's date]
   - File location: `c:\work\act-gen1\apps\mobile\android\app\act-release.keystore`

---

## <a name="backend-deployment"></a>🔧 STEP 2: BACKEND DEPLOYMENT (OPTIONAL BUT RECOMMENDED)

### Why Deploy Backend First?
- Mobile app needs backend URL for production
- Firebase Cloud Messaging requires backend
- Production authentication uses live backend

### Option A: Deploy to Railway (Recommended)

**Step 2.1: Connect Railway Account**

```powershell
# Install Railway CLI globally
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to API directory
cd c:\work\act-gen1\apps\api

# Link to Railway project
railway link
```

**Step 2.2: Configure Environment**

```powershell
cd c:\work\act-gen1\apps\api

# Set production variables in Railway dashboard:
# DATABASE_URL: postgresql://...
# JWT_SECRET: [generate-random-secret]
# ENVIRONMENT: production
```

**Step 2.3: Deploy**

```powershell
railway up
```

**Step 2.4: Get Production URL**

After deployment:
1. Go to https://railway.app
2. Find your ACT project
3. Copy the production URL (e.g., `https://act-production-xxxx.up.railway.app`)
4. **Save this URL** - you'll need it for the mobile app

### Option B: Deploy to Heroku (Alternative)

```powershell
# Install Heroku CLI
# Go to https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create act-gen1-prod

# Set environment variables
heroku config:set ENVIRONMENT=production

# Deploy
git push heroku main
```

### Option C: Self-Hosted (Advanced)

Deploy to your own VPS/server with:
- Ubuntu 22.04 LTS
- Python 3.11+
- PostgreSQL 14+
- Nginx reverse proxy
- SSL/TLS certificate (Let's Encrypt)

---

## <a name="build-configuration"></a>⚙️ STEP 3: BUILD CONFIGURATION

### Update Mobile App for Production

**Step 3.1: Update Environment Variables**

```powershell
# Open mobile .env file
notepad c:\work\act-gen1\apps\mobile\.env
```

Replace with production URL:
```env
# Production deployment (UPDATE THIS URL!)
EXPO_PUBLIC_API_BASE_URL=https://act-production-xxxx.up.railway.app

# Or your backend URL
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.com
```

**Step 3.2: Update app.json with Correct Values**

```powershell
# Open app.json
notepad c:\work\act-gen1\apps\mobile\app.json
```

Key fields to verify/update:
```json
{
  "expo": {
    "name": "ACT",
    "slug": "act-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "android": {
      "package": "com.act.app",
      "versionCode": 1
    },
    "owner": "YOUR_EXPO_USERNAME",
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

**Step 3.3: Update gradle.properties**

```powershell
# Open gradle.properties
notepad c:\work\act-gen1\apps\mobile\android\gradle.properties
```

Add signing configuration:
```properties
# Release Signing Configuration
ACT_RELEASE_STORE_FILE=act-release.keystore
ACT_RELEASE_KEY_ALIAS=act-key
ACT_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
ACT_RELEASE_KEY_PASSWORD=YOUR_KEYSTORE_PASSWORD
```

**⚠️ SECURITY WARNING**: Never commit passwords to Git!

**Step 3.4: Verify build.gradle Configuration**

The signing configuration should already be in place. Verify at:
`c:\work\act-gen1\apps\mobile\android\app\build.gradle`

Look for:
```gradle
signingConfigs {
    release {
        storeFile file("../app/act-release.keystore")
        storePassword System.getenv("ACT_RELEASE_STORE_PASSWORD") ?: ACT_RELEASE_STORE_PASSWORD
        keyAlias System.getenv("ACT_RELEASE_KEY_ALIAS") ?: ACT_RELEASE_KEY_ALIAS
        keyPassword System.getenv("ACT_RELEASE_KEY_PASSWORD") ?: ACT_RELEASE_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
    }
}
```

---

## <a name="release-build"></a>📦 STEP 4: BUILD RELEASE APK/AAB

### Option A: Build AAB (Recommended for Play Store)

AAB (Android App Bundle) is required for Google Play Store:

```powershell
cd c:\work\act-gen1\apps\mobile\android

# Clean previous builds
.\gradlew clean

# Build release bundle
.\gradlew bundleRelease
```

**Verify the build:**
```powershell
# Check output exists
Get-Item "app\build\outputs\bundle\release\app-release.aab"

# Verify signing
jarsigner -verify -verbose -certs "app\build\outputs\bundle\release\app-release.aab" | Select-Object -First 20
```

**Output location:**
```
c:\work\act-gen1\apps\mobile\android\app\build\outputs\bundle\release\app-release.aab
```

### Option B: Build APK (For Testing)

```powershell
cd c:\work\act-gen1\apps\mobile\android

# Build release APK
.\gradlew assembleRelease
```

**Output location:**
```
c:\work\act-gen1\apps\mobile\android\app\build\outputs\apk\release\app-release.apk
```

### Option C: Use EAS Build (Recommended - Cloud Build)

```powershell
cd c:\work\act-gen1\apps\mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform android --profile production
```

Benefits:
- Builds in the cloud
- No local environment setup needed
- Automatic signing
- Faster builds

---

## <a name="play-store-submission"></a>🎯 STEP 5: GOOGLE PLAY STORE SUBMISSION

### Phase 1: Create Play Console Account

**Step 5.1: Register Developer Account**

1. Go to: https://play.google.com/console
2. Sign in with Google account
3. Accept terms and conditions
4. Pay $25 USD one-time fee
5. Complete profile setup

### Phase 2: Create App in Play Console

**Step 5.2: Create New App**

1. Click **"Create app"** button
2. Fill in:
   - **App name**: `ACT`
   - **Default language**: `Japanese (日本語)` or `English`
   - **App type**: `App`
   - **Free or paid**: `Free` (or `Paid` if applicable)
3. Accept declarations
4. Click **"Create app"**

### Phase 3: Complete All Setup Forms

**Step 5.3: App Access**

1. Go to: **Setup** → **App access**
2. Question: "Does this app use restricted API?"
3. Select: "All functionality is available without restrictions"
4. Save

**Step 5.4: Ads Declaration**

1. Go to: **Setup** → **Ads**
2. Question: "Does this app contain ads?"
3. Select: "No, my app does not contain ads"
4. Save

**Step 5.5: Content Rating Questionnaire**

1. Go to: **Setup** → **Content rating**
2. Click **"Start questionnaire"**
3. Answer all questions honestly:
   - Category: `Productivity`
   - Violence, sexual content, etc.: `No`
4. Submit questionnaire
5. Receive rating (likely: `Everyone` or `Teen`)

**Step 5.6: Target Audience**

1. Go to: **Setup** → **Target audience**
2. Select target age groups
3. Select countries
4. Save

**Step 5.7: Data Safety**

1. Go to: **Setup** → **Data safety**
2. Fill in data collection form:
   - **Personal info**: Email (for authentication)
   - **Sensitive info**: No
   - **Crash logs**: Optional
3. Upload privacy policy (see below)
4. Save

**Step 5.8: COVID-19 Contact Tracing**

1. Go to: **Setup** → **COVID-19 contact tracing**
2. Select: "No" (unless applicable)
3. Save

### Phase 4: Upload Release Bundle

**Step 5.9: Upload AAB**

1. Go to: **Release** → **Production** → **Create new release**
2. Click **"Upload"** button
3. Select your AAB file:
   ```
   c:\work\act-gen1\apps\mobile\android\app\build\outputs\bundle\release\app-release.aab
   ```
4. Wait for upload to complete (~2-5 minutes)
5. Google Play validates the bundle automatically

**Step 5.10: Add Release Notes**

1. In the release form, find **"Release notes"** section
2. Enter for each language:

   **English:**
   ```
   Initial release of ACT
   
   Features:
   - Secure user authentication
   - Real-time push notifications
   - Beautiful Japanese-themed UI
   - Offline support with local storage
   - Fast and responsive performance
   - Team collaboration tools
   ```

   **Japanese (日本語):**
   ```
   ACT の初回リリース
   
   機能:
   - セキュアなユーザー認証
   - リアルタイムプッシュ通知
   - 美しい日本風UI
   - オフラインサポート
   - 高速で応答性に優れたパフォーマンス
   - チーム協力ツール
   ```

3. Save

### Phase 5: Create Store Listing

**Step 5.11: Main Store Listing**

1. Go to: **Store presence** → **Main store listing**

**App title (50 chars max):**
```
ACT
```

**Short description (80 chars max):**
```
Team productivity & collaboration tool with secure authentication
```

**Full description (4000 chars max):**
```
ACT (Advanced Collaboration Tool) is a powerful mobile application designed to enhance team productivity and streamline collaboration.

✨ Key Features:
• Secure Authentication: Enterprise-grade security with JWT tokens
• Real-time Notifications: Instant push notifications for team updates
• Japanese UI Theme: Beautiful and intuitive Japanese-designed interface
• Offline Support: Full functionality with secure local data storage
• Fast Performance: Optimized for speed and responsiveness
• Team Collaboration: Complete tools for seamless teamwork

🎯 Perfect For:
Teams looking to improve communication and productivity
Organizations seeking secure, reliable collaboration tools
Users who value data privacy and security

🔒 Security & Privacy:
- All data encrypted in transit and at rest
- No third-party data sharing
- Compliant with GDPR and privacy regulations
- Regular security audits

📱 Technical Details:
- Works on Android 9.0+
- Minimal data usage
- Battery optimized
- Works offline with sync when connected

Start collaborating today with ACT!

Support: support@act.app
Website: https://act.app
Privacy: https://act.app/privacy
```

**Step 5.12: Upload Graphics**

Required images:

1. **App Icon** (512x512 PNG)
   - Location: `c:\work\act-gen1\apps\mobile\assets\icon.png`
   - High quality, no transparency

2. **Feature Graphic** (1024x500 PNG)
   - Create using Canva or similar
   - Show key features
   - Must be eye-catching

3. **Screenshots** (minimum 2, up to 8)
   - Size: 1080x1920 or 1440x2560 PNG
   - Include app walkthrough
   - Show authentication, main features, notifications
   - Add captions highlighting features

**How to Create Screenshots:**

Using Android Emulator:
```powershell
# Start app in emulator
npm run android

# Wait for app to load
# Click camera icon in emulator toolbar (or Ctrl+S)
# Screenshots saved in: C:\Users\[username]\.android\avd\[device]\screenshots\
```

Using Physical Device:
```powershell
# Connect device via USB with debugging enabled
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png ./screenshots/
```

**Step 5.13: Promo Assets**

1. **Promo Video** (Optional):
   - Upload YouTube link
   - 30 seconds to 2 minutes
   - No audio required (add captions instead)

2. **Promo Graphics** (Optional):
   - 512x512 or 1024x1024 PNG
   - Showcase app benefits

### Phase 6: Pricing & Distribution

**Step 5.14: Pricing & Distribution**

1. Go to: **Pricing & distribution**

2. **Pricing:**
   - Select: `Free` (or set price if paid)

3. **Countries/Regions:**
   - Option A: `All countries`
   - Option B: Select specific countries

4. **Content Guidelines:**
   - ✓ Check all required checkboxes
   - ✓ Confirm compliance with Play Store policies

5. **Device Requirements:**
   - Minimum API: 21 (Android 5.0)
   - Verify target API: 34+

6. **Save**

### Phase 7: Privacy Policy Setup

**Step 5.15: Create Privacy Policy (REQUIRED)**

You MUST have a privacy policy URL. Options:

**Option A: Use Privacy Policy Generator**
1. Go to: https://www.privacypolicygenerator.info/
2. Fill in app details:
   - App name: ACT
   - App category: Productivity/Business
   - Data collected: Email, usage analytics
3. Generate policy
4. Copy HTML/text
5. Host on:
   - GitHub Pages (free)
   - Netlify (free)
   - Your website

**Option B: Create Simple Policy**

Host this at `https://act.app/privacy`:

```markdown
# Privacy Policy - ACT App

**Effective Date:** [Today's Date]

## 1. Information We Collect

ACT collects the following personal information:
- **Email address** - For user authentication and account identification
- **User profile information** - Name, profile picture
- **Usage analytics** - Features used, session duration
- **Device information** - Device type, OS version

## 2. How We Use Information

We use collected information to:
- Create and maintain user accounts
- Provide authentication and security
- Send push notifications
- Improve app functionality
- Analyze usage patterns

## 3. Data Storage & Security

- All data is encrypted in transit using TLS/SSL
- Data is stored on secure, encrypted servers
- Access restricted to authorized personnel only
- Regular security audits and penetration testing

## 4. Data Sharing

We do NOT share personal data with:
- Third parties
- Advertisers
- Data brokers
- Marketing companies

Exceptions:
- Legal requirements (government requests)
- Service providers (e.g., hosting providers)
- With your explicit consent

## 5. User Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Opt-out of analytics

## 6. Data Retention

- Account data: Retained while account is active
- After deletion: Permanently deleted within 30 days
- Backups: Retained for 90 days then deleted

## 7. Children's Privacy

ACT is not directed to children under 13. We do not knowingly collect data from children. If we become aware of such collection, we will delete it immediately.

## 8. Changes to This Policy

We may update this policy occasionally. Continued use of ACT constitutes acceptance of changes.

## 9. Contact Us

For privacy concerns, contact:
- Email: privacy@act.app
- Website: https://act.app
- Address: [Your Company Address]

---
Last Updated: [Date]
```

---

## <a name="post-launch"></a>🎉 STEP 6: SUBMISSION & MONITORING

### Pre-Submission Checklist

Before clicking "Submit for Review":

- ✓ All required fields completed
- ✓ AAB file uploaded and validated
- ✓ Graphics/screenshots uploaded
- ✓ Privacy policy URL active and accessible
- ✓ Content rating completed
- ✓ Version code higher than any previous release (starts at 1)
- ✓ Release notes filled in
- ✓ Terms accepted
- ✓ No policy violations

### Submit for Review

```
Click: "Review" → "Submit for review"
```

Google Play will review your app:
- **Average review time**: 2-4 hours
- **Sometimes**: Up to 24-48 hours
- **Final status**: Email notification

### Monitoring After Launch

**Step 6.1: Check Review Status**

1. Go to Play Console Dashboard
2. Look for: **Release** → **Production**
3. Status will show:
   - `In review` - Being reviewed
   - `Approved` - Live on Play Store!
   - `Rejected` - See rejection reason and resubmit

**Step 6.2: Common Rejection Reasons & Fixes**

If rejected:
1. Read rejection email carefully
2. Fix the issue
3. Update version code in app.json: `versionCode: 2`
4. Rebuild AAB
5. Upload new AAB
6. Resubmit

**Common issues:**
- Outdated API level (fix: update targetSdk to 34+)
- Broken links in privacy policy (fix: verify URL works)
- Missing permissions explanation (fix: add "why each permission is needed")
- Misleading description (fix: ensure description matches functionality)

**Step 6.3: Post-Launch Monitoring**

After approval:

```
Play Console → Analytics
- Download trends
- User reviews
- Crash reports
- Performance metrics
```

### Update Your Backend

Once live on Play Store:

```powershell
# Update backend to production URL in .env
cd c:\work\act-gen1\apps\mobile
notepad .env

# Change from:
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000

# To production URL:
EXPO_PUBLIC_API_BASE_URL=https://act-production-xxxx.up.railway.app
```

---

## 📊 STEP 7: FUTURE UPDATES

### Publishing Updates

For version 2.0.0 and beyond:

```powershell
# 1. Update version in app.json
notepad c:\work\act-gen1\apps\mobile\app.json
# Change: "version": "1.0.1"
# Change: "versionCode": 2

# 2. Make code changes

# 3. Rebuild AAB
cd c:\work\act-gen1\apps\mobile\android
.\gradlew clean
.\gradlew bundleRelease

# 4. Upload to Play Console
# Play Console → Production → Create new release
# → Upload new AAB
# → Add release notes
# → Submit for review

# Review typically faster for updates: 1-2 hours
```

### Versioning Strategy

```
Version Format: MAJOR.MINOR.PATCH
Example: 1.0.0 → 1.0.1 (patch) → 1.1.0 (minor) → 2.0.0 (major)

Version Code: Always increment (must be > previous)
Example: versionCode: 1, 2, 3, 4, ... (never use same number twice)
```

---

## 🆘 TROUBLESHOOTING

### Build Fails with Signing Error

```powershell
# Verify keystore exists
Get-Item c:\work\act-gen1\apps\mobile\android\app\act-release.keystore

# Verify password is correct
keytool -list -v -keystore act-release.keystore -alias act-key

# Fix: Ensure gradle.properties has correct password
notepad c:\work\act-gen1\apps\mobile\android\gradle.properties
```

### Build Succeeds but Won't Upload

```powershell
# Verify AAB signing
jarsigner -verify -verbose -certs app\build\outputs\bundle\release\app-release.aab

# Check file size (should be 20-50MB)
Get-Item app\build\outputs\bundle\release\app-release.aab | Select-Object Length
```

### Play Store Rejects App

1. Read the rejection email entirely
2. Go to: Play Console → **Your app** → **Setup** → **App content**
3. Look for red ✗ marks and fix them
4. Try resubmitting

### Can't Remember Keystore Password

```
⚠️ If you lose the keystore password, you CANNOT:
- Sign app updates
- Upload new versions
- Modify existing app

ONLY solution: Create new app with new package name
(You lose all reviews, ratings, downloads)

This is why backups are CRITICAL!
```

---

## ✅ FINAL CHECKLIST

Before submitting to Play Store, verify:

- ✓ Keystore generated and backed up
- ✓ Backend deployed (if needed)
- ✓ .env file updated with production URL
- ✓ app.json updated with correct version
- ✓ gradle.properties configured with keystore password
- ✓ AAB built successfully and verified
- ✓ Play Console account created ($25 paid)
- ✓ App created in Play Console
- ✓ All setup forms completed
- ✓ Content rating questionnaire done
- ✓ Privacy policy URL created and live
- ✓ Graphics/screenshots uploaded
- ✓ Store listing completed with description
- ✓ AAB uploaded and validated
- ✓ Release notes added
- ✓ Pricing & distribution configured
- ✓ All terms accepted

---

## 📞 QUICK REFERENCE COMMANDS

```powershell
# Generate keystore
keytool -genkeypair -v -storetype PKCS12 -keystore act-release.keystore -alias act-key -keyalg RSA -keysize 2048 -validity 10000

# Verify keystore
keytool -list -v -keystore act-release.keystore -alias act-key

# Build AAB
cd c:\work\act-gen1\apps\mobile\android
.\gradlew clean
.\gradlew bundleRelease

# Verify AAB signing
jarsigner -verify -verbose -certs app\build\outputs\bundle\release\app-release.aab

# Get AAB file
Get-Item app\build\outputs\bundle\release\app-release.aab

# Update version
notepad c:\work\act-gen1\apps\mobile\app.json
# Update "version" and "versionCode"
```

---

## 🎓 LEARNING RESOURCES

- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [React Native Build Configuration](https://reactnative.dev/docs/signed-apk-android)
- [Gradle Build Tools](https://developer.android.com/studio/releases/gradle-plugin)
- [App Bundle Format](https://developer.android.com/guide/app-bundle)
- [Content Policies](https://play.google.com/about/developer-content-policy/)

---

**Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**For:** ACT App
**Version:** 1.0.0