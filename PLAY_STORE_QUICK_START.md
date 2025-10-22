# ⚡ PLAY STORE UPLOAD - QUICK START (15 MINUTES)

## 🎯 TL;DR - Main Steps

1. **Generate Keystore** (5 min)
2. **Build Release AAB** (5 min)
3. **Upload to Play Store** (5 min)

---

## 🔐 STEP 1: GENERATE KEYSTORE (5 MINUTES)

```powershell
cd c:\work\act-gen1\apps\mobile\android\app

keytool -genkeypair -v -storetype PKCS12 `
  -keystore act-release.keystore `
  -alias act-key `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

**When prompted:**
- Keystore password: `[Create strong password]`
- Key password: `[PRESS ENTER - same as keystore]`
- Name: `ACT Development Team`
- Organization: `ACT`
- City: `Tokyo`
- State: `Tokyo`
- Country: `JP`
- Confirm: `yes`

**🚨 BACKUP IMMEDIATELY:**
```powershell
# Backup to USB or cloud storage
Copy-Item "act-release.keystore" -Destination "D:\BACKUP\act-release.keystore.backup"
```

---

## ⚙️ STEP 2: CONFIGURE FOR RELEASE

### Update gradle.properties

```powershell
notepad c:\work\act-gen1\apps\mobile\android\gradle.properties
```

Add these lines (replace with YOUR password):
```properties
ACT_RELEASE_STORE_FILE=act-release.keystore
ACT_RELEASE_KEY_ALIAS=act-key
ACT_RELEASE_STORE_PASSWORD=YOUR_PASSWORD_HERE
ACT_RELEASE_KEY_PASSWORD=YOUR_PASSWORD_HERE
```

### Update app.json for Production

```powershell
notepad c:\work\act-gen1\apps\mobile\app.json
```

Update:
```json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    },
    "owner": "YOUR_EXPO_USERNAME"
  }
}
```

### Update .env for Production

```powershell
notepad c:\work\act-gen1\apps\mobile\.env
```

Change to your production backend:
```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
```

---

## 📦 STEP 3: BUILD RELEASE APK/AAB

```powershell
cd c:\work\act-gen1\apps\mobile\android

# Clean build
.\gradlew clean

# Build AAB (recommended for Play Store)
.\gradlew bundleRelease

# Or build APK (alternative)
# .\gradlew assembleRelease
```

**Verify build succeeded:**
```powershell
Get-Item "app\build\outputs\bundle\release\app-release.aab"
# Should show file size ~30-40 MB
```

---

## 🎯 STEP 4: UPLOAD TO PLAY STORE

### 4.1 Create Play Console Account
- Go to: https://play.google.com/console
- Pay: $25 USD (one-time)
- Sign in with Google account

### 4.2 Create App
1. Click: **"Create app"**
2. Fill in:
   - **App name**: `ACT`
   - **Language**: `English` or `Japanese`
   - **Type**: `App`
   - **Free**: `Free`
3. Click: **"Create app"**

### 4.3 Complete Setup Checklist

Go to **Setup** section and complete:

✓ **App access**
- Select: "All functionality is available without restrictions"

✓ **Ads**
- Select: "No, my app does not contain ads"

✓ **Content rating**
- Answer questionnaire → Submit

✓ **Target audience**
- Select target countries and age groups

✓ **Data safety**
- Describe data collection
- Add privacy policy URL

### 4.4 Create Privacy Policy (Required!)

**Option A: Quick Template**

Create file at `https://yoursite.com/privacy`:

```
# Privacy Policy - ACT

Last updated: [Today]

## Information We Collect
- Email for authentication
- User profile data
- Usage analytics

## Security
- All data encrypted
- No third-party sharing
- Compliant with GDPR

## Contact
privacy@act.app
```

**Option B: Use Generator**
- Go: https://www.privacypolicygenerator.info/
- Generate → Download → Host on GitHub Pages

### 4.5 Upload Release

1. Go to: **Release → Production → Create new release**
2. Click: **"Upload"**
3. Select: `app\build\outputs\bundle\release\app-release.aab`
4. Add **Release notes**:
   ```
   Initial release of ACT
   - Secure authentication
   - Real-time notifications
   - Japanese UI theme
   ```

### 4.6 Upload Graphics

Go to: **Store presence → Main store listing**

Upload:
- **Icon**: `assets/icon.png` (512x512)
- **Feature graphic**: Create 1024x500 PNG (use Canva)
- **Screenshots**: At least 2 (1080x1920 PNG)

Fill in:
- **App title**: `ACT`
- **Short desc**: `Team collaboration tool for productivity`
- **Full description**: [See full guide]

### 4.7 Set Pricing & Distribution

1. Go to: **Pricing & distribution**
2. Select: `Free` (or set price)
3. Countries: `All countries` or select specific ones
4. ✓ Accept content guidelines
5. Save

### 4.8 Submit for Review

1. Review all sections - should show ✓ checks
2. Click: **"Submit for review"**
3. Wait: 2-4 hours (usually)
4. Check email for approval/rejection

---

## ✅ FINAL CHECKLIST

Before clicking "Submit":

- ✓ Keystore generated and backed up
- ✓ gradle.properties has keystore password
- ✓ AAB file built and verified
- ✓ Play Console account created
- ✓ All setup forms completed
- ✓ Privacy policy URL works
- ✓ Icon/screenshots/feature graphic uploaded
- ✓ Store listing filled in
- ✓ AAB uploaded to Play Store
- ✓ Release notes added
- ✓ Pricing set to Free
- ✓ Terms accepted

---

## 🚨 CRITICAL REMINDERS

1. **BACKUP YOUR KEYSTORE** - You CANNOT update your app without it!
2. **SAVE PASSWORD** - Store in password manager, not in code!
3. **NEVER commit gradle.properties** - Add to .gitignore!
4. **VERSION CODE MUST INCREMENT** - Use 1, 2, 3, etc. (never reuse)
5. **PRIVACY POLICY REQUIRED** - App will be rejected without it!

---

## 📞 HELP

**Stuck?** Read: `PLAY_STORE_UPLOAD_COMPLETE_GUIDE.md` for detailed instructions

**Build fails?** Check:
```powershell
# Verify keystore exists
Get-Item c:\work\act-gen1\apps\mobile\android\app\act-release.keystore

# Check password
keytool -list -v -keystore act-release.keystore -alias act-key
```

**App rejected?** Check email for reason. Common issues:
- Outdated target API (fix: targetSdk = 34)
- Broken privacy policy link
- Missing permissions explanation
- Policy violations

---

**Expected Timeline:**
- Keystore generation: 5 minutes
- Build AAB: 5-10 minutes
- Play Store setup: 30 minutes
- Upload: 5 minutes
- Review: 2-4 hours
- **Total**: ~1 hour setup + 4 hours review = ~5 hours to live! ✨