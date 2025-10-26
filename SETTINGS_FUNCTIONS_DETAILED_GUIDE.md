# 📋 Settings Screen - Complete Function Guide

## Overview
The Settings Screen provides users with comprehensive control over their app experience through various preferences and notification options. All changes are **automatically saved locally and synced to the backend**.

---

## 🎯 Main Sections

### 1️⃣ **ACCOUNT DETAILS**

#### **Full Name Field**
```
What it does:
├─ Stores the user's display name
├─ Used throughout the app for personalization
├─ Shows in profile, reports, and other screens
└─ Auto-saves when text is entered
```

**How it works:**
- As you type, the value updates in real-time
- After 1 second of inactivity, it saves to local storage
- Then syncs to the backend server
- If sync fails, changes stay saved locally (offline-first)

**Code reference:** Lines 66-72 in SettingsScreen.tsx
```typescript
setFullName: async (name) => {
  set({ fullName: name });
  await get().syncToBackend();  // Saves locally + syncs
}
```

**Data flow:**
```
User types in field
    ↓
handleFieldChange() called
    ↓
setFullName() executed
    ↓
Saved to local storage IMMEDIATELY
    ↓
Backend sync triggered (1 sec debounce)
    ↓
Stored in database
```

---

#### **Email Field**
```
What it does:
├─ Shows the user's registered email address
├─ Read-only (cannot be changed)
└─ Used for password recovery & notifications
```

**Why it's read-only:**
- Email is the unique identifier for your account
- Changing it requires verification
- If you need to change email, use account recovery

**Visual Indicator:** Gray text appears below the field:
```
"Email cannot be changed"
```

---

### 2️⃣ **NOTIFICATION SETTINGS**

These settings control how you receive communications from the app.

#### **A. Email Notifications Toggle**

**What it does:**
```
✓ ON  → You receive emails about:
         • Financial summaries (daily/weekly)
         • Goal completions
         • Budget alerts
         • Important reminders
         • System notifications

✗ OFF → No emails are sent
```

**How the toggle works:**
```typescript
// Toggle switch (lines 92-102)
emailNotificationsEnabled  // Current state
    ↓
User taps toggle
    ↓
State flips: true ↔ false
    ↓
setEmailNotifications() called
    ↓
UI updates immediately (visual feedback)
    ↓
Change saved locally
    ↓
Backend syncs the preference
    ↓
Email service checks this setting before sending
```

**Visual States:**
- **Active (ON):** Black background, white knob on right
- **Inactive (OFF):** White background with border, gray knob on left

**Backend Connection:**
When email notifications are enabled:
```python
# Backend receives: { email_notifications: true }
# Then:
- Stores preference in user profile
- Email service reads this before sending
- If user disables, emails stop immediately
- Re-enabling resumes at next trigger
```

**Data saved to backend:**
```
POST /users/settings
{
  "email_notifications": true/false,
  ...other settings
}
```

---

#### **B. Push Notifications Toggle**

**What it does:**
```
✓ ON  → You receive app notifications:
         • Real-time alerts (expense over budget)
         • Goal achievements
         • Reminder notifications
         • System alerts
         • These appear as banners, badges, sounds

✗ OFF → App doesn't send push notifications
         (Email notifications still work independently)
```

**Technical Flow:**

**1. Initialization (First Time):**
```
App starts
  ↓
initializeNotifications() called (from App.tsx)
  ↓
requestPermissions()
  ├─ Shows OS dialog: "Allow notifications?"
  ├─ User taps YES → Permissions granted
  └─ User taps NO → Feature blocked
  ↓
registerForPushNotifications()
  ├─ Gets device's unique push token
  ├─ Stores locally for future use
  └─ Example token: "ExponentPushToken[abcd1234...]"
  ↓
Token registered with backend
  ├─ Sent to: POST /push/register
  ├─ Backend stores for this device
  └─ Now backend can send push notifications
```

