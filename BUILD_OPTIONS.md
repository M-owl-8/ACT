# 🔨 ACT App - Build Options

## Current Status: EAS Preview Build (with cache clear) in progress

---

## Option 1️⃣: EAS Cloud Build (Recommended) ✅

**Pros:**
- No local Android SDK setup required
- Consistent builds across machines
- Automatic signing (easier for Play Store)
- Managed infrastructure

**Cons:**
- Takes 5-10 minutes per build
- Requires internet connection
- Limited to free tier

**Command:**
```powershell
cd "c:\work\act-gen1\apps\mobile"
eas build --platform android --profile preview --wait
```

**Check Status:**
```powershell
eas build:list --platform android
eas build:view {build-id}
```

---

## Option 2️⃣: Local Gradle Build (Faster Alternative) 🏃

**Pros:**
- Fast builds (2-3 minutes)
- Works offline
- Full control
- Great for testing

**Cons:**
- Requires Android SDK setup
- Manual signing
- Local env specific

### Prerequisites:
- Android SDK installed
- JAVA_HOME configured
- Gradle working locally

### Build Commands:

#### Build Debug APK:
```powershell
cd "c:\work\act-gen1\apps\mobile\android"
.\gradlew.bat assembleDebug
```

#### Build Release APK:
```powershell
cd "c:\work\act-gen1\apps\mobile\android"
.\gradlew.bat assembleRelease
```

#### Build Release AAB (for Play Store):
```powershell
cd "c:\work\act-gen1\apps\mobile\android"
.\gradlew.bat bundleRelease
```

**Output Location:**
- Debug APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Option 3️⃣: Expo Development APK 🚀

**For testing during development:**

```powershell
cd "c:\work\act-gen1\apps\mobile"
npm start -- --android
```

This builds and runs on connected device immediately.

---

## Comparison Table

| Aspect | EAS Cloud | Local Gradle | Expo Dev |
|--------|-----------|--------------|----------|
| Build Time | 5-10 min | 2-3 min | 2-3 min |
| Setup | Easy | Medium | Easy |
| Network | Required | Optional | Required |
| For Play Store | ✅ Yes | ✅ Yes | ❌ No |
| Local Control | ❌ | ✅ | ✅ |
| Cost | Free tier available | Free | Free |

---

## What to Use When

- **First-time testing:** EAS Cloud (most reliable)
- **Quick iterations:** Local Gradle
- **Development:** Expo CLI
- **Play Store submission:** EAS Cloud or Local Gradle with proper signing

---

## If EAS Build Fails Again

Error: "ENOENT: no such file or directory, open '/home/expo/workingdir/build/apps/mobile/android/gradlew'"

**Solutions:**

1. **Clear cache and retry** (already trying this)
2. **Check git status** - ensure gradlew is committed:
   ```powershell
   git -C "c:\work\act-gen1" status apps/mobile/android/gradlew
   ```
3. **Force add gradlew:**
   ```powershell
   git -C "c:\work\act-gen1" add -f apps/mobile/android/gradlew
   git -C "c:\work\act-gen1" commit -m "Ensure gradlew is in git"
   eas build --platform android --profile preview
   ```
4. **Switch to local build** (fastest workaround):
   ```powershell
   cd "c:\work\act-gen1\apps\mobile\android"
   .\gradlew.bat bundleRelease
   ```

---

## Next: Testing

Once you have an APK/AAB:

### On Physical Device:
```powershell
adb install -r "path\to\app.apk"
```

### On Emulator:
1. Drag APK into emulator
2. Or: `adb install -r "path\to\app.apk"`

### Check Logs:
```powershell
adb logcat | grep ACT
```

---

## Checklist Before Play Store

- [ ] Version code incremented: `android.versionCode`
- [ ] Version name updated: `app.json` version
- [ ] Debug symbols included (if needed)
- [ ] ProGuard rules configured
- [ ] Firebase credentials valid
- [ ] API endpoint correct
- [ ] JWT secret updated (not default)

---

## Important Notes

⚠️ **For Production AAB:**
- Must use **bundleRelease** (not assembleRelease)
- Requires release keystore (production signing key)
- Cannot be tested directly - upload to Play Console test track first
- Or use: `eas build --platform android --profile production`

✅ **For Testing APK:**
- Use **assembleDebug** (faster, larger)
- No signing required for device install
- Use **assembleRelease** for production-like testing

---

## Questions?

If build fails:
1. Check EAS dashboard: https://expo.dev/@owl_wilde/act-app/builds
2. View detailed logs: `eas build:view {build-id} --verbose`
3. Try local build as fallback
4. Check Android SDK setup: `android --version`
