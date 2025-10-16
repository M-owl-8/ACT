# 🔔 Mission 2: Firebase Cloud Messaging (FCM) - Complete Guide

## Overview
This guide will help you set up Firebase Cloud Messaging for push notifications in your ACT app.

---

## 📋 Prerequisites

Before starting:
- ✅ Mission 1 (Prebuild) completed
- ✅ Google account
- ✅ Physical Android device (FCM doesn't work on emulators reliably)
- ✅ Apple Developer account (for iOS - optional)

---

## 🔥 Part 1: Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: **ACT-Gen1**
4. Disable Google Analytics (optional for now)
5. Click "Create project"

### Step 2: Add Android App

1. In Firebase Console, click "Add app" → Android icon
2. Fill in details:
   - **Android package name:** `com.act.app`
   - **App nickname:** ACT Android
   - **Debug signing certificate SHA-1:** (optional for now)
3. Click "Register app"

### Step 3: Download google-services.json

1. Download `google-services.json` file
2. Save it to: `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\google-services.json`

**Important:** This file contains your Firebase credentials. Never commit it to public repositories!

### Step 4: Add iOS App (Optional - macOS only)

1. Click "Add app" → iOS icon
2. Fill in details:
   - **iOS bundle ID:** `com.act.app`
   - **App nickname:** ACT iOS
3. Download `GoogleService-Info.plist`
4. Save it to: `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\GoogleService-Info.plist`

---

## 🔧 Part 2: Configure Your App

### Step 1: Verify app.json Configuration

Your `app.json` is already configured (I did this for you):

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "POST_NOTIFICATIONS"
      ]
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "plugins": [
      "expo-secure-store",
      "expo-blur",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": []
        }
      ]
    ]
  }
}
```

### Step 2: Install Firebase Dependencies

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### Step 3: Rebuild Native Code

After adding Firebase files, rebuild:

```powershell
npx expo prebuild --clean
```

This will integrate Firebase into your native Android/iOS projects.

---

## 📱 Part 3: Implement Push Notifications

### Step 1: Initialize Notification Service

The notification service is already created at:
`apps/mobile/src/services/notificationService.ts`

### Step 2: Register for Push Notifications in App

Update your `App.tsx` or main entry point:

```typescript
import { useEffect } from 'react';
import { notificationService } from './src/services/notificationService';
import apiClient from './src/api/client';

function App() {
  useEffect(() => {
    // Register for push notifications
    const setupNotifications = async () => {
      try {
        // Request permissions and get token
        const token = await notificationService.registerForPushNotifications();
        
        if (token) {
          console.log('Push token:', token);
          
          // Register token with backend
          await apiClient.post('/push/register', {
            token,
            device_type: Platform.OS,
            device_name: Device.modelName || 'Unknown'
          });
          
          console.log('Push token registered with backend');
        }
      } catch (error) {
        console.error('Failed to setup notifications:', error);
      }
    };
    
    setupNotifications();
    
    // Listen for notifications
    const receivedSubscription = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );
    
    const responseSubscription = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        // Handle navigation based on notification data
      }
    );
    
    return () => {
      notificationService.removeNotificationSubscription(receivedSubscription);
      notificationService.removeNotificationSubscription(responseSubscription);
    };
  }, []);
  
  // ... rest of your app
}
```

### Step 3: Test Local Notifications

Add a test button to verify notifications work:

```typescript
import { notificationService } from './src/services/notificationService';

// In your component
const testNotification = async () => {
  await notificationService.presentNotification({
    title: 'Test Notification',
    body: 'This is a test notification from ACT!',
    data: { screen: 'Dashboard' }
  });
};

// Button
<Button title="Test Notification" onPress={testNotification} />
```

---

## 🔔 Part 4: Backend Integration

### Step 1: Install Firebase Admin SDK

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
pip install firebase-admin
```

### Step 2: Get Firebase Service Account Key

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click "Generate new private key"
4. Save as `firebase-service-account.json` in `apps/api/`

**Important:** Never commit this file! Add to `.gitignore`

### Step 3: Create FCM Service

Create `apps/api/services/fcm_service.py`:

```python
import firebase_admin
from firebase_admin import credentials, messaging
from typing import List, Dict, Any
import os

class FCMService:
    def __init__(self):
        # Initialize Firebase Admin SDK
        cred_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-service-account.json')
        
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
    
    def send_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Dict[str, Any] = None
    ) -> bool:
        """Send a push notification to a single device"""
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                token=token,
            )
            
            response = messaging.send(message)
            print(f'Successfully sent message: {response}')
            return True
            
        except Exception as e:
            print(f'Error sending notification: {e}')
            return False
    
    def send_multicast(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Dict[str, Any] = None
    ) -> Dict[str, int]:
        """Send a push notification to multiple devices"""
        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body,
                ),
                data=data or {},
                tokens=tokens,
            )
            
            response = messaging.send_multicast(message)
            print(f'Successfully sent {response.success_count} messages')
            print(f'Failed to send {response.failure_count} messages')
            
            return {
                'success': response.success_count,
                'failure': response.failure_count
            }
            
        except Exception as e:
            print(f'Error sending multicast: {e}')
            return {'success': 0, 'failure': len(tokens)}

# Singleton instance
fcm_service = FCMService()
```

