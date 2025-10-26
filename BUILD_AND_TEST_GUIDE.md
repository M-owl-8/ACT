# 🚀 ACT App - Build & Test Guide

## Current Status
✅ EAS Preview APK build in progress...

---

## After Build Completes - Testing Checklist

### **Option A: Test on Physical Device**

#### Via USB Cable:
1. Connect Android device via USB
2. Enable Developer Mode (tap Build Number 7x in Settings)
3. Enable USB Debugging
4. **Option 1**: Download APK from EAS dashboard and install:
   ```powershell
   adb install -r "C:\path\to\downloaded.apk"
   ```
5. **Option 2**: Use EAS direct install:
   ```powershell
   eas build --platform android --profile preview --device
   ```

#### Via Email/Cloud:
1. Share APK link from EAS build
2. Download on device
3. Open APK file to install (may need to allow "Unknown sources")

### **Option B: Test on Android Emulator**

1. Open Android Studio
2. Launch Android Emulator
3. Download APK from EAS dashboard
4. Drag & drop APK into emulator to install
5. Or use adb:
   ```powershell
   adb install -r "C:\path\to\downloaded.apk"
   ```

---

## Testing Checklist

After installing, test these critical features:

### ✅ **Core Functionality**
- [ ] App launches without crashes
- [ ] Login screen appears
- [ ] Login with test account works
- [ ] Authentication succeeds (no 422 errors)
- [ ] Dashboard/Home screen loads

### ✅ **API Integration**
- [ ] Add new entry (income/expense)
- [ ] Entries save to backend
- [ ] Entries display in list
- [ ] Edit entry works
- [ ] Delete entry works

### ✅ **Notifications**
- [ ] Push notifications enabled
- [ ] Test notification appears (check Firebase)
- [ ] Tapping notification opens app

### ✅ **Settings**
- [ ] Language switching works
- [ ] Theme switching works (if available)
- [ ] Settings persist after app restart

### ✅ **Navigation**
- [ ] All bottom tabs accessible
- [ ] Back button works correctly
- [ ] No white screens or freezes

### ✅ **Performance**
- [ ] App responds quickly
- [ ] No noticeable lag
- [ ] Memory usage reasonable
- [ ] Battery drain acceptable

### ✅ **Edge Cases**
- [ ] App works offline (loads cached data)
- [ ] App recovers when internet returns
- [ ] Logout works correctly
- [ ] Password reset flow works

---

## Build Profiles Explained

| Profile | Use Case | Output |
|---------|----------|--------|
| **preview** | Testing before production | APK (for device testing) |
| **production** | Google Play Store | AAB (for Play Store) |
| **development** | Dev tools included | APK (with debug features) |

---

## Troubleshooting

### Build Failed?
```powershell
# Check build logs
eas build:list
eas build:view {build-id}

# Clean and retry
eas build --platform android --profile preview --wait --clear-cache
```

### APK Won't Install?
- Ensure Android 7.0+ (API 24+)
- Uninstall old version first: `adb uninstall com.act.app`
- Try: `adb install -r app.apk`

### API Connection Failed?
- Check backend is running on Railway
- Verify production API URL in `src/api/client.ts`
- Check Firebase credentials in Railway dashboard

### Notifications Not Working?
- Verify Firebase project credentials
- Check `google-services.json` is correct
- Firebase setup must be completed in Railway environment

---

## Next Steps After Testing

### If Testing Succeeds ✅
1. Build production AAB: `eas build --platform android --profile production`
2. Create Play Console account ($25 one-time)
3. Upload AAB to Play Console
4. Complete content rating
5. Submit for review (1-7 days)

### If Issues Found ❌
1. Note the error/issue
2. Fix in code if needed
3. Rebuild preview APK
4. Retest

---

## Build Status

Check your build here: https://expo.dev/@owl_wilde/act-app/builds

Or use command:
```powershell
eas build:list --platform android
```

---

## Device Setup Checklist

### For Physical Device:
- [ ] Android 7.0 or higher
- [ ] USB cable (data transfer capable)
- [ ] Developer Mode enabled
- [ ] USB Debugging enabled
- [ ] Unknown Sources enabled (for manual APK install)

### For Emulator:
- [ ] Android Studio installed
- [ ] Emulator configured (API 24+)
- [ ] Sufficient disk space (2+ GB)
- [ ] ADB working properly

---

## Important Notes

⚠️ **Before Production Build:**
1. Test preview APK thoroughly
2. Fix any issues found
3. Increment version code if needed
4. Ensure JWT_SECRET is set in Railway (not default "CHANGE_ME...")
5. Verify production API URL is correct

✅ **Security:**
- Never commit keystore to git
- Backup keystore securely
- Keep JWT_SECRET private
- Use strong random secrets

---

## Questions?

If you encounter issues:
1. Check EAS build logs: `eas build:view {build-id}`
2. Check adb logs: `adb logcat`
3. Verify backend: `curl https://act-production-8080.up.railway.app/health`
4. Check Firebase: Firebase Console > Project Settings
