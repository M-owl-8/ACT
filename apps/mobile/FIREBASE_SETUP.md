# Firebase Setup Guide for ACT Android App

## 📋 Overview
This guide helps you set up Firebase Cloud Messaging (FCM) for push notifications in your ACT app.

## 🚀 Step-by-Step Setup

### Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Add project" or "Create a project"
   - Project name: `ACT` (or your preferred name)
   - Click "Continue"

3. **Google Analytics (Optional)**
   - You can disable this for now
   - Click "Continue"

4. **Create Project**
   - Click "Create project"
   - Wait for project creation (takes ~30 seconds)
   - Click "Continue" when done

### Step 2: Add Android App to Firebase

1. **Add Android App**
   - In Firebase Console, click the Android icon (or "Add app")
   - You'll see "Add Firebase to your Android app"

2. **Register App**
   - **Android package name:** `com.act.app` (MUST match exactly)
   - **App nickname (optional):** `ACT Android`
   - **Debug signing certificate SHA-1 (optional):** Leave blank for now
   - Click "Register app"

3. **Download google-services.json**
   - Click "Download google-services.json"
   - Save the file to: `C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\`
   - **IMPORTANT:** This file is already in .gitignore - do NOT commit it to git

4. **Add Firebase SDK**
   - Click "Next" (EAS Build handles this automatically)
   - Click "Next" again
   - Click "Continue to console"

### Step 3: Enable Cloud Messaging

1. **Go to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Navigate to Cloud Messaging**
   - Click on "Cloud Messaging" tab
   - You'll see "Cloud Messaging API (Legacy)"

3. **Enable Cloud Messaging API**
   - If you see "Cloud Messaging API (Legacy) - Disabled"
   - Click the three dots menu → "Manage API in Google Cloud Console"
   - Click "Enable" in Google Cloud Console
   - Return to Firebase Console

4. **Copy Server Key**
   - Under "Cloud Messaging API (Legacy)"
   - Copy the "Server key" - you'll need this for your backend API
   - Save it securely (you'll add it to your backend .env file)

### Step 4: Verify google-services.json

Open the downloaded `google-services.json` file and verify:

```json
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "your-project-id",
    "storage_bucket": "your-project-id.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:YOUR_PROJECT_NUMBER:android:...",
        "android_client_info": {
          "package_name": "com.act.app"  // ← Must be exactly this
        }
      }
    }
  ]
}
```

**Important:** The `package_name` must be `com.act.app`

### Step 5: Update Backend API (Optional)

If you want to send push notifications from your backend:

1. **Add Firebase Admin SDK to Backend**
   ```bash
   cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
   pip install firebase-admin
   ```

2. **Create Service Account Key**
   - In Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `firebase-admin-key.json` in your API directory
   - Add to `.gitignore`

3. **Update Backend .env**
   ```env
   FIREBASE_SERVER_KEY=your_server_key_from_step_3
   ```

### Step 6: Test Firebase Integration

1. **Rebuild Your App**
   ```bash
   cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   eas build --platform android --profile development
   ```

2. **Install on Phone**
   - Download and install the APK
   - Grant notification permissions when prompted

3. **Test Notifications**
   - In Firebase Console → Cloud Messaging
   - Click "Send your first message"
   - Enter notification title and text
   - Click "Send test message"
   - Enter your device token (you'll need to implement token retrieval in app)

## 📱 Implementing Push Notifications in App

### Step 1: Request Permissions

The app already has `expo-notifications` installed. Update your code to request permissions:

```typescript
// In App.tsx or a notification service file
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);
  
  return token;
}
```

### Step 2: Handle Notifications

```typescript
import { useEffect, useRef } from 'react';

export function useNotifications() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      // Send token to your backend
      // api.post('/users/push-token', { token });
    });

    // Listen for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification interactions
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // Navigate to specific screen based on notification data
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
```

### Step 3: Send Notifications from Backend

```python
# In your FastAPI backend
from firebase_admin import credentials, messaging
import firebase_admin

# Initialize Firebase Admin
cred = credentials.Certificate("firebase-admin-key.json")
firebase_admin.initialize_app(cred)

# Send notification
def send_push_notification(token: str, title: str, body: str, data: dict = None):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data or {},
        token=token,
    )
    
    response = messaging.send(message)
    return response
```

## 🔧 Troubleshooting

### google-services.json Not Found
- Ensure file is in: `C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\`
- File name must be exactly: `google-services.json`
- Rebuild after adding the file

### Package Name Mismatch
- Firebase package name must be: `com.act.app`
- Check `app.config.js`: `android.package` must match
- If wrong, create new Android app in Firebase with correct package name

### Notifications Not Received
1. Check notification permissions are granted
2. Verify Firebase Server Key is correct
3. Check device token is valid
4. Test with Firebase Console "Send test message"
5. Check app is not in battery optimization mode

### Build Fails After Adding Firebase
1. Ensure `google-services.json` is in correct location
2. Check file is valid JSON
3. Clear EAS cache: `eas build --clear-cache`
4. Try building again

## 📚 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [EAS Build with Firebase](https://docs.expo.dev/build-reference/android-builds/#using-firebase)

## ✅ Checklist

- [ ] Created Firebase project
- [ ] Added Android app with package name `com.act.app`
- [ ] Downloaded `google-services.json`
- [ ] Placed `google-services.json` in mobile directory
- [ ] Enabled Cloud Messaging API
- [ ] Copied Server Key for backend
- [ ] Rebuilt app with Firebase config
- [ ] Tested on physical device
- [ ] Implemented notification permissions
- [ ] Tested sending notifications

## 🎯 Next Steps

After completing Firebase setup:

1. **Test Notifications**
   - Build and install app on phone
   - Grant notification permissions
   - Send test notification from Firebase Console

2. **Integrate with Backend**
   - Add Firebase Admin SDK to backend
   - Store device tokens in database
   - Implement notification sending endpoints

3. **Production Considerations**
   - Set up notification channels for different types
   - Implement notification preferences in app
   - Add analytics for notification engagement
   - Handle notification deep linking

---

**Need Help?**
- Firebase Support: https://firebase.google.com/support
- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/