**2. Toggling On/Off:**
```
User enables push notifications in Settings
  ↓
setPushNotifications(true) called
  ↓
Synced to backend
  ↓
Backend service reads setting
  ├─ If true: Includes device in push notifications
  └─ If false: Skips device from push notifications
```

**3. Receiving a Notification:**
```
Backend event occurs (e.g., budget exceeded)
  ↓
Backend checks: Is push enabled for this user?
  ↓
If YES:
  ├─ Calls Expo Push API with device token
  ├─ Message sent to user's device
  ├─ Device receives notification
  ├─ Shows as:
  │   ├─ Banner at top of screen
  │   ├─ Sound plays
  │   ├─ Vibration/haptic feedback
  │   └─ Badge count increases
  └─ User can tap to open relevant screen

If NO:
  └─ Notification skipped (but email might still send)
```

**Notification Channels (Android):**
The app creates 3 notification channels for Android:
```
1. Default Channel
   - Name: "Default"
   - Importance: MAX (highest priority)
   - Vibration: 250ms pause, 250ms vibrate x3
   - Light color: Purple

2. Reminders Channel
   - Name: "Reminders"
   - Importance: HIGH
   - Used for: Scheduled reminders
   - Has sound + vibration

3. Financial Updates Channel
   - Name: "Financial Updates"
   - Importance: DEFAULT
   - Used for: Budget alerts, goal updates
   - Less intrusive vibration
```

**Notification Handler Configuration:**
```typescript
// Lines 7-12 in notificationService.ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,      // Show as banner
    shouldPlaySound: true,      // Play sound
    shouldSetBadge: true,       // Update app badge
  }),
});
```

**How notifications work when received:**
```
Notification arrives → notificationService processes it
  ├─ Should show as alert? YES → Banner displays
  ├─ Should play sound? YES → Notification sound plays
  ├─ Should set badge? YES → Red badge shows "1" on app icon
  └─ Data included? YES → Can be used to navigate to relevant screen
```

---

### 3️⃣ **APP PREFERENCES**

#### **A. Theme Selection (Light/Dark Mode)**
```
What it does:
├─ Controls app appearance
├─ Light mode: White background, dark text
├─ Dark mode: Dark background, light text
└─ Auto mode: Follows system settings
```

**Current Implementation:**
- Code supports radio buttons for selection (lines 125-139)
- Theme state stored in settings.ts
- Can be extended to actually change colors throughout app

**How it stores:**
```typescript
setTheme: async (theme: 'light' | 'dark' | 'auto') => {
  set({ theme });
  await get().syncToBackend();  // Saves preference
}
```

---

#### **B. Font Size Control**
```
What it does:
├─ Adjusts text size throughout the app
├─ Range: 10px to 24px
├─ Current size shown: "Font Size (14px)"
└─ Two buttons: - (decrease) and + (increase)
```

**How it works:**