### Step 4: Integrate with Reminders

Update `apps/api/routers/reminders.py` to send notifications:

```python
from services.fcm_service import fcm_service
from routers.push_notifications import get_active_tokens_for_user

# When creating a reminder
@router.post("/", response_model=ReminderResponse)
def create_reminder(
    data: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ... create reminder logic ...
    
    # Send push notification
    tokens = get_active_tokens_for_user(db, current_user.id)
    if tokens:
        fcm_service.send_multicast(
            tokens=tokens,
            title="Reminder Set",
            body=f"Reminder for {reminder.title} on {reminder.reminder_date}",
            data={
                "type": "reminder",
                "reminder_id": str(reminder.id),
                "screen": "Reminders"
            }
        )
    
    return reminder
```

---

## 🧪 Part 5: Testing

### Test 1: Local Notifications

1. Run the app on physical device
2. Tap "Test Notification" button
3. Verify notification appears

**Expected:** Notification shows immediately

### Test 2: Push Token Registration

1. Check app logs for push token
2. Verify token is sent to backend
3. Check database for push_tokens table entry

**Expected:** Token stored in database

### Test 3: Backend Push Notification

Use this test endpoint in `apps/api/routers/push_notifications.py`:

```python
@router.post("/test-send")
def test_send_notification(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Test endpoint to send a notification to current user"""
    from services.fcm_service import fcm_service
    
    tokens = get_active_tokens_for_user(db, current_user.id)
    
    if not tokens:
        raise HTTPException(
            status_code=400,
            detail="No active push tokens found"
        )
    
    result = fcm_service.send_multicast(
        tokens=tokens,
        title="Test from Backend",
        body="This is a test notification from ACT API!",
        data={"type": "test"}
    )
    
    return {
        "message": "Notification sent",
        "result": result
    }
```

Test with:
```bash
curl -X POST http://localhost:8000/push/test-send \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 4: Reminder Notifications

1. Create a reminder for 1 minute from now
2. Wait for reminder time
3. Verify notification appears

**Expected:** Notification appears at scheduled time

---

## 🐛 Troubleshooting

### Issue 1: google-services.json Not Found
**Solution:**
- Verify file is in `apps/mobile/` directory
- Run `npx expo prebuild --clean`
- Check `android/app/google-services.json` exists after prebuild

### Issue 2: Notifications Not Appearing
**Solution:**
- Check device notification permissions
- Verify app is in foreground/background
- Check Android notification channels are created
- Look for errors in logcat: `adb logcat | grep FCM`

### Issue 3: Token Registration Failed
**Solution:**
- Verify backend is running
- Check network connectivity
- Look for errors in Metro bundler
- Verify `/push/register` endpoint works

### Issue 4: Firebase Admin SDK Error
**Solution:**
- Verify `firebase-service-account.json` exists
- Check file permissions
- Verify Firebase project settings
- Ensure service account has proper permissions

### Issue 5: Notifications Work Locally But Not from Backend
**Solution:**
- Verify FCM service is initialized
- Check Firebase service account key
- Verify tokens are stored correctly in database
- Check backend logs for FCM errors

---

## ✅ Success Criteria

Mission 2 is complete when:

- ✅ Firebase project created
- ✅ `google-services.json` downloaded and placed
- ✅ App registers for push notifications
- ✅ Push token sent to backend
- ✅ Local notifications work
- ✅ Backend can send notifications
- ✅ Notifications appear on physical device
- ✅ Reminder notifications work
- ✅ Notification taps navigate correctly
- ✅ Multiple devices can receive notifications

---

## 📊 Architecture Overview

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         │ 1. Register for notifications
         │ 2. Get push token
         │
         ▼
┌─────────────────┐
│  Expo Push      │
│  Notifications  │
└────────┬────────┘
         │
         │ 3. Send token to backend
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│  FastAPI        │◄─────┤  PostgreSQL  │
│  Backend        │      │  (tokens)    │
└────────┬────────┘      └──────────────┘
         │
         │ 4. Send notification via FCM
         │
         ▼
┌─────────────────┐
│  Firebase       │
│  Cloud          │
│  Messaging      │
└────────┬────────┘
         │
         │ 5. Deliver notification
         │
         ▼
┌─────────────────┐
│  User's Device  │
│  (Notification) │
└─────────────────┘
```

---

## 🎯 Next Steps

After completing FCM setup:

1. **Test thoroughly** - Try all notification scenarios
2. **Implement reminder scheduling** - Use FCM for scheduled reminders
3. **Add notification preferences** - Let users customize notifications
4. **Monitor delivery rates** - Track notification success/failure
5. **Move to Mission 3** - Password reset email configuration

---

## 📚 Additional Resources

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Firebase](https://rnfirebase.io/)
- [FCM HTTP v1 API](https://firebase.google.com/docs/reference/fcm/rest/v1/projects.messages)

---

**Good luck with Mission 2! 🔔**

Push notifications will greatly enhance user engagement with your app!