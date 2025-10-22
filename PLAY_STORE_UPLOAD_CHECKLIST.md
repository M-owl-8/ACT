# ☑️ PLAY STORE UPLOAD - COMPLETE CHECKLIST

Use this checklist as you work through uploading ACT to Google Play Store.

---

## PHASE 1️⃣: PRE-BUILD SETUP (Do This First)

### 1.1 Generate & Secure Keystore

- [ ] Open PowerShell as Administrator
- [ ] Navigate to: `cd c:\work\act-gen1\apps\mobile\android\app`
- [ ] Run keystore command:
  ```powershell
  keytool -genkeypair -v -storetype PKCS12 `
    -keystore act-release.keystore `
    -alias act-key `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000
  ```
- [ ] Set strong keystore password (save it!)
- [ ] Confirm keystore file exists: `Get-Item act-release.keystore`
- [ ] Verify keystore contents: `keytool -list -v -keystore act-release.keystore -alias act-key`

### 1.2 Backup Keystore (CRITICAL!)

**Backup Location 1 - USB Drive:**
- [ ] Insert USB drive
- [ ] Copy keystore to USB: `Copy-Item "act-release.keystore" -Destination "D:\Backups\act-release-BACKUP.keystore"`
- [ ] Verify copy succeeded: `Get-Item "D:\Backups\act-release-BACKUP.keystore"`

**Backup Location 2 - Cloud:**
- [ ] Go to Google Drive / OneDrive / Dropbox
- [ ] Create folder: "ACT_APP_CRITICAL"
- [ ] Upload: `act-release.keystore`
- [ ] Share settings: Private (only you)
- [ ] Save the share link

**Backup Location 3 - Password Manager:**
- [ ] Open 1Password / LastPass / Bitwarden
- [ ] Create secure note with:
  - Keystore password: `[YOUR_PASSWORD]`
  - Key alias: `act-key`
  - Created date: `[TODAY'S DATE]`
  - File location: `c:\work\act-gen1\apps\mobile\android\app\act-release.keystore`
- [ ] Save and close

### 1.3 Configure gradle.properties

- [ ] Open: `notepad c:\work\act-gen1\apps\mobile\android\gradle.properties`
- [ ] Add these lines at the bottom:
  ```properties
  ACT_RELEASE_STORE_FILE=act-release.keystore
  ACT_RELEASE_KEY_ALIAS=act-key
  ACT_RELEASE_STORE_PASSWORD=[YOUR_KEYSTORE_PASSWORD_HERE]
  ACT_RELEASE_KEY_PASSWORD=[YOUR_KEYSTORE_PASSWORD_HERE]
  ```
- [ ] Save file
- [ ] Verify it saved: `Get-Content "c:\work\act-gen1\apps\mobile\android\gradle.properties" | Select-Object -Last 5`

### 1.4 Update Mobile Environment

- [ ] Open: `notepad c:\work\act-gen1\apps\mobile\.env`
- [ ] Find line: `EXPO_PUBLIC_API_BASE_URL=http://10.21.69.205:8000`
- [ ] Replace with your production URL:
  - If using Railway: `EXPO_PUBLIC_API_BASE_URL=https://act-production-xxxx.up.railway.app`
  - If using custom: `EXPO_PUBLIC_API_BASE_URL=https://your-domain.com`
  - If testing locally: Keep as is for now
- [ ] Save file
- [ ] Verify: `Get-Content "c:\work\act-gen1\apps\mobile\.env" | grep "EXPO_PUBLIC_API_BASE_URL"`

### 1.5 Update app.json Version

- [ ] Open: `notepad c:\work\act-gen1\apps\mobile\app.json`
- [ ] Find: `"version": "1.0.0"`
- [ ] Confirm it's: `"version": "1.0.0"` (for initial release)
- [ ] Find: `"versionCode": 1` under `android`
- [ ] Confirm it's: `"versionCode": 1` (for initial release)
- [ ] Find: `"owner": "YOUR_EXPO_USERNAME"`
- [ ] Update to your Expo username (or leave as is)
- [ ] Save file

---

## PHASE 2️⃣: BUILD RELEASE APK/AAB

### 2.1 Clean Previous Builds

- [ ] Navigate to: `cd c:\work\act-gen1\apps\mobile\android`
- [ ] Run clean: `.\gradlew clean`
- [ ] Wait for completion (1-2 minutes)

### 2.2 Build Release AAB

- [ ] Still in android directory
- [ ] Run build: `.\gradlew bundleRelease`
- [ ] Wait for build (5-10 minutes)
- [ ] Watch for: `BUILD SUCCESSFUL` message

### 2.3 Verify Build Succeeded

- [ ] Check if file exists: `Get-Item "app\build\outputs\bundle\release\app-release.aab"`
- [ ] Check file size (should be 20-50 MB): `Get-Item "app\build\outputs\bundle\release\app-release.aab" | Select-Object Length`
- [ ] Verify signing:
  ```powershell
  jarsigner -verify -verbose -certs "app\build\outputs\bundle\release\app-release.aab" | Select-Object -First 20
  ```
- [ ] Should show: `jar verified.`

### 2.4 Create Backup of Release AAB

- [ ] Copy AAB to backup location:
  ```powershell
  Copy-Item "app\build\outputs\bundle\release\app-release.aab" `
    -Destination "c:\work\act-gen1\RELEASES\app-release-v1.0.0.aab"
  ```
- [ ] Verify backup: `Get-Item "c:\work\act-gen1\RELEASES\app-release-v1.0.0.aab"`

---

## PHASE 3️⃣: PREPARE GRAPHICS & ASSETS

### 3.1 Verify Existing Graphics

- [ ] Check icon: `Get-Item "c:\work\act-gen1\apps\mobile\assets\icon.png"`
- [ ] Check adaptive icon: `Get-Item "c:\work\act-gen1\apps\mobile\assets\adaptive-icon.png"`
- [ ] Check splash: `Get-Item "c:\work\act-gen1\apps\mobile\assets\splash-icon.png"`
- [ ] All files should be ~100-200 KB each

### 3.2 Create Feature Graphic

**Using Canva (Easy):**
- [ ] Go to: https://www.canva.com/
- [ ] Create new design: Search "Google Play Feature Graphic"
- [ ] Size: 1024x500 pixels
- [ ] Add:
  - App name: "ACT"
  - Key benefit: "Team Collaboration Tool"
  - Visual: Japanese-themed design
- [ ] Download as PNG
- [ ] Save to: `c:\work\act-gen1\STORE_ASSETS\feature-graphic.png`

**Size verification:**
- [ ] Feature graphic should be exactly 1024x500 PNG
- [ ] File size: ~200-500 KB
- [ ] No transparency allowed (white background OK)

### 3.3 Take Screenshots

**Using Android Emulator:**
- [ ] Start app: `npm run android`
- [ ] Wait for app to load
- [ ] Navigate to key screens (Login, Register, Dashboard, Profile)
- [ ] Press: `Ctrl+S` to take screenshot (in emulator)
- [ ] Screenshots auto-saved to: `C:\Users\[username]\.android\avd\[device]\screenshots\`
- [ ] Need minimum 2 screenshots, up to 8
- [ ] Each screenshot: 1080x1920 or 1440x2560 PNG

**Or using ADB (with physical device):**
- [ ] Connect device via USB with debugging enabled
- [ ] Take screenshot: `adb shell screencap -p /sdcard/screenshot.png`
- [ ] Pull to computer: `adb pull /sdcard/screenshot.png ./screenshots/`
- [ ] Copy to: `c:\work\act-gen1\STORE_ASSETS\screenshots\`

### 3.4 Store Assets Folder Structure

- [ ] Create folder: `c:\work\act-gen1\STORE_ASSETS\`
- [ ] Sub-folder: `screenshots\`
- [ ] Store these files:
  - [ ] `c:\work\act-gen1\apps\mobile\assets\icon.png` → Copy
  - [ ] `feature-graphic.png` (created above)
  - [ ] `screenshot-1.png` → Login screen
  - [ ] `screenshot-2.png` → Dashboard
  - [ ] `screenshot-3.png` → Features
  - [ ] `screenshot-4.png` → Profile (optional)

---

## PHASE 4️⃣: CREATE PLAY CONSOLE ACCOUNT

### 4.1 Google Account Setup

- [ ] Have Gmail account ready
- [ ] Ensure account has payment method attached
- [ ] Note: $25 USD fee will be charged

### 4.2 Create Play Console Account

- [ ] Go to: https://play.google.com/console
- [ ] Sign in with your Google account
- [ ] Click: **"Set up a Google Play Developer account"**
- [ ] Accept terms
- [ ] Pay: $25 USD fee (one-time)
- [ ] Complete registration form:
  - [ ] Name (Developer name)
  - [ ] Email
  - [ ] Phone
  - [ ] Address
  - [ ] Website (optional)

### 4.3 Verify Account Created

- [ ] Refresh page or log in again
- [ ] Should see: **"Create app"** button
- [ ] You're now a Play Store developer! ✨

---

## PHASE 5️⃣: CREATE APP IN PLAY CONSOLE

### 5.1 Create New App

- [ ] Click: **"Create app"**
- [ ] Enter:
  - [ ] **App name**: `ACT`
  - [ ] **Default language**: `English` (or `Japanese (日本語)`)
  - [ ] **App or game**: `App` (select radio button)
  - [ ] **Free or paid**: `Free` (or `Paid` if applicable)
  - [ ] **Type of app**: `Productivity` or `Business`
- [ ] Check boxes: Accept declarations
- [ ] Click: **"Create app"**

### 5.2 App Dashboard

- [ ] You should see: App dashboard
- [ ] Left sidebar should have: Setup, Releases, Store presence, Policies
- [ ] Green checkmarks will appear as you complete sections

---

## PHASE 6️⃣: COMPLETE SETUP FORMS

All items below found in: **Setup** → [Item Name]

### 6.1 App Access

- [ ] Go to: **Setup** → **App access**
- [ ] Question: "How is your app accessed?"
- [ ] Select: **"All functionality is available without restrictions"**
- [ ] Click: **Save**
- [ ] ✓ Should show green checkmark

### 6.2 Ads Declaration

- [ ] Go to: **Setup** → **Ads**
- [ ] Question: "Does your app contain ads?"
- [ ] Select: **"No, my app does not contain ads"**
  - If you add ads later, you can change this
- [ ] Click: **Save**
- [ ] ✓ Should show green checkmark

### 6.3 Content Rating Questionnaire

- [ ] Go to: **Setup** → **Content rating**
- [ ] Click: **"Start questionnaire"** or **"Complete questionnaire"**
- [ ] Fill form:
  - [ ] **Category**: Select `Productivity` or `Lifestyle`
  - [ ] **Violence**: Select `No`
  - [ ] **Sexual content**: Select `No`
  - [ ] **Profanity**: Select `No`
  - [ ] Continue answering all questions honestly
- [ ] Click: **"Calculate ratings"**
- [ ] Review rating (likely `Everyone` or `Teen`)
- [ ] Click: **Save**
- [ ] ✓ Should show green checkmark

### 6.4 Target Audience

- [ ] Go to: **Setup** → **Target audience**
- [ ] Select target age groups (e.g., 18+)
- [ ] Select countries:
  - [ ] Option A: All countries
  - [ ] Option B: Select specific (Japan, US, etc.)
- [ ] Check: "Restricted to mature audiences" if applicable
- [ ] Click: **Save**
- [ ] ✓ Should show green checkmark

### 6.5 Data Safety

- [ ] Go to: **Setup** → **Data safety**
- [ ] Fill form:
  - [ ] **Data encrypted in transit**: Yes ✓
  - [ ] **Data encrypted at rest**: Yes ✓
  - [ ] **Data can be deleted**: Yes ✓
  - [ ] **Data shared with 3rd parties**: No ✓
  - [ ] **Uses sensitive information**: No (for ACT)
  - [ ] **Collects personal data**: Yes (email)
- [ ] Click: **Add privacy policy URL**
  - [ ] Paste: https://[your-domain]/privacy
  - [ ] OR: https://github.com/[your-username]/privacy-policy
- [ ] Click: **Save**

### 6.6 Government Apps

- [ ] Go to: **Setup** → **Government apps**
- [ ] Select: **"No"**
- [ ] Click: **Save**

---

## PHASE 7️⃣: CREATE PRIVACY POLICY (REQUIRED!)

### 7.1 Choose Privacy Policy Method

**Option A: Simple Hosted Policy (30 minutes)**

- [ ] Go to: https://www.privacypolicygenerator.info/
- [ ] Fill in app details:
  - [ ] App name: `ACT`
  - [ ] Category: `Productivity/Business`
  - [ ] Data collected: Email, usage analytics
- [ ] Generate policy
- [ ] Copy text

**Option B: GitHub Pages (20 minutes)**

- [ ] Go to: https://github.com/new
- [ ] Create repository: `act-privacy-policy`
- [ ] Upload file: `privacy-policy.md` with policy text
- [ ] Enable GitHub Pages:
  - [ ] Settings → Pages
  - [ ] Source: main branch
  - [ ] Save
- [ ] Access at: https://[your-username].github.io/act-privacy-policy/
- [ ] Add to step 6.5 as privacy policy URL

**Option C: Your Website**

- [ ] Create page at your domain: `/privacy`
- [ ] Add privacy policy text
- [ ] Ensure HTTPS (not HTTP)
- [ ] URL format: `https://your-domain.com/privacy`

### 7.2 Minimum Privacy Policy Content

```
# Privacy Policy - ACT App

**Effective Date:** [Today's Date]

## Information We Collect
- Email address for authentication
- User profile information
- Usage analytics

## Security
- Data encrypted in transit (TLS/SSL)
- Data encrypted at rest
- No sharing with third parties

## Contact
privacy@act.app
```

### 7.3 Verify Privacy Policy URL

- [ ] Copy your privacy policy URL
- [ ] Open in browser: Test that it loads correctly
- [ ] Ensure: HTTPS (not HTTP)
- [ ] Save URL: You'll need it in Play Console

---

## PHASE 8️⃣: UPLOAD RELEASE BUNDLE

### 8.1 Prepare for Upload

- [ ] Verify AAB file exists: `Get-Item "c:\work\act-gen1\apps\mobile\android\app\build\outputs\bundle\release\app-release.aab"`
- [ ] Copy file path (or keep open in folder)
- [ ] Go to Play Console: https://play.google.com/console

### 8.2 Upload AAB

- [ ] Click: **Release** → **Production** (or **Testing** for first test)
- [ ] Click: **"Create new release"**
- [ ] Click: **"Upload"** button
- [ ] Select file: `app-release.aab` from your computer
- [ ] Wait: Upload completes (~2-5 minutes)
- [ ] Google validates automatically

### 8.3 Add Release Notes

- [ ] In release form, find: **Release notes**
- [ ] Add for each language:

**English:**
```
Initial release of ACT

Features:
- Secure user authentication
- Real-time push notifications
- Beautiful Japanese-themed UI
- Offline support
- Team collaboration tools
```

- [ ] Click: **Add language** if needed for Japanese
- [ ] Add same notes in Japanese if multi-language:
```
ACTの初回リリース

機能:
- セキュアなユーザー認証
- リアルタイムプッシュ通知
- 美しい日本風UI
- オフラインサポート
- チーム協力ツール
```

- [ ] Click: **Save** (release notes)

---

## PHASE 9️⃣: CREATE STORE LISTING

### 9.1 App Title & Description

- [ ] Go to: **Store presence** → **Main store listing**
- [ ] Fill in:
  - [ ] **App title** (50 chars max): `ACT`
  - [ ] **Short description** (80 chars max): 
    ```
    Team collaboration tool for productivity
    ```
  - [ ] **Full description** (4000 chars max):
    ```
    ACT (Advanced Collaboration Tool) is a powerful mobile app for team productivity.
    
    ✨ Features:
    • Secure authentication
    • Real-time notifications
    • Japanese UI theme
    • Offline support
    • Team collaboration
    
    Perfect for teams seeking improved communication and productivity.
    ```

### 9.2 Upload Graphics

**App Icon:**
- [ ] Go to: **Graphic assets** → **App icon**
- [ ] Upload: `c:\work\act-gen1\apps\mobile\assets\icon.png`
- [ ] Size: 512x512 PNG
- [ ] Should show ✓

**Feature Graphic:**
- [ ] Go to: **Graphic assets** → **Feature graphic**
- [ ] Upload: Your created feature graphic (1024x500 PNG)
- [ ] Should show ✓

**Screenshots:**
- [ ] Go to: **Graphic assets** → **Phone screenshots**
- [ ] Click: **Add image** (multiple times)
- [ ] Upload minimum 2, up to 8 screenshots
- [ ] Size: 1080x1920 or 1440x2560 PNG
- [ ] Each should show ✓

**Promo Video (Optional):**
- [ ] Go to: **Graphic assets** → **Promo video**
- [ ] Paste YouTube link (if you have one)
- [ ] Leave blank if not applicable

### 9.3 Contact Details

- [ ] Go to: **Contact details**
- [ ] Email: `[your-email]` or `support@act.app`
- [ ] Website: `[your-website]` (optional)
- [ ] Phone: (optional)

---

## PHASE 🔟: PRICING & DISTRIBUTION

### 10.1 Pricing

- [ ] Go to: **Pricing & distribution**
- [ ] Select: **Free** (under "Pricing")
- [ ] Or select: **Paid** if applicable

### 10.2 Countries

- [ ] Select: **All countries** (simplest option)
- [ ] Or select specific countries if preferred

### 10.3 Device Requirements

- [ ] Verify:
  - [ ] Min API: 21+ (Android 5.0+)
  - [ ] Target API: 34+ (Android 14)
  - [ ] Screen sizes: Supports phones

### 10.4 Content Guidelines

- [ ] ✓ Check: "My app complies with Google Play Policies"
- [ ] ✓ Check: "My app is compliant with GDPR"
- [ ] ✓ Check: "My app doesn't contain ads for prohibited content"

### 10.5 Save

- [ ] Click: **Save**
- [ ] Should show ✓ green checkmarks for all sections

---

## PHASE 1️⃣1️⃣: FINAL REVIEW & SUBMISSION

### 11.1 Pre-Submission Checklist

Before clicking submit, verify:

- [ ] ✓ Release bundle uploaded (AAB)
- [ ] ✓ Release notes added
- [ ] ✓ All setup forms completed (green checkmarks)
- [ ] ✓ App icon uploaded
- [ ] ✓ Feature graphic uploaded
- [ ] ✓ Screenshots uploaded (2+)
- [ ] ✓ App title filled in
- [ ] ✓ Full description filled in
- [ ] ✓ Privacy policy URL added and verified
- [ ] ✓ Content rating completed
- [ ] ✓ Target audience selected
- [ ] ✓ Pricing set to Free
- [ ] ✓ Countries selected
- [ ] ✓ All terms accepted

### 11.2 Submit for Review

- [ ] Click: **Review** button (top of page)
- [ ] Review all items (green checkmarks)
- [ ] Click: **Submit for review**
- [ ] Confirm: "Yes, submit this release"
- [ ] Wait: Confirmation page

### 11.3 Confirmation

- [ ] Status should show: **"In review"**
- [ ] Email sent: Confirm submission
- [ ] Status page shows: Release ID and submission time

---

## PHASE 1️⃣2️⃣: MONITORING REVIEW STATUS

### 12.1 Check Status

- [ ] Go back to: Play Console Dashboard
- [ ] Click your app
- [ ] Look at: **Release** → **Production**
- [ ] Status shows: **"In review"**

### 12.2 Monitor Email

- [ ] Check Gmail inbox
- [ ] Subject: "App status change" from Google Play
- [ ] Possible outcomes:
  - [ ] ✅ **Approved** (1-4 hours) → App goes LIVE! 🎉
  - [ ] ❌ **Rejected** (2-24 hours) → Read reason, fix, resubmit

### 12.3 If Rejected

- [ ] Read rejection email carefully
- [ ] Common issues:
  - [ ] Outdated API level (fix: update targetSdk to 34)
  - [ ] Broken privacy policy URL (fix: verify URL works)
  - [ ] Missing permissions (already handled in your app)
  - [ ] Policy violation (ensure compliance)
- [ ] Fix the issue
- [ ] Update version code in app.json: `"versionCode": 2`
- [ ] Rebuild: `.\gradlew clean && .\gradlew bundleRelease`
- [ ] Upload new AAB
- [ ] Resubmit

### 12.4 If Approved

- [ ] 🎉 Congratulations! Your app is LIVE!
- [ ] Status: **"Live on Google Play"**
- [ ] Share link: https://play.google.com/store/apps/details?id=com.act.app
- [ ] Update backend URL if needed
- [ ] Monitor reviews and ratings
- [ ] Track downloads in Analytics

---

## PHASE 1️⃣3️⃣: POST-LAUNCH ACTIONS

### 13.1 Update Backend (if needed)

If you deployed backend to production:
- [ ] Note production URL
- [ ] Update `.env` in repo (for next release)
- [ ] Ensure API is responding

### 13.2 Create Version 2

For future updates:
- [ ] Update version in app.json: `"version": "1.0.1"`
- [ ] Update versionCode: `"versionCode": 2`
- [ ] Make code changes
- [ ] Rebuild AAB: `.\gradlew clean && .\gradlew bundleRelease`
- [ ] Upload to Play Console
- [ ] Resubmit

### 13.3 Monitor App

- [ ] Check: Play Console → Analytics
  - [ ] Downloads
  - [ ] User acquisition
  - [ ] Crash reports
  - [ ] Reviews and ratings
- [ ] Set up error tracking (Sentry already configured)

---

## ✅ COMPLETION CHECKLIST

Mark as complete once done:

- [ ] Keystore generated and backed up (3 locations)
- [ ] gradle.properties configured
- [ ] .env updated with production URL
- [ ] Release AAB built successfully
- [ ] Graphics prepared (icon, feature, screenshots)
- [ ] Privacy policy created and hosted
- [ ] Play Console account created ($25 paid)
- [ ] App created in Play Console
- [ ] All setup forms completed
- [ ] Store listing created
- [ ] AAB uploaded
- [ ] Release notes added
- [ ] Pricing and distribution configured
- [ ] App submitted for review
- [ ] Status: **"In review"** showing
- [ ] ✅ **SUBMITTED TO GOOGLE PLAY STORE!**

---

## 🎉 SUCCESS METRICS

When complete, you should have:

✅ App on Google Play Store
✅ Live download link: https://play.google.com/store/apps/details?id=com.act.app
✅ Unique package name: com.act.app
✅ Version 1.0.0 released
✅ All app features working
✅ Real-time notifications configured
✅ Firebase integration active
✅ Analytics tracking working

---

**Time to Completion:** ~5-6 hours total (mostly waiting for Play Store review)
**Cost:** $25 USD (one-time Play Store Developer fee)
**Difficulty:** Easy (follow checklist step-by-step)

**Good luck! You've got this! 🚀**

---

*Last Updated: 2025-10-22*
*For: ACT Gen-1 Mobile App*