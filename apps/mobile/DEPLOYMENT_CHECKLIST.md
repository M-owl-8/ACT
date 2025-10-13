# ACT Android Deployment Checklist

## 🎯 Complete Deployment Roadmap

Use this checklist to track your progress from development to Play Store release.

---

## Phase 1: Initial Setup ⚙️

### EAS Build Setup
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Create Expo account at https://expo.dev/signup
- [ ] Login to EAS: `eas login`
- [ ] Update `app.config.js` with your Expo username
- [ ] Run `eas build:configure` to initialize project
- [ ] Verify `eas.json` was created

### App Configuration
- [ ] App name set to "ACT" in `app.config.js`
- [ ] Package name set to "com.act.app"
- [ ] Version is "1.0.0"
- [ ] Android versionCode is 1
- [ ] All required assets exist:
  - [ ] icon.png
  - [ ] adaptive-icon.png
  - [ ] splash-icon.png
  - [ ] notification-icon.png
  - [ ] favicon.png

### Environment Setup
- [ ] Backend API is running and accessible
- [ ] API URL is configured in app
- [ ] Test authentication flow works locally
- [ ] All features work in Expo Go or local development

---

## Phase 2: Development Build 🔨

### Build Development APK
- [ ] Run: `.\BUILD_ANDROID.ps1 -Profile development`
  - Or: `eas build --platform android --profile development`
- [ ] Wait for build to complete (~15-30 minutes)
- [ ] Download APK from EAS build page

### Install on Phone
- [ ] Enable "Install from Unknown Sources" on Android phone
- [ ] Transfer APK to phone (via USB, email, or download)
- [ ] Install APK
- [ ] Grant all required permissions

### Test on Phone
- [ ] App launches successfully
- [ ] Login/Register works
- [ ] All screens are accessible
- [ ] Navigation works correctly
- [ ] Data syncs with backend
- [ ] No crashes or major bugs
- [ ] UI looks good on your phone's screen size
- [ ] Test on different Android versions if possible

---

## Phase 3: Firebase Setup (Optional) 🔔

### Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Create new project named "ACT"
- [ ] Disable Google Analytics (optional)

