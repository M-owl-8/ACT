# 🔔 Notifications Setup & Testing Guide

## Table of Contents
1. [How Notifications Work](#how-notifications-work)
2. [Setup Instructions](#setup-instructions)
3. [Testing Checklist](#testing-checklist)
4. [Troubleshooting](#troubleshooting)
5. [Backend Integration](#backend-integration)

---

## How Notifications Work

### **Two Types of Notifications**

#### **1. Email Notifications**
```
Triggered by: Backend events (expense alerts, goal completions, etc.)
Sent via: Email service (SMTP)
User receives: Email in inbox
Controlled by: emailNotificationsEnabled setting
```

**When emails are sent:**
```
✉️ Daily budget summary (if expense tracking)
✉️ Goal completion notification
✉️ Weekly financial report
✉️ Account alerts (unusual activity)
✉️ Reminder notifications (if used)
```

**Flow:**
```
Backend event occurs (e.g., "Goal completed!")
    ↓
Backend checks: User.emailNotificationsEnabled = true?
    ↓
If YES:
  ├─ Retrieves user email
  ├─ Generates email content
  ├─ Sends via email service
  └─ User receives in inbox

If NO:
  └─ Skips email (silent)
```

---

#### **2. Push Notifications**
```
Triggered by: Backend events
Sent via: Expo Push Notification Service
User receives: Popup/banner on device
Controlled by: pushNotificationsEnabled setting
Works on: Physical devices only (not emulator)
Requires: Network connection + Expo project config
```

**When push notifications are sent:**
```
🔔 Real-time budget alerts ("You spent $50 today!")
🔔 Goal achievements ("Goal completed! 🎉")
🔔 Reminder notifications ("Time for your weekly review")
🔔 System alerts ("Settings changed from another device")
🔔 Financial milestones ("You saved $1000!")
```

---

### **Notification Architecture**

```
┌──────────────────────────────────────────────────┐
│           NOTIFICATION FLOW                       │
└──────────────────────────────────────────────────┘

User Action in App
(e.g., complete goal)
         ↓
    ┌────────────────────────────────────┐
    │   Backend Process Event            │
    │   ✓ Save to database               │
    │   ✓ Trigger notifications          │
    └────────┬───────────────────────────┘
             ↓
        ┌────────────────────────────────────────┐
        │  Check Notification Settings            │
        ├────────────────────────────────────────┤
        │ emailNotificationsEnabled? YES → EMAIL  │
        │ pushNotificationsEnabled? YES → PUSH    │
        └────────┬──────────────────────┬─────────┘
                 ↓                      ↓
        ┌──────────────────┐   ┌──────────────────┐
        │  Send Email      │   │  Send Push       │
        │  (SMTP)          │   │  (Expo Service)  │
        └────────┬─────────┘   └────────┬─────────┘
                 ↓                      ↓
        ┌──────────────────┐   ┌──────────────────┐
        │ User's Inbox     │   │ Device Receives  │
        │ (email client)   │   │ Push Notification│
        └──────────────────┘   └────────┬─────────┘
                                        ↓
                              ┌──────────────────┐
                              │ Notification Bar │
                              │ (top of screen)  │
                              │ + Sound/Vibration│
                              │ + Badge Count    │
                              └──────────────────┘
```

---

## Setup Instructions

### **Step 1: Initialize Notifications in App.tsx**

```typescript
// app.tsx or App.tsx (root component)
import { initializeNotifications } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Initialize notifications on app start
    initializeNotifications();
  }, []);

  // ... rest of app
}
```

**What this does:**
```
✓ Requests notification permissions from OS
✓ Gets device's push token
✓ Creates Android notification channels
✓ Registers token with backend
✓ Sets up notification handlers
```

---

### **Step 2: Register After Login**

```typescript
// In your login handler (e.g., ProfileScreen or LoginScreen)
import { registerPushTokenAfterLogin } from './src/services/notificationService';

const handleLogin = async () => {
  try {
    // ... perform login
    const user = await login(credentials);
    
    // After successful login, register push token
    await registerPushTokenAfterLogin();
    
  } catch (error) {
    // handle error
  }
};
```

**Why this is important:**
```
Initial init happens BEFORE login (token = unauthenticated)
After login, we register the token with user account
Backend then knows: "This token belongs to this user"
Now backend can send personalized push notifications
```

---

### **Step 3: Configure Notification Handlers**

Already configured in `notificationService.ts` (lines 7-12):

```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show banner notification
    shouldPlaySound: true,      // Play notification sound
    shouldSetBadge: true,       // Update app icon badge
  }),
});
```

**What each setting does:**

| Setting | Effect |
|---------|--------|
| `shouldShowAlert: true` | Shows notification as banner at top |
| `shouldPlaySound: true` | Plays device notification sound |
| `shouldSetBadge: true` | Shows red badge on app icon (e.g., "3") |

---

### **Step 4: Listen for Notifications (Optional)**

For advanced features, add listeners:

```typescript
// In your main screen or App.tsx
import { notificationService } from '../services/notificationService';

useEffect(() => {
  // Listen for notifications when app is open
  const receivedSubscription = notificationService.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      // Handle notification while app is open
      // e.g., show custom alert, update UI
    }
  );

  // Listen for when user taps notification
  const responseSubscription = notificationService.addNotificationResponseListener(
    (response) => {
      console.log('User tapped notification:', response);
      // Navigate to relevant screen
      // e.g., if notification is about goals, go to GoalsScreen
      const { data } = response.notification.request.content;
      if (data.type === 'goal') {
        navigation.navigate('Motivation');
      }
    }
  );

  // Cleanup listeners on unmount
  return () => {
    notificationService.removeNotificationSubscription(receivedSubscription);
    notificationService.removeNotificationSubscription(responseSubscription);
  };
}, []);
```

---

### **Step 5: Configure Backend to Send Notifications**

In your FastAPI backend:

```python
# Backend: Send push notification example
from app.services.notification_service import send_push_notification

async def on_goal_completed(goal_id: int, user_id: int):
    """Send notification when goal is completed"""
    
    # Get user settings
    user = await db.get(User, user_id)
    
    # Check if push notifications enabled
    if not user.settings.push_notifications_enabled:
        return  # Skip if disabled
    
    # Send push notification
    await send_push_notification(
        user_id=user_id,
        title="Goal Completed! 🎉",
        body=f"You've completed your goal: {goal.title}",
        data={
            "type": "goal",
            "goal_id": goal_id,
            "action": "open_goals_screen"
        }
    )
```

---

## Testing Checklist

### **✅ Test 1: Permission Request**

**Scenario:** First time opening app
```
Steps:
1. Uninstall app completely
2. Clear app data
3. Reinstall app
4. Open app
5. Look for: "Allow notifications?" dialog

Expected:
✓ iOS: System dialog appears asking to allow notifications
✓ Android: System dialog appears asking to allow notifications
✓ User can tap "Allow" or "Don't Allow"
```

**Verification:**
```bash
# Check device logs
# iOS: Check settings → [App Name] → Notifications
# Android: Check settings → Apps → [App Name] → Notifications
```

---

### **✅ Test 2: Permission Persistence**

**Scenario:** Settings remembered across app restarts
```
Steps:
1. Go to Settings
2. Toggle "Push Notifications" ON
3. Close app completely
4. Restart app
5. Go back to Settings

Expected:
✓ Toggle should still be ON
✓ Setting persisted to local storage
✓ Synced to backend
```

---

### **✅ Test 3: Manual Push Notification**

**Scenario:** Test notification delivery on real device
```
Requirements:
✓ Physical device (not emulator)
✓ App installed via Expo or APK
✓ Push notifications ENABLED in settings

Steps:
1. Get push token from console logs:
   └─ Look for: "✅ Notifications initialized. Push token: ExponentPushToken[...]"

2. Send test notification via Expo Dashboard:
   ├─ Go to: expo.dev → Project → Notifications
   ├─ Select your device
   ├─ Enter title: "Test Notification"
   ├─ Enter body: "This is a test"
   └─ Send

3. Expected:
   ✓ Device receives notification
   ✓ Banner appears at top
   ✓ Sound plays (if not silent)
   ✓ Badge updates on app icon
   ✓ User can tap to open app
```

---

### **✅ Test 4: Disable and Re-enable**

**Scenario:** Toggle notifications on and off
```
Steps:
1. Settings → "Push Notifications" toggle ON
2. Wait for sync (2 seconds)
3. Send test push (via Expo Dashboard)
4. ✓ Device receives notification

5. Go back to Settings
6. Toggle "Push Notifications" OFF
7. Wait for sync
8. Send another test push
9. ✓ Device should NOT receive notification

10. Toggle ON again
11. Wait for sync
12. Send test push again
13. ✓ Device should receive notification again

Expected:
✓ Changes take effect immediately
✓ Backend respects the setting
```

---

### **✅ Test 5: Offline and Online**

**Scenario:** Settings sync when reconnecting
```
Steps:
1. Enable airplane mode
2. Go to Settings
3. Toggle "Push Notifications" OFF
4. Close app
5. Disable airplane mode
6. Reopen app
7. Go to Settings
8. ✓ Toggle should be OFF (synced from backend)

Additional:
9. Toggle back ON (while offline)
10. Enable airplane mode again
11. Close app
12. Disable airplane mode
13. Reopen app
14. Go to Settings
15. ✓ Toggle should be ON (synced from backend)
```

---

### **✅ Test 6: Email Notifications**

**Scenario:** Test email notification setting
```
Steps:
1. Settings → Toggle "Email Notifications" ON
2. Wait for sync
3. Trigger an event that sends email (e.g., goal completion)
4. ✓ Check your email inbox for notification

5. Go back to Settings
6. Toggle "Email Notifications" OFF
7. Wait for sync
8. Trigger another event
9. ✓ Should NOT receive email

Expected:
✓ Emails sent only when enabled
✓ Backend checks setting before sending
```

---

### **✅ Test 7: Notification Content**

**Scenario:** Ensure notification has correct data
```
Steps:
1. Implement notification response listener (from Step 4 above)
2. Send test notification
3. Tap notification
4. ✓ App navigates to correct screen
5. ✓ Data is preserved (e.g., goal_id)

Example data structure:
{
  "type": "goal",
  "goal_id": 123,
  "action": "open_goals_screen"
}
```

---

### **✅ Test 8: Badge Count**

**Scenario:** Verify app icon badge updates
```
Steps (iOS):
1. Send push notification
2. ✓ Red badge appears on app icon (shows "1")
3. Open app
4. ✓ Badge clears (resets to 0)

Steps (Android):
1. Send multiple notifications
2. ✓ Badge appears on app icon
3. Note: Android badge behavior varies by launcher
```

---

### **✅ Test 9: Sound and Vibration**

**Scenario:** Verify notification audio/haptic feedback
```
Steps:
1. Device set to normal mode (not silent)
2. Close app (put in background)
3. Send test push
4. ✓ Notification sound plays
5. ✓ Device vibrates (if vibration enabled)

6. Set device to SILENT/MUTE
7. Send another test push
8. ✓ No sound plays
9. ✓ Still shows banner/badge
```

---

### **✅ Test 10: Multiple Notifications**

**Scenario:** Send multiple notifications quickly
```
Steps:
1. Send 3 notifications rapidly
2. ✓ All received on device
3. ✓ Badge count shows "3"
4. ✓ Can scroll through notification center to see all

Expected:
✓ No notifications dropped
✓ Each has correct data
✓ All can be tapped individually
```

---

## Troubleshooting

### **Problem: Notification permissions dialog not appearing**

**Cause 1:** Already denied previously
```
Solution:
1. Go to device settings
2. Find app in app list
3. Go to Permissions → Notifications
4. Toggle ON

Then:
5. Force close app
6. Restart app
7. Notification permission should be available again
```

**Cause 2:** Using emulator
```
Note: 
Push notifications DON'T work on emulators/simulators
They only work on physical devices

Solution:
Use a real device for testing push notifications
```

**Cause 3:** App not requesting properly
```
Debug:
1. Check console for errors during init
2. Ensure initializeNotifications() is called at app start
3. Check that permissions are being requested:
   └─ requestPermissions() in notificationService.ts
```

---

### **Problem: App crashes when requesting permissions**

**Debug steps:**
```
1. Check if 'expo-notifications' is installed
   └─ npm list expo-notifications

2. Check if permissions configured in app.json:
   └─ "permissions": ["NOTIFICATIONS", ...]

3. Check device OS version
   └─ Android 6.0+ required
   └─ iOS 10.0+ required

4. Check console logs for specific error
   └─ Run: expo logs
```

---

### **Problem: Push token not registering**

**Debug steps:**
```
Step 1: Check if token obtained
├─ Look in console for: "✅ Notifications initialized. Push token: ExponentPushToken[...]"
└─ If not found: Permission denied or device issue

Step 2: Check if token sent to backend
├─ Look for: "📤 Registering push token with backend..."
├─ Look for: "✅ Push token registered with backend successfully"
└─ If not found: Backend not available or auth issue

Step 3: Verify backend endpoint
├─ Check: Backend has /push/register endpoint
├─ Check: User is authenticated when registering
└─ Check: Token format is correct

Step 4: Check network
├─ Ensure device has internet
├─ Ensure backend is reachable
└─ Check firewall/proxy settings
```

---

### **Problem: Notifications received but not appearing**

**Possible causes:**

1. **Device in Do Not Disturb:**
   ```
   Solution: Disable Do Not Disturb
   ```

2. **Volume is muted:**
   ```
   Solution: Unmute device (flip mute switch on side)
   Note: Badge/banner still appears, just no sound
   ```

3. **shouldShowAlert is false:**
   ```
   Check: setNotificationHandler settings
   Should have: shouldShowAlert: true
   ```

4. **App not processing notifications:**
   ```
   Check: Notification handler configured correctly
   Check: No errors in console
   Restart: Force close and reopen app
   ```

5. **Backend not sending:**
   ```
   Debug:
   1. Check backend logs
   2. Verify notification service is running
   3. Check if push_notifications_enabled = true
   4. Verify token is registered for user
   ```

---

### **Problem: Notifications work on Android but not iOS (or vice versa)**

**iOS-specific issues:**

```
1. Check: certificates configured in Expo
   └─ Must have valid APNs certificates

2. Check: Build includes notification entitlements
   └─ Expo should handle this automatically

3. Rebuild: May need to rebuild app for iOS
   └─ eas build -p ios
```

**Android-specific issues:**

```
1. Check: Google Play Services installed on device
   └─ Required for push notifications

2. Check: Firebase configured (if using FCM)
   └─ google-services.json present

3. Verify: Notification channels created
   └─ Channels: 'default', 'reminders', 'financial'
```

---

### **Problem: Notification settings not syncing**

**Debug steps:**
```
1. Check if toggle is being saved locally:
   └─ Close app → Reopen → Toggle should persist

2. If local persists but backend doesn't:
   ├─ Check network connectivity
   ├─ Check backend API endpoint: POST /users/settings
   ├─ Check user authentication
   └─ Check backend logs for errors

3. Force sync:
   └─ Go to Settings
   └─ Toggle notification ON
   └─ Wait 2 seconds
   └─ Check backend directly via API call
```

---

### **Problem: Too many notifications (spam)**

**Solution:**
```
1. Settings → Toggle "Push Notifications" OFF (or "Email Notifications")
2. Changes take effect within 2 seconds
3. Backend will respect this immediately

For developers:
└─ Add rate limiting on backend
└─ Prevent duplicate notifications
└─ Implement notification scheduling
```

---

### **Problem: Old notifications still appearing**

**Solution:**
```
1. Clear notification center on device
2. Clear app cache
3. Reboot device
4. All old notifications will be gone

For notifications stuck in queue:
1. Logout and login again
2. Or: Reinstall app
```

---

## Backend Integration

### **Required Backend Endpoints**

```python
# 1. Register push token
POST /push/register
Request:
{
  "token": "ExponentPushToken[...]",
  "device_type": "ios|android",
  "device_name": "iPhone-12"
}

Response:
{
  "success": true,
  "message": "Token registered"
}

---

# 2. Send push notification
POST /push/send
Request:
{
  "user_id": 123,
  "title": "Goal Completed!",
  "body": "You've completed your goal",
  "data": {"goal_id": 456}
}

Response:
{
  "success": true,
  "notification_id": "notif-123"
}

---

# 3. Get user notification settings
GET /users/settings
Response:
{
  "push_notifications_enabled": true,
  "email_notifications_enabled": true,
  ...
}

---

# 4. Update notification settings
POST /users/settings
Request:
{
  "push_notifications": true,
  "email_notifications": true,
  ...
}
```

### **Backend Service Example (Python/FastAPI)**

```python
# services/notification_service.py
import httpx
from app.models import User

class PushNotificationService:
    def __init__(self):
        self.expo_url = "https://exp.host/--/api/v2/push/send"
    
    async def send_push_notification(
        self,
        user: User,
        title: str,
        body: str,
        data: dict = None
    ):
        """Send push notification to user"""
        
        # Check if push notifications enabled
        if not user.settings.push_notifications_enabled:
            return False
        
        # Get user's push tokens
        tokens = [t.token for t in user.push_tokens]
        if not tokens:
            return False
        
        # Build notification payload
        messages = [
            {
                "to": token,
                "sound": "default",
                "title": title,
                "body": body,
                "data": data or {},
            }
            for token in tokens
        ]
        
        # Send to Expo
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.expo_url,
                json=messages
            )
        
        return response.status_code == 200
```

---

## 🎯 Quick Checklist

Before going live, ensure:

- ✅ `initializeNotifications()` called at app startup
- ✅ `registerPushTokenAfterLogin()` called after login
- ✅ Notification channels created for Android
- ✅ Backend endpoint `/push/register` exists
- ✅ Backend checks `push_notifications_enabled` before sending
- ✅ Backend checks `email_notifications_enabled` before sending
- ✅ Notification listeners registered (optional but recommended)
- ✅ App has notification permissions in manifest
- ✅ Expo project configured with APNs certificate (if iOS)
- ✅ All settings auto-save and sync
- ✅ Notifications tested on physical device
- ✅ Offline behavior verified
- ✅ Error handling in place
- ✅ Logs show success messages

---

## 📊 Summary

| Feature | Implementation | Testing | Notes |
|---------|-----------------|---------|-------|
| Push Notifications | ✅ Complete | See Test 3 | Physical device only |
| Email Notifications | ✅ Complete | See Test 6 | Backend must send emails |
| Permission Request | ✅ Complete | See Test 1 | Called at app start |
| Token Registration | ✅ Complete | See Test 2 | Called after login |
| Setting Persistence | ✅ Complete | See Test 2 | Auto-save working |
| Offline Support | ✅ Complete | See Test 5 | Syncs when online |
| Badge Count | ✅ Complete | See Test 8 | Auto-managed |
| Sound/Vibration | ✅ Complete | See Test 9 | Respects device settings |

Everything is ready to go! 🚀