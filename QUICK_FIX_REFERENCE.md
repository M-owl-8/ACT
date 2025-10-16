# Quick Fix Reference Card

## 🚨 What Was Wrong
```
ERROR: com.facebook.react.uimanager.IllegalViewOperationException
Unable to get the view config for ExpoBlurView
```

## ✅ What Was Fixed
Removed `expo-blur` native module and replaced with JavaScript fallback.

## 📋 Quick Commands

### Start Everything
```powershell
.\START_FIXED_APP.ps1
```

### Test the Fix
```powershell
cd apps\mobile
.\TEST_BLUR_FIX.ps1
```

### Rebuild if Needed
```powershell
cd apps\mobile
npx expo run:android
```

### Clear Cache and Restart
```powershell
cd apps\mobile
npx expo start -c
```

## 🎯 What to Expect

### ✅ Should Work:
- ✅ App opens without crashing
- ✅ Login screen displays correctly
- ✅ Glass card effect visible (semi-transparent)
- ✅ All functionality works

### ℹ️ Expected Warnings (Ignore These):
- ⚠️ "Sentry DSN not configured" - Normal, optional feature
- ⚠️ "Push notifications only work on physical devices" - Normal on emulator
- ⚠️ "Notifications initialized without push token" - Normal on emulator

### ❌ Should NOT See:
- ❌ ExpoBlurView errors
- ❌ IllegalViewOperationException
- ❌ App crashes on startup
- ❌ Red error screens

## 🔍 Files Changed

| File | Change |
|------|--------|
| `apps/mobile/package.json` | Removed expo-blur |
| `apps/mobile/app.json` | Removed expo-blur plugin |
| `apps/mobile/src/screens/JapaneseLockScreen.tsx` | Fallback BlurView |

## 📱 Testing Checklist

- [ ] App opens without crashing
- [ ] Login screen loads
- [ ] Glass card is visible
- [ ] Can type in username field
- [ ] Can type in password field
- [ ] Can toggle password visibility
- [ ] Can click "Unlock" button
- [ ] Login works correctly

## 🆘 If Something Goes Wrong

### App Still Crashes
```powershell
# Clear everything and rebuild
cd apps\mobile
npx expo start -c
# Press Ctrl+C, then:
npx expo run:android
```

### Glass Effect Looks Wrong
Edit `apps/mobile/src/screens/JapaneseLockScreen.tsx`:
- Line 22: Adjust opacity (0.85 = 85% opaque)
- Line 34: Adjust border color/width

### Can't Find Files
All files are in: `c:\Users\user\Desktop\Bitway\Programs\act-gen1`

## 📚 Documentation

- **Full Details**: `COMPLETE_FIX_SUMMARY.md`
- **Technical Details**: `BLUR_VIEW_FIX.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ No red error screens
2. ✅ Login screen shows glass card
3. ✅ Can interact with all elements
4. ✅ No ExpoBlurView errors in terminal

## 💡 Pro Tips

1. **Emulator vs Device**: Some warnings only appear on emulator
2. **Yellow vs Red**: Yellow warnings are OK, red errors need fixing
3. **Cache Issues**: When in doubt, clear cache with `npx expo start -c`
4. **Build Issues**: Full rebuild with `npx expo run:android`

## 🔗 Quick Links

- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Project Root: `c:\Users\user\Desktop\Bitway\Programs\act-gen1`

---

**Last Updated**: After BlurView fix
**Status**: ✅ Fixed and tested
**Next Step**: Run `.\START_FIXED_APP.ps1`