### Add Android App
- [ ] Add Android app to Firebase project
- [ ] Use package name: `com.act.app`
- [ ] Download `google-services.json`
- [ ] Place file in: `C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\`
- [ ] Verify file is in `.gitignore`

### Enable Cloud Messaging
- [ ] Go to Project Settings → Cloud Messaging
- [ ] Enable Cloud Messaging API
- [ ] Copy Server Key for backend
- [ ] Save Server Key securely

### Test Firebase
- [ ] Rebuild app with Firebase config
- [ ] Install on phone
- [ ] Grant notification permissions
- [ ] Send test notification from Firebase Console
- [ ] Verify notification is received

---

## Phase 4: Preview Build 🧪

### Build Preview APK
- [ ] Run: `.\BUILD_ANDROID.ps1 -Profile preview`
  - Or: `eas build --platform android --profile preview`
- [ ] Wait for build to complete
- [ ] Download APK

### Final Testing
- [ ] Install preview APK on phone
- [ ] Test all features thoroughly
- [ ] Test with real user data
- [ ] Test edge cases and error handling
- [ ] Test offline functionality
- [ ] Test notifications (if implemented)
- [ ] Check app performance
- [ ] Verify no development tools are visible
- [ ] Test on multiple devices if possible

### Get Feedback
- [ ] Share APK with beta testers
- [ ] Collect feedback
- [ ] Fix any reported issues
- [ ] Repeat preview build if needed

---

## Phase 5: Production Build 🚀

### Pre-Production Checklist
- [ ] All features are complete and tested
- [ ] No known critical bugs
- [ ] App icon is professional
- [ ] Splash screen looks good
- [ ] App name is correct
- [ ] Version number is correct
- [ ] Privacy policy is prepared (required for Play Store)
- [ ] Terms of service are prepared (if needed)

### Update Version
- [ ] Open `app.config.js`
- [ ] Update `version` (e.g., "1.0.0")
- [ ] Update `android.versionCode` (must be integer, increment for each release)
- [ ] Commit changes to git

### Build Production AAB
- [ ] Run: `.\BUILD_ANDROID.ps1 -Profile production`
  - Or: `eas build --platform android --profile production`
- [ ] When prompted about keystore, choose "Yes" to let EAS manage it
- [ ] Wait for build to complete
- [ ] Download `.aab` file
- [ ] Save `.aab` file securely

### Keystore Management
- [ ] If EAS manages keystore, it's stored securely in cloud
- [ ] To download keystore: `eas credentials`
- [ ] Back up keystore securely (if you downloaded it)
- [ ] **NEVER lose your keystore** - you can't update your app without it

---

## Phase 6: Google Play Console Setup 🏪

### Create Account
- [ ] Go to https://play.google.com/console
- [ ] Pay $25 one-time registration fee
- [ ] Complete account verification
- [ ] Set up payment profile (for paid apps/in-app purchases)

### Create App
- [ ] Click "Create app"
- [ ] App name: "ACT"
- [ ] Default language: English (or your preference)
- [ ] App or game: App
- [ ] Free or paid: Free
- [ ] Accept declarations
- [ ] Click "Create app"

### Set Up Store Listing
- [ ] **App name:** ACT
- [ ] **Short description:** (80 characters max)
  - Example: "Track your finances easily with ACT - your personal budget manager"
- [ ] **Full description:** (4000 characters max)
  - Describe your app's features
  - Explain benefits
  - Include keywords for SEO
- [ ] **App icon:** Upload 512x512 PNG
- [ ] **Feature graphic:** Upload 1024x500 PNG (required)
- [ ] **Screenshots:** Upload 2-8 phone screenshots
  - Minimum 2 required
  - Size: 1080x1920 to 1080x2340 pixels
- [ ] **Promo video:** (optional) YouTube link
- [ ] **App category:** Finance or Productivity
- [ ] **Contact email:** Your support email
- [ ] **Privacy policy URL:** (required)
- [ ] Save store listing

### Complete App Content
- [ ] **App access:** 
  - Describe if login is required
  - Provide test credentials if needed
- [ ] **Ads:**
  - Declare if app contains ads (No for now)
- [ ] **Content rating:**
  - Complete questionnaire
  - Get rating (usually Everyone)
- [ ] **Target audience:**
  - Select age groups (18+ recommended for finance apps)
- [ ] **News apps:** No (unless applicable)
- [ ] **COVID-19 contact tracing:** No
- [ ] **Data safety:**
  - Describe what data you collect
  - Explain how data is used
  - Describe security practices
  - This is VERY important - be accurate

### Set Up Pricing & Distribution
- [ ] **Countries:** Select countries where app will be available
- [ ] **Pricing:** Free (or set price)
- [ ] **Contains ads:** No (unless you have ads)
- [ ] **In-app purchases:** No (unless you have them)
- [ ] **Content rating:** Verify it's set
- [ ] **Target audience:** Verify it's set
- [ ] **News app:** No
- [ ] **Government app:** No

---

## Phase 7: Internal Testing 🧪

### Create Internal Testing Release
- [ ] Go to "Testing" → "Internal testing"
- [ ] Click "Create new release"
- [ ] Upload your `.aab` file
- [ ] Release name: "1.0.0" (or your version)
- [ ] Release notes: Describe what's new
- [ ] Review release
- [ ] Click "Start rollout to Internal testing"

### Add Testers
- [ ] Create email list of testers (up to 100 for internal)
- [ ] Add testers to internal testing track
- [ ] Share testing link with testers
- [ ] Testers install via Play Store link

### Internal Testing Period
- [ ] Testers install and test app
- [ ] Collect feedback
- [ ] Fix any issues found
- [ ] Upload new version if needed (increment versionCode)
- [ ] Repeat until stable

---

## Phase 8: Closed Testing (Optional) 🔒

### Create Closed Testing Track
- [ ] Go to "Testing" → "Closed testing"
- [ ] Create new track (e.g., "Beta")
- [ ] Upload `.aab` file
- [ ] Add release notes
- [ ] Start rollout

### Add More Testers
- [ ] Add up to 1000 testers
- [ ] Can use Google Groups for easier management
- [ ] Share testing link
- [ ] Collect feedback

### Testing Period
- [ ] Monitor crash reports
- [ ] Check user feedback
- [ ] Fix issues
- [ ] Update app as needed

---

## Phase 9: Production Release 🎉

### Pre-Launch Checklist
- [ ] All testing is complete
- [ ] No critical bugs
- [ ] Store listing is complete
- [ ] Screenshots are uploaded
- [ ] Privacy policy is published
- [ ] Content rating is set
- [ ] Data safety is filled out
- [ ] All compliance requirements met

### Create Production Release
- [ ] Go to "Production" → "Countries/regions"
- [ ] Select countries for release
- [ ] Go to "Production" → "Releases"
- [ ] Click "Create new release"
- [ ] Upload production `.aab` file
- [ ] Add release notes
- [ ] Review release thoroughly
- [ ] Click "Start rollout to Production"

### Submit for Review
- [ ] Review all information one final time
- [ ] Submit app for review
- [ ] Wait for Google review (typically 1-7 days)
- [ ] Monitor email for review status

### After Approval
- [ ] App is live on Play Store! 🎉
- [ ] Share Play Store link
- [ ] Monitor reviews and ratings
- [ ] Respond to user feedback
- [ ] Monitor crash reports in Play Console

---

## Phase 10: Post-Launch 📊

### Monitor App Health
- [ ] Check Play Console daily for:
  - [ ] Crash reports
  - [ ] ANR (App Not Responding) reports
  - [ ] User reviews
  - [ ] Ratings
  - [ ] Installation stats

### Respond to Users
- [ ] Reply to user reviews (especially negative ones)
- [ ] Address reported issues
- [ ] Thank users for positive feedback
- [ ] Update app based on feedback

### Plan Updates
- [ ] Fix bugs reported by users
- [ ] Add requested features
- [ ] Improve performance
- [ ] Update dependencies regularly

### Release Updates
- [ ] Increment version number
- [ ] Increment versionCode
- [ ] Build new production AAB
- [ ] Upload to Play Console
- [ ] Add release notes
- [ ] Submit for review

---

## Automated Submission (Advanced) 🤖

### Set Up Service Account
- [ ] In Play Console: Setup → API access
- [ ] Create new service account
- [ ] Download JSON key as `google-play-service-account.json`
- [ ] Place in mobile directory (already in .gitignore)
- [ ] Grant "Release to testing tracks" permission

### Use EAS Submit
- [ ] Build: `eas build --platform android --profile production`
- [ ] Submit: `eas submit --platform android --latest`
- [ ] Or combined: `eas build --platform android --profile production --auto-submit`

---

## Quick Reference Commands 📝

```bash
# Setup
npm install -g eas-cli
eas login
eas build:configure

