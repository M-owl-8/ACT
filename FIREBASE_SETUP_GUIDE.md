# 🔥 Firebase Setup Guide for ACT Gen-1

This guide will help you set up Firebase for push notifications and analytics.

---

## 📋 Prerequisites

- Google account
- Android package name: `com.act.app`
- 15-20 minutes

---

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com
   - Click "Add project" or "Create a project"

2. **Configure project**:
   - **Project name**: `ACT Gen-1` (or your preferred name)
   - Click "Continue"
   
3. **Google Analytics** (optional but recommended):
   - Enable Google Analytics: **Yes**
   - Click "Continue"
   
4. **Analytics account**:
   - Select "Default Account for Firebase" or create new
   - Click "Create project"
   
5. **Wait for project creation** (30-60 seconds)

---

### Step 2: Add Android App

1. **In Firebase Console**:
   - Click the Android icon (🤖) or "Add app" → "Android"

2. **Register app**:
   - **Android package name**: `com.act.app`
     - ⚠️ **IMPORTANT**: This MUST match your `app.json` package name
     - Cannot be changed later!
   - **App nickname** (optional): `ACT Mobile`
   - **Debug signing certificate SHA-1** (optional for now): Leave blank
   - Click "Register app"

---

### Step 3: Download Configuration File

1. **Download `google-services.json`**:
   - Click "Download google-services.json"
   - Save the file

2. **Move file to your project**:
   ```powershell
   # Move to mobile app root
   Move-Item -Path "C:\Users\YourName\Downloads\google-services.json" -Destination "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\google-services.json"
   ```

3. **Verify file location**:
   ```powershell
   Test-Path "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\google-services.json"
   # Should return: True
   ```

4. **Click "Next"** in Firebase Console

---

### Step 4: Enable Firebase Cloud Messaging (FCM)

1. **In Firebase Console**:
   - Go to "Project settings" (⚙️ icon)
   - Click "Cloud Messaging" tab

2. **Enable Cloud Messaging API**:
   - If you see "Cloud Messaging API (Legacy) disabled"
   - Click "Manage API in Google Cloud Console"
   - Click "Enable" for "Firebase Cloud Messaging API"

