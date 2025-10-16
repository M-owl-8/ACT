# Android Manifest Merger Fix

## Issue Description
The build was failing with the following error:
```
Manifest merger failed: Attribute meta-data#com.google.firebase.messaging.default_notification_color@resource value=(@color/notification_icon_color) from AndroidManifest.xml:16:88-137
is also present at [:react-native-firebase_messaging] AndroidManifest.xml:46:13-44 value=(@color/white).
Suggestion: add 'tools:replace="android:resource"' to <meta-data> element at AndroidManifest.xml to override.
```

## Root Cause
Both the app's `AndroidManifest.xml` and the `react-native-firebase_messaging` library were defining the same Firebase notification meta-data attributes with different values, causing a conflict during the manifest merger process.

## Solution Applied

### 1. Added XML Tools Namespace
Added the `tools` namespace to the manifest root element:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  xmlns:tools="http://schemas.android.com/tools">
```

### 2. Added tools:replace Attribute
Added `tools:replace="android:resource"` to the conflicting meta-data elements:
```xml
<meta-data 
  android:name="com.google.firebase.messaging.default_notification_color" 
  android:resource="@color/notification_icon_color" 
  tools:replace="android:resource"/>
  
<meta-data 
  android:name="com.google.firebase.messaging.default_notification_icon" 
  android:resource="@drawable/notification_icon" 
  tools:replace="android:resource"/>
```

## Files Modified
- `android/app/src/main/AndroidManifest.xml`

## What This Fix Does
The `tools:replace="android:resource"` attribute tells the Android manifest merger to use the app's value instead of the library's value when there's a conflict. This allows you to override the default Firebase notification color and icon with your custom values.

## Verification Steps
1. Clean the build:
   ```powershell
   cd android
   .\gradlew clean
   ```

2. Build the app:
   ```powershell
   .\gradlew app:assembleDebug
   ```

3. Or run via Expo:
   ```powershell
   cd ..
   npx expo run:android
   ```

## Why This Happened
When you install `@react-native-firebase/messaging`, it includes its own `AndroidManifest.xml` with default notification settings. If your app also defines these settings (which is recommended for customization), you need to explicitly tell the build system which values to use.

## Future Reference
If you encounter similar manifest merger conflicts with other libraries:
1. Add the `tools` namespace if not present
2. Add `tools:replace="android:resource"` (or appropriate attribute) to the conflicting element
3. Clean and rebuild

## Related Configuration
The notification color is defined in:
- `android/app/src/main/res/values/colors.xml`
  ```xml
  <color name="notification_icon_color">#ffffff</color>
  ```

The notification icon should be placed in:
- `android/app/src/main/res/drawable/notification_icon.png`

## Status
✅ **FIXED** - Build should now complete successfully without manifest merger errors.