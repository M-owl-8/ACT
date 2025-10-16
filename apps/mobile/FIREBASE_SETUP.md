# Firebase Configuration Files

## 📋 Required Files

You need to download these files from Firebase Console:

### 1. google-services.json (Android)
- Download from: Firebase Console → Project Settings → Your Android App
- Place at: `apps/mobile/google-services.json`
- Example provided: `google-services.json.example`

### 2. GoogleService-Info.plist (iOS)
- Download from: Firebase Console → Project Settings → Your iOS App
- Place at: `apps/mobile/GoogleService-Info.plist`
- Example provided: `GoogleService-Info.plist.example`

## 🔒 Security

**IMPORTANT:** These files contain sensitive credentials!

- ✅ DO: Keep them in your local project
- ✅ DO: Add them to `.gitignore`
- ❌ DON'T: Commit them to version control
- ❌ DON'T: Share them publicly

## 📝 Setup Instructions

1. Follow `MISSION_2_FCM_GUIDE.md` for complete setup
2. Download files from Firebase Console
3. Rename and place them in this directory
4. Run `npx expo prebuild --clean` to integrate

## ✅ Verification

After placing files, verify:
```powershell
# Check files exist
Test-Path google-services.json
Test-Path GoogleService-Info.plist

# Should return: True
```

## 🆘 Need Help?

See `MISSION_2_FCM_GUIDE.md` for detailed instructions.