3. **Note your Server Key** (for backend):
   - Copy "Server key" (you'll need this later)

---

### Step 5: Configure Expo App

Your `app.json` already has the Firebase plugin configured:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

✅ No changes needed!

---

### Step 6: Test Firebase Integration

1. **Rebuild your app** (required after adding google-services.json):
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   npx expo prebuild --clean
   ```

2. **Run on device**:
   ```powershell
   npx expo run:android
   ```

3. **Check logs for Firebase initialization**:
   - Look for: "Firebase initialized successfully"
   - Or check logcat:
   ```powershell
   adb logcat | Select-String "Firebase"
   ```

---

### Step 7: Test Push Notifications

#### Method 1: From Firebase Console (Easiest)

1. **Go to Firebase Console**:
   - Navigate to "Engage" → "Messaging"
   - Click "Create your first campaign"
   - Select "Firebase Notification messages"

2. **Create notification**:
   - **Title**: "Test Notification"
   - **Text**: "Hello from ACT Gen-1!"
   - Click "Next"

3. **Target**:
   - Select your app: `com.act.app`
   - Click "Next"

4. **Schedule**:
   - Select "Now"
   - Click "Next"

5. **Review and publish**:
   - Click "Publish"

6. **Check your device**:
   - You should receive a notification!

#### Method 2: From Your Backend (Advanced)

1. **Install Firebase Admin SDK** in backend:
   ```bash
   pip install firebase-admin
   ```

2. **Get service account key**:
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-service-account.json`

3. **Add to backend** (`apps/api/firebase_service.py`):
   ```python
   import firebase_admin
   from firebase_admin import credentials, messaging

   cred = credentials.Certificate("firebase-service-account.json")
   firebase_admin.initialize_app(cred)

   def send_push_notification(token: str, title: str, body: str):
       message = messaging.Message(
           notification=messaging.Notification(
               title=title,
               body=body,
           ),
           token=token,
       )
       response = messaging.send(message)
       return response
   ```

4. **Test from backend**:
   ```python
   # Get device token from mobile app
   # Then send notification
   send_push_notification(
       token="device_token_here",
       title="Test",
       body="Hello from backend!"
   )
   ```

---

### Step 8: Configure Analytics (Optional)

1. **Firebase Console**:
   - Go to "Analytics" → "Dashboard"
   - You'll see analytics data after app usage

2. **Track custom events** (already configured in your app):
   ```typescript
   // In your mobile app
   import * as Analytics from 'expo-firebase-analytics';

   // Track events
   await Analytics.logEvent('user_login', {
     method: 'email',
   });

   await Analytics.logEvent('entry_added', {
     type: 'income',
     amount: 1000,
   });
   ```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `google-services.json` exists in `apps/mobile/`
- [ ] File is NOT in `.gitignore` (it's safe to commit)
- [ ] App builds without errors
- [ ] Firebase initialization logs appear
- [ ] Test notification received on device
- [ ] Analytics dashboard shows app activity

---

## 🔧 Troubleshooting

### Issue: "google-services.json not found"

**Solution**:
```powershell
# Verify file exists
Test-Path "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\google-services.json"

# If false, download again from Firebase Console
```

### Issue: "Package name mismatch"

**Error**: `Package name 'com.act.app' does not match...`

**Solution**:
1. Check `app.json`:
   ```json
   "android": {
     "package": "com.act.app"
   }
   ```
2. Must match Firebase project package name
3. If different, create new Firebase app with correct package

### Issue: "Notifications not received"

**Checklist**:
1. ✅ App has notification permissions
2. ✅ App is in foreground/background (not killed)
3. ✅ Device has internet connection
4. ✅ FCM is enabled in Firebase Console
5. ✅ `google-services.json` is correct

**Test permissions**:
```typescript
import * as Notifications from 'expo-notifications';

const { status } = await Notifications.getPermissionsAsync();
console.log('Notification permission:', status);

if (status !== 'granted') {
  await Notifications.requestPermissionsAsync();
}
```

### Issue: "Firebase initialization failed"

**Solution**:
1. Clean and rebuild:
   ```powershell
   cd apps\mobile
   npx expo prebuild --clean
   npx expo run:android
   ```

2. Check `google-services.json` format:
   - Must be valid JSON
   - Must have `project_info`, `client`, etc.

3. Verify package name matches

---

## 🔒 Security Best Practices

### 1. Protect Server Key
- **Never** commit Firebase server key to Git
- Store in environment variables
- Use Firebase Admin SDK instead of server key when possible

### 2. Restrict API Keys
1. Go to Google Cloud Console
2. Navigate to "APIs & Services" → "Credentials"
3. Find your Firebase API key
4. Click "Edit"
5. Under "Application restrictions":
   - Select "Android apps"
   - Add your package name and SHA-1

### 3. Set up App Check (Advanced)
1. Firebase Console → "Build" → "App Check"
2. Register your app
3. Protects backend from abuse

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **User Engagement**:
   - Daily Active Users (DAU)
   - Session duration
   - Screen views

2. **Feature Usage**:
   - Entries added (income/expense)
   - Reports generated
   - Exports created
   - Reminders set

3. **Retention**:
   - 1-day retention
   - 7-day retention
   - 30-day retention

### Custom Events to Log

```typescript
// User actions
Analytics.logEvent('user_registered');
Analytics.logEvent('user_logged_in');

// Feature usage
Analytics.logEvent('entry_added', { type: 'income', amount: 1000 });
Analytics.logEvent('report_generated', { period: '30days' });
Analytics.logEvent('data_exported', { format: 'csv' });

// Errors
Analytics.logEvent('api_error', { endpoint: '/entries', status: 500 });
```

---

## 🎉 Success!

Once Firebase is set up:
- ✅ Push notifications work
- ✅ Analytics tracking active
- ✅ Crash reporting enabled (if using Crashlytics)
- ✅ Ready for production

**Next Steps**:
1. Test notifications thoroughly
2. Set up notification triggers in backend
3. Configure analytics events
4. Review `PRODUCTION_READINESS_CHECKLIST.md`

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Firebase Console logs
2. Check mobile app logs: `npx expo start`
3. Check Android logs: `adb logcat`
4. Review Firebase status: https://status.firebase.google.com