**Step-by-step:**
1. User taps **minus button** (-) → Font size decreases by 1
2. User taps **plus button** (+) → Font size increases by 1
3. Size clamped between 10 and 24 (can't go below 10 or above 24)
4. Visual slider shows relative position
5. Changes apply immediately to the display

**Code:**
```typescript
// Line 146: Decrease font size
setFontSize(fontSize - 1)

// Line 156: Increase font size
setFontSize(fontSize + 1)

// Clamping logic (store/settings.ts, line 81):
const clampedSize = Math.max(10, Math.min(24, size));
// Ensures: 10 ≤ size ≤ 24
```

**Visual Representation:**
```
Font Size (14px)

  [ - ]  ▬▬▬▬▓▓▓▬▬▬▬▬  [ + ]
  
  - Slider fill shows progress from 10→24
  - Thumb position indicates current size
  - Changes reflected immediately
```

**Auto-save process:**
```
User clicks + or -
    ↓
New size calculated (with clamping)
    ↓
UI updates immediately (user sees change)
    ↓
Saved to local storage (instant)
    ↓
After 1 sec delay, syncs to backend
    ↓
Stored in user preferences
```

---

### 4️⃣ **DATA BACKUP**

#### **A. Backup Now Button**
```
What it does:
├─ Creates a complete backup of your data
├─ Includes: Goals, expenses, income, settings
├─ Stored in: Cloud storage or backend
└─ Can be used for: Data recovery or device switching
```

**What gets backed up:**
```
User Data:
├─ All goals (active, completed, deleted)
├─ All expenses (with attachments)
├─ All income entries
├─ Bank connections
├─ Reminders & schedules
├─ Settings & preferences
└─ Account information
```

**How backup works:**
```
User taps "Backup Now"
    ↓
Collects all user data from local database
    ↓
Creates backup file/snapshot
    ↓
Encrypts for security
    ↓
Sends to backend
    ↓
Stored in secure cloud storage
    ↓
Timestamp recorded
    ↓
User sees success message
```

**Restoring from backup:**
```
User loses data or switches device
    ↓
Login to new device
    ↓
App detects no local data
    ↓
Offers: "Restore from backup?"
    ↓
User confirms
    ↓
App downloads backup from backend
    ↓
Decrypts data
    ↓
Restores to local database
    ↓
User sees all their data recovered
```

---

#### **B. Auto Backup Checkbox**
```
What it does:
├─ Enables automatic daily backups
├─ Runs in background (no user action needed)
├─ Schedules for: 2 AM (low battery impact)
└─ Only backs up if changes detected
```

**How Auto Backup works:**

**Setup Phase:**
```typescript
// Toggle in Settings (lines 172-183)
autoBackupEnabled ↔ false/true
    ↓
setAutoBackup(enabled)
    ↓
Saved to local storage + synced to backend
```

**Scheduled Backup Process:**
```
Daily at 2 AM (when device usually charging):
    ├─ Checks: Has data changed since last backup?
    ├─ If YES:
    │   ├─ Collects all changes
    │   ├─ Creates backup
    │   ├─ Uploads to backend
    │   ├─ Records timestamp
    │   └─ Runs silently (no notification)
    │
    └─ If NO:
        └─ Skips (no duplicate backups)
```

**Auto Backup Safeguards:**
```
✓ Only runs when device plugged in (saves battery)
✓ Only runs on WiFi (saves mobile data)
✓ Happens silently (no interruptions)
✓ Retries if network fails
✓ Keeps last 30 days of backups
✓ Can be disabled anytime
```

**Benefits:**
- ✅ Never manually save again
- ✅ Always have recent backup
- ✅ Device lost? Data still safe
- ✅ No performance impact
- ✅ Happens completely in background

---

## 🔐 PRIVACY SETTINGS (Not visible on current UI - Backend only)

These settings control your data privacy and are stored in the backend:

### **A. Data Sharing**
```
Current state: Enabled
├─ When ON: Anonymous financial data can be used for:
│   ├─ App analytics & improvements
│   ├─ Spending pattern research
│   ├─ Budget recommendations
│   └─ Financial trends (no personal info)
│
└─ When OFF: Your data never shared, privacy maximized
```

**How it works:**
```typescript
setDataSharing: async (enabled) => {
  set({ dataSharingEnabled: enabled });
  await get().syncToBackend();  // Sends to backend
}
```

**What's NOT shared:**
- ❌ Your name, email, passwords
- ❌ Specific transaction amounts
- ❌ Bank account details
- ❌ Personal information

**What IS anonymized:**
- ✓ Spending patterns
- ✓ Budget categories
- ✓ Trends (aggregated)
- ✓ Feature usage statistics

---

### **B. Usage Statistics**
```
Current state: Enabled
├─ When ON: Collects:
│   ├─ Which features you use
│   ├─ When you use the app
│   ├─ App crashes/errors
│   ├─ Performance metrics
│   └─ Helps improve app
│
└─ When OFF: No tracking, complete privacy
```

**How it works:**
```typescript
setUsageStats: async (enabled) => {
  set({ usageStatsEnabled: enabled });
  await get().syncToBackend();  // Stores preference
}
```

**What's tracked:**
```
✓ App crashes → Used to fix bugs
✓ Screen navigation → Improves UX
✓ Feature usage → Prioritizes development
✓ Performance data → Optimizes speed
✓ Error logs → Identifies issues

✗ NO personal data collected
✗ NO login credentials tracked
✗ NO financial information captured
```

---

## 🔄 AUTO-SAVE MECHANISM (How all changes persist)

### **The Complete Flow:**

```
Step 1: User Changes a Setting
├─ Example: Toggle email notifications ON
└─ UI updates immediately (instant feedback)

Step 2: handleFieldChange() Triggered
├─ Catches the change event
├─ Prevents errors with try/catch
└─ Calls the setter function

Step 3: Setter Executed (e.g., setEmailNotifications)
├─ Updates Zustand store immediately
├─ UI re-renders (responsive)
├─ Calls syncToBackend()
└─ Code: set({ emailNotificationsEnabled: true })

Step 4: Local Save (Instant - OFFLINE MODE)
├─ Saves to SQLite database locally
├─ Uses: saveToSecureStorage()
├─ Completes in <100ms
├─ ✅ App works offline from now on
└─ Data persists if app crashes

Step 5: Backend Sync (Debounced - 1 second)
├─ Waits 1 second for more changes
├─ If more changes: Resets timer
├─ After 1 sec silence: Syncs all changes
├─ Makes API call: POST /users/settings
└─ If fails: Retries with exponential backoff

Step 6: Retry Logic (If network fails)
├─ Attempt 1: Immediate
├─ Attempt 2: After 500ms
├─ Attempt 3: After 1000ms
├─ Attempt 4: After 2000ms
├─ If all fail: Change stays local, retries later
└─ When network returns: Auto-syncs

Step 7: Network Restoration (Offline → Online)
├─ syncService detects network restored
├─ Triggers: syncSettingsToBackend()
├─ All pending changes upload
├─ Automatic, no user action needed
└─ Seamless experience
```

---

## 📊 Data Model

```typescript
// Settings stored in store (settings.ts)
{
  // Account
  fullName: string;           // e.g., "John Doe"
  email: string;              // e.g., "john@example.com" (read-only)
  
  // Notifications
  emailNotificationsEnabled: boolean;  // true/false
  pushNotificationsEnabled: boolean;   // true/false
  
  // Display
  theme: 'light' | 'dark' | 'auto';    // Theme preference
  fontSize: number;                     // 10-24 pixels
  currency: string;                     // 'USD', 'EUR', etc
  language: string;                     // 'en', 'ja', etc
  
  // Privacy
  dataSharingEnabled: boolean;          // Share anonymized data?
  usageStatsEnabled: boolean;           // Track usage?
  
  // Backup
  autoBackupEnabled: boolean;           // Auto-backup on?
}
```

**Synced to backend as:**
```json
{
  "email_notifications": true,
  "push_notifications": false,
  "theme": "light",
  "font_size": 14,
  "currency": "USD",
  "language": "en",
  "data_sharing": true,
  "usage_stats": true,
  "auto_backup": false
}
```

---

## 🧪 Testing Settings Functions

### **Test 1: Email Notifications**
```
1. Go to Settings
2. Toggle "Email Notifications" ON
3. Close app completely
4. Restart app
5. Go back to Settings
6. ✓ Should be ON (persisted)
7. Go offline (airplane mode)
8. Toggle OFF
9. Close app
10. Go back online
11. Restart app
12. ✓ Should be OFF (synced to backend)
```

### **Test 2: Push Notifications**
```
1. Settings → Toggle push ON
2. Wait 5 seconds
3. In another browser/app, trigger a push event
4. ✓ Should receive notification
5. Tap notification → Should navigate to relevant screen
6. Toggle OFF in Settings
7. Trigger push event again
8. ✓ Should NOT receive notification
```

### **Test 3: Font Size**
```
1. Settings → Font size 14
2. Tap + button (increase)
3. ✓ Should change to 15px
4. Text should appear larger
5. Tap - button (decrease) 5 times
6. ✓ Should be 10px (minimum)
7. Tap + button 20 times
8. ✓ Should be 24px (maximum, not higher)
9. Close & restart app
10. ✓ Font size should remain at 24px
```

### **Test 4: Auto Backup**
```
1. Settings → Toggle Auto Backup ON
2. Wait for next 2 AM (or force trigger)
3. Check backend logs
4. ✓ Should see backup created
5. Toggle OFF
6. Wait for next scheduled time
7. ✓ No new backup should be created
```

### **Test 5: Offline Functionality**
```
1. Settings → Change font size to 20px
2. Enable airplane mode
3. Close app
4. Restart app
5. ✓ Font size should still be 20px (from local storage)
6. Go to settings
7. Change email notifications
8. Still offline
9. Close app
10. Disable airplane mode
11. Restart app
12. ✓ Change should sync to backend (automatic)
```

---

## 🚨 Troubleshooting

### **Settings not saving?**
```
Possible causes:
1. Local storage is full
   → Clear cache/app data
   
2. Backend is down
   → Changes save locally, will sync when back online
   
3. No write permissions
   → Check app permissions in device settings
   
4. Network timeout
   → Auto-retry happens (exponential backoff)
```

### **Notifications not appearing?**
```
Checklist:
1. ✓ Permissions granted? (Settings → Notifications)
2. ✓ Toggle is ON in app settings
3. ✓ Device not in Do Not Disturb
4. ✓ Connected to internet (for push)
5. ✓ App backgrounded/closed (for foreground)
6. ✓ Volume not muted
7. ✓ Not using emulator (push doesn't work)

If still not working:
→ Check backend logs for errors
→ Verify push token was registered
→ Re-register token (logout/login)
```

### **Font size not changing?**
```
Solution:
1. Ensure value is between 10-24
2. Check if clamping logic is working
3. Verify store update is triggering re-render
4. Clear app cache if stuck
```

---

## 📱 User Experience Flow

```
┌─────────────────────────────────────┐
│        User Opens Settings          │
└──────────────┬──────────────────────┘
               ↓
      ┌────────────────┐
      │ Load Settings  │
      └────────┬───────┘
               ↓
    ┌──────────────────────┐
    │ Display All Values   │
    │ (from local storage) │
    └────────┬─────────────┘
             ↓
    ┌────────────────────────────┐
    │  User Changes a Setting    │
    │  (e.g., font size +1)      │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Value Updated in UI        │
    │ (instant feedback)         │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Saved to Local Database    │
    │ (within milliseconds)      │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Debounce Timer Started     │
    │ (waits 1 second)           │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Backend Sync Triggered     │
    │ (if network available)     │
    └────────┬───────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Setting Stored on Server   │
    │ (now fully synced)         │
    └─────────────────────────────┘
```

---

## 🎯 Summary

| Function | Auto-Save | Offline Support | Backend Sync |
|----------|-----------|-----------------|--------------|
| Full Name | ✅ Yes | ✅ Yes | ✅ Yes |
| Email | ❌ Read-only | N/A | N/A |
| Email Notifications | ✅ Yes | ✅ Yes | ✅ Yes |
| Push Notifications | ✅ Yes | ✅ Yes | ✅ Yes |
| Font Size | ✅ Yes | ✅ Yes | ✅ Yes |
| Theme | ✅ Yes | ✅ Yes | ✅ Yes |
| Data Sharing | ✅ Yes | ✅ Yes | ✅ Yes |
| Usage Stats | ✅ Yes | ✅ Yes | ✅ Yes |
| Backup Now | ✅ Yes | ⏸️ Queued | ✅ Yes |
| Auto Backup | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔗 Related Files

```
Settings Implementation:
├─ src/screens/SettingsScreen.tsx        ← UI Component
├─ src/store/settings.ts                  ← State Management
├─ src/services/autoSaveService.ts        ← Save/Load Logic
├─ src/services/syncService.ts            ← Network Detection
├─ src/services/notificationService.ts    ← Push Notifications
└─ src/services/database.ts               ← Local Storage
```

This complete guide covers everything users need to know about the Settings functionality!