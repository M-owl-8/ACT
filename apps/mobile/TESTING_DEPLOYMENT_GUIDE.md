# 🧪 Testing & Deployment Guide

## Complete guide for testing, building, and deploying ACT Gen-1 to production

---

## 📋 Table of Contents

1. [Local Testing](#local-testing)
2. [Build Testing](#build-testing)
3. [Notification Testing](#notification-testing)
4. [Performance Testing](#performance-testing)
5. [Release Build](#release-build)
6. [Play Store Deployment](#play-store-deployment)
7. [Post-Deployment](#post-deployment)

---

## 🧪 Local Testing

### Development Build Testing

#### 1. Start Backend Server

```powershell
# Terminal 1: Backend
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Start Metro Bundler

```powershell
# Terminal 2: Metro
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm start
```

#### 3. Run on Emulator

```powershell
# Terminal 3: Android
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm run android
```

#### 4. Run on Physical Device

```powershell
# Make sure device is connected
adb devices

# Update .env with your computer's IP
# API_URL=http://YOUR_IP:8000

# Build and install
npm run android
```

### Testing Checklist

#### Authentication Flow
- [ ] Register new account
- [ ] Login with credentials
- [ ] Logout
- [ ] Forgot password flow
- [ ] Token refresh works
- [ ] Session persistence

#### Core Features
- [ ] Dashboard loads data
- [ ] Add income entry
- [ ] Add expense entry
- [ ] Edit entry
- [ ] Delete entry
- [ ] Categories CRUD
- [ ] Calendar view
- [ ] Reports generation

#### Books System
- [ ] Books list loads
- [ ] Book detail view
- [ ] Start reading
- [ ] Update progress
- [ ] Mark complete
- [ ] Statistics accurate

#### Reminders
- [ ] Create reminder
- [ ] Edit reminder
- [ ] Delete reminder
- [ ] Mark complete
- [ ] List view

#### UI/UX
- [ ] Light mode works
- [ ] Dark mode works
- [ ] Language switching (EN/RU/UZ)
- [ ] Animations smooth
- [ ] No UI glitches
- [ ] Responsive on different screen sizes

#### Error Handling
- [ ] Network errors handled
- [ ] API errors shown
- [ ] Validation errors clear
- [ ] Loading states display
- [ ] Empty states display

---

## 🏗️ Build Testing

### Debug Build

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
.\gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
.\gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Bundle Build (for Play Store)

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android
.\gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

### Build Verification

#### Check APK Signature

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android

# Verify signature
& "C:\Users\user\AppData\Local\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify --verbose app\build\outputs\apk\release\app-release.apk
```

**Expected output:**
```
Verifies
Verified using v1 scheme (JAR signing): true
Verified using v2 scheme (APK Signature Scheme v2): true
Verified using v3 scheme (APK Signature Scheme v3): true
```

#### Check APK Size

```powershell
# Get APK size
(Get-Item "app\build\outputs\apk\release\app-release.apk").Length / 1MB

# Should be: 30-50 MB (acceptable for React Native)
```

#### Analyze APK Contents

```powershell
# Extract APK info
& "C:\Users\user\AppData\Local\Android\Sdk\build-tools\34.0.0\aapt.bat" dump badging app\build\outputs\apk\release\app-release.apk
```

---

## 📲 Notification Testing

### Local Notifications

#### Test Immediate Notification

```typescript
// In app, run this code (e.g., in Settings screen)
import { scheduleNotification } from '../services/notificationService';

await scheduleNotification({
  title: 'Test Notification',
  body: 'This is a test',
  data: { test: 'true' },
  trigger: null, // Immediate
});
```

#### Test Scheduled Notification

```typescript
// Schedule for 1 minute from now
await scheduleNotification({
  title: 'Scheduled Test',
  body: 'This should appear in 1 minute',
  data: { test: 'true' },
  trigger: {
    seconds: 60,
  },
});
```

### Push Notifications (FCM)

#### Test from Firebase Console

1. Go to Firebase Console
2. Select your project
3. Click "Cloud Messaging"
4. Click "Send your first message"
5. Fill in:
   - Title: "Test from Firebase"
   - Text: "This is a test push notification"
6. Click "Send test message"
7. Add your FCM token (from app Settings screen)
8. Click "Test"

#### Test from Backend

```python
# In backend, create test endpoint
from services.fcm_service import send_push_notification

@router.post("/test-push")
async def test_push(token: str):
    success = await send_push_notification(
        token=token,
        title="Test from Backend",
        body="This is a test from the API",
        data={"test": "true"}
    )
    return {"success": success}
```

### Notification Checklist

- [ ] Permission requested on first launch
- [ ] Permission granted
- [ ] Token registered in backend
- [ ] Local notifications appear
- [ ] Push notifications appear
- [ ] Notification sound plays
- [ ] Notification icon displays
- [ ] Tapping notification opens app
- [ ] Notification data passed correctly
- [ ] Badge count updates (iOS)
- [ ] Notification channels work (Android)

---

## ⚡ Performance Testing

### Metrics to Monitor

#### App Launch Time
- **Target:** < 3 seconds
- **Measure:** Time from tap to interactive

#### Screen Load Time
- **Target:** < 1 second
- **Measure:** Time from navigation to content display

#### API Response Time
- **Target:** < 2 seconds
- **Measure:** Time from request to response

#### Memory Usage
- **Target:** < 200 MB
- **Measure:** Check in Android Studio Profiler

#### Battery Usage
- **Target:** < 5% per hour of active use
- **Measure:** Check in Android Settings → Battery

### Performance Testing Tools

#### React Native Performance Monitor

```typescript
// Enable in development
import { PerformanceObserver } from 'react-native';

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure'] });
```

#### Android Studio Profiler

1. Open Android Studio
2. Run app on device
3. Click "Profiler" tab at bottom
4. Monitor:
   - CPU usage
   - Memory usage
   - Network activity
   - Energy usage

#### Flipper (React Native Debugger)

```powershell
# Install Flipper
choco install flipper

# Run Flipper
flipper
```

Features:
- Network inspector
- Layout inspector
- Logs viewer
- Crash reporter
- Performance monitor

---

## 📦 Release Build

### Pre-Release Checklist

#### Code Quality
- [ ] No console.log statements (or use __DEV__ check)
- [ ] No TODO comments
- [ ] No commented-out code
- [ ] All TypeScript errors fixed
- [ ] All ESLint warnings fixed

#### Configuration
- [ ] Version number updated in app.json
- [ ] Version code incremented
- [ ] API_URL points to production
- [ ] Sentry DSN configured
- [ ] Firebase configured
- [ ] Keystore configured

#### Testing
- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Notifications work
- [ ] Crash reporting works

### Build Release APK

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Clean previous builds
cd android
.\gradlew clean
cd ..

# Build release APK
cd android
.\gradlew assembleRelease --no-daemon --stacktrace
cd ..

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

### Build Release AAB (for Play Store)

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android

# Build release bundle
.\gradlew bundleRelease --no-daemon --stacktrace

# AAB location
# android/app/build/outputs/bundle/release/app-release.aab
```

### Post-Build Verification

```powershell
# Verify APK signature
& "C:\Users\user\AppData\Local\Android\Sdk\build-tools\34.0.0\apksigner.bat" verify --verbose app\build\outputs\apk\release\app-release.apk

# Check APK size
(Get-Item "app\build\outputs\apk\release\app-release.apk").Length / 1MB

# Install on device for final test
adb install -r app\build\outputs\apk\release\app-release.apk
```

---

## 🚀 Play Store Deployment

### Prerequisites

- [ ] Google Play Developer account ($25 one-time fee)
- [ ] Release AAB built and tested
- [ ] App icons and screenshots ready
- [ ] Privacy policy URL
- [ ] App description written

### Step 1: Create App in Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - App name: "ACT Gen-1"
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free
4. Accept declarations
5. Click "Create app"

### Step 2: Set Up App Content

#### App Access
- Select "All functionality is available without restrictions"

#### Ads
- Select "No, my app does not contain ads"

#### Content Rating
1. Click "Start questionnaire"
2. Select category: "Utility, Productivity, Communication, or Other"
3. Answer questions honestly
4. Submit for rating

#### Target Audience
- Select age groups: 18+
- Click "Next" and "Save"

#### Privacy Policy
- Enter your privacy policy URL
- Click "Save"

### Step 3: Store Listing

#### App Details
- **App name:** ACT Gen-1
- **Short description:** (80 chars max)
  ```
  Personal finance tracker with Japanese-inspired design. Track income, expenses, and goals.
  ```
- **Full description:** (4000 chars max)
  ```
  ACT Gen-1 is a beautiful personal finance management app with a unique Japanese-inspired design.

  KEY FEATURES:
  • Track income and expenses
  • Categorize transactions
  • Set financial goals
  • View detailed reports
  • Calendar view of transactions
  • Multi-language support (English, Russian, Uzbek)
  • Dark mode support
  • Push notifications for reminders
  • Personal finance books library
  • Motivational quotes

  BEAUTIFUL DESIGN:
  • Japanese-inspired UI
  • Smooth animations
  • Intuitive navigation
  • Clean and modern interface

  PRIVACY & SECURITY:
  • Your data is encrypted
  • Secure authentication
  • No ads
  • No data selling

  Start your financial journey with ACT Gen-1 today!
  ```

#### Graphics
- **App icon:** 512x512 PNG (from assets/icon.png)
- **Feature graphic:** 1024x500 PNG (create in Canva/Figma)
- **Phone screenshots:** At least 2, up to 8 (1080x1920 or similar)
  - Take screenshots of:
    - Login screen
    - Dashboard
    - Add entry screen
    - Reports screen
    - Books screen
    - Settings screen

#### Categorization
- **App category:** Finance
- **Tags:** finance, budget, expense tracker, money management

#### Contact Details
- **Email:** your-email@example.com
- **Phone:** (optional)
- **Website:** (optional)

### Step 4: Production Release

#### Create Release

1. Go to "Production" in left menu
2. Click "Create new release"
3. Upload AAB:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```
4. Release name: "1.0.0" (matches app version)
5. Release notes:
   ```
   Initial release of ACT Gen-1

   Features:
   • Income and expense tracking
   • Financial goals
   • Reports and analytics
   • Books library
   • Push notifications
   • Multi-language support
   • Dark mode
   ```

#### Review and Rollout

1. Click "Review release"
2. Review all information
3. Click "Start rollout to Production"
4. Confirm rollout

### Step 5: Wait for Review

- **Review time:** 1-7 days (usually 1-3 days)
- **Status:** Check in Play Console
- **Notifications:** You'll receive email updates

### Step 6: After Approval

- App will be live on Play Store
- Users can search and download
- Monitor reviews and ratings
- Respond to user feedback

---

## 📊 Post-Deployment

### Monitoring

#### Sentry Dashboard
- Check for crashes: https://sentry.io
- Monitor error rates
- Fix critical issues immediately

#### Firebase Analytics
- Track user engagement
- Monitor retention rates
- Analyze user flows

#### Play Console
- Check crash reports
- Monitor ANR (App Not Responding) rates
- Review user feedback
- Track installs and uninstalls

### Metrics to Track

#### User Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Retention rate (Day 1, Day 7, Day 30)
- Session length
- Session frequency

#### Technical Metrics
- Crash-free rate (target: > 99%)
- ANR rate (target: < 0.5%)
- App start time (target: < 3s)
- API response time (target: < 2s)

#### Business Metrics
- New installs per day
- Uninstall rate
- User ratings (target: > 4.0)
- Review sentiment

### Update Strategy

#### Version Numbering
- **Major:** 1.0.0 → 2.0.0 (breaking changes)
- **Minor:** 1.0.0 → 1.1.0 (new features)
- **Patch:** 1.0.0 → 1.0.1 (bug fixes)

#### Release Frequency
- **Patch releases:** As needed (critical bugs)
- **Minor releases:** Every 2-4 weeks
- **Major releases:** Every 3-6 months

#### Update Process
1. Increment version in app.json
2. Update version code (must be higher than previous)
3. Build new AAB
4. Test thoroughly
5. Upload to Play Console
6. Write release notes
7. Rollout gradually (10% → 50% → 100%)

### User Support

#### Respond to Reviews
- Respond within 24-48 hours
- Be professional and helpful
- Thank users for positive reviews
- Address concerns in negative reviews
- Offer solutions or ask for more info

#### Bug Reports
- Create issue tracking system (GitHub Issues, Jira, etc.)
- Prioritize by severity:
  - **Critical:** Crashes, data loss (fix immediately)
  - **High:** Major features broken (fix within 1 week)
  - **Medium:** Minor issues (fix in next release)
  - **Low:** Cosmetic issues (fix when convenient)

#### Feature Requests
- Collect and categorize
- Prioritize by user demand
- Plan for future releases
- Communicate roadmap to users

---

## 🔧 Troubleshooting

### Build Issues

**Problem: Gradle build fails**
```powershell
# Clean and rebuild
cd android
.\gradlew clean
.\gradlew assembleRelease --stacktrace
```

**Problem: Keystore error**
- Verify keystore exists: `android/app/act-release.keystore`
- Check password in `gradle.properties`
- Ensure keystore not corrupted

**Problem: Out of memory**
```powershell
# Increase Gradle memory
# Edit android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Deployment Issues

**Problem: Play Console rejects AAB**
- Check version code is higher than previous
- Verify AAB is signed correctly
- Ensure target SDK is up to date

**Problem: App crashes on some devices**
- Check Sentry for crash reports
- Test on multiple Android versions
- Check for device-specific issues

**Problem: High uninstall rate**
- Check crash-free rate
- Review user feedback
- Analyze user flows
- Improve onboarding

---

## ✅ Final Checklist

### Before First Release
- [ ] All features tested
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] Keystore backed up (CRITICAL!)
- [ ] Sentry configured
- [ ] Firebase configured
- [ ] Privacy policy created
- [ ] App icons finalized
- [ ] Screenshots taken
- [ ] Store listing written
- [ ] Release AAB built
- [ ] AAB tested on multiple devices

### Before Each Update
- [ ] Version number incremented
- [ ] Version code incremented
- [ ] Changelog written
- [ ] New features tested
- [ ] Regression testing done
- [ ] Performance verified
- [ ] Release notes written
- [ ] AAB built and tested

---

## 📚 Resources

### Documentation
- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev
- Firebase: https://firebase.google.com/docs
- Sentry: https://docs.sentry.io
- Play Console: https://support.google.com/googleplay/android-developer

### Tools
- Android Studio: https://developer.android.com/studio
- Flipper: https://fbflipper.com
- Sentry: https://sentry.io
- Firebase Console: https://console.firebase.google.com
- Play Console: https://play.google.com/console

### Community
- React Native Discord: https://discord.gg/react-native
- Stack Overflow: https://stackoverflow.com/questions/tagged/react-native
- Reddit: https://reddit.com/r/reactnative

---

**Good luck with your deployment! 🚀**

Remember: Test thoroughly, monitor closely, and iterate quickly!