# Development
.\BUILD_ANDROID.ps1 -Profile development
eas build --platform android --profile development

# Preview
.\BUILD_ANDROID.ps1 -Profile preview
eas build --platform android --profile preview

# Production
.\BUILD_ANDROID.ps1 -Profile production
eas build --platform android --profile production

# Submit
eas submit --platform android --latest

# Utilities
eas build:list                    # View all builds
eas build:view [BUILD_ID]         # View specific build
eas credentials                   # Manage credentials
eas project:info                  # View project info
```

---

## Troubleshooting 🔧

### Build Fails
- [ ] Check build logs: `eas build:view [BUILD_ID]`
- [ ] Verify `google-services.json` is present (if using Firebase)
- [ ] Check all dependencies are compatible
- [ ] Try clearing cache: `eas build --clear-cache`

### App Crashes on Phone
- [ ] Check Play Console crash reports
- [ ] Test on different Android versions
- [ ] Check for missing permissions
- [ ] Verify API connectivity

### Play Store Rejection
- [ ] Read rejection reason carefully
- [ ] Fix issues mentioned
- [ ] Update store listing if needed
- [ ] Resubmit for review

---

## Important Notes ⚠️

1. **Never lose your keystore** - You can't update your app without it
2. **Test thoroughly** before production release
3. **Privacy policy is required** for Play Store
4. **Data safety section is critical** - Be accurate
5. **Respond to user reviews** - It improves ratings
6. **Monitor crash reports** - Fix issues quickly
7. **Keep dependencies updated** - Security and performance
8. **Increment versionCode** for every Play Store upload
9. **Test on multiple devices** if possible
10. **Back up your code** regularly

---

## Resources 📚

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Firebase Setup](./FIREBASE_SETUP.md)
- [Deployment Guide](./ANDROID_DEPLOYMENT_GUIDE.md)
- [Assets Guide](./ASSETS_GUIDE.md)

---

## Success! 🎉

When you've completed all phases:
- ✅ Your app is live on Google Play Store
- ✅ Users can download and use your app
- ✅ You can push updates easily
- ✅ You're monitoring app health
- ✅ You're responding to user feedback

**Congratulations on launching your app!** 🚀

---

**Current Status:** Phase 1 - Initial Setup
**Next Step:** Run `.\BUILD_ANDROID.ps1 -Profile setup`