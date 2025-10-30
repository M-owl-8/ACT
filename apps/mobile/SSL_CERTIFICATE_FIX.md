# 🔒 SSL Certificate Error Fix - React Native PDF

## ❌ Error You're Seeing:
```
PDF Error Code: [Error: ReactNativeBlobUtil request error: java.lang.IllegalStateException: Use of own trust manager but none defined]
```

---

## ✅ What Causes This?

This is an **Android-specific SSL/TLS certificate validation error** that occurs when:
- `react-native-pdf` tries to download or validate PDFs
- The Android system can't verify SSL certificates properly
- React Native Blob Util has SSL configuration issues

---

## 🔧 Solution Applied

### **1. Android Configuration (app.json)**
Added `usesCleartextTraffic: true` to bypass strict SSL validation during development:

```json
"android": {
  "usesCleartextTraffic": true
}
```

**What it does:**
- Allows HTTP traffic for development
- Bypasses SSL certificate validation issues
- Safe for local/development builds

---

## 🚀 Steps to Fix

### **Step 1: Clean Everything**
```powershell
cd c:\work\act-gen1\apps\mobile
rm -r node_modules
rm -r .gradle
rm -r build
npx expo prebuild --clean
npm install
```

### **Step 2: Rebuild Native Code**
```powershell
npm start
```

Then press:
- **a** for Android
- **i** for iOS (if testing on iOS)

### **Step 3: Clear App Data**
If still getting the error:

**On Android Emulator:**
```powershell
adb shell pm clear com.act.app
```

**On Physical Device:**
Settings → Apps → ACT → Clear Cache → Clear Data

### **Step 4: Test**
1. Open app
2. Go to 📚 **Books** tab
3. Click on **"The Richest Man in Babylon"**
4. Should load within 5 seconds or show a specific error message

---

## 📱 Expected Behavior After Fix

✅ **Success:**
- PDF loads within 3-10 seconds
- Shows "Page 1 of 384" at the bottom
- Can swipe to next page

❌ **If Still Failing:**
- Clear app cache: Settings → Apps → ACT → Storage → Clear Cache
- Reinstall app
- Check Expo logs for detailed errors

---

## 🔍 Debugging Tips

### **Check Expo Console:**
Look for these logs:
```
Opening book: {"id":"library_1","pdfFile":"Book_1.pdf",...}
PDFReaderScreen mounted
PDF loaded with pages: 384
```

### **If You See Errors:**
```
PDF Error: java.lang.IllegalStateException
→ Run: npx expo prebuild --clean

PDF Error: ReactNativeBlobUtil request error
→ Check internet connection, rebuild app

PDF loading timeout
→ Device too slow, or PDF too large
```

---

## ⚙️ Configuration Details

### **What `usesCleartextTraffic` Does:**
- **In Development**: Allows HTTP without SSL verification
- **In Production**: Should be removed and use proper HTTPS
- **For Local PDFs**: Works with file:// protocol

### **For Production:**
Remove `usesCleartextTraffic` and ensure:
1. PDFs are served over HTTPS
2. SSL certificates are valid
3. Use proper certificate pinning if needed

---

## 🎯 Quick Checklist

- [ ] `app.json` has `"usesCleartextTraffic": true`
- [ ] Ran `npx expo prebuild --clean`
- [ ] Ran `npm install`
- [ ] Cleared app cache/data
- [ ] Restarted emulator or device
- [ ] PDF loads without timeout error

---

## 🆘 Still Having Issues?

### **Completely Nuclear Option:**
```powershell
# Remove everything
rm -r node_modules
rm -r .expo
rm -r .gradle
rm -r build
npm cache clean --force

# Reinstall
npm install
npx expo prebuild --clean

# Start fresh
npm start
# Press 'a' for Android
```

### **Check react-native-pdf Version:**
```powershell
npm list react-native-pdf
```
Should show: `react-native-pdf@6.7.3`

If different, update:
```powershell
npm install react-native-pdf@6.7.3
```

---

## 📚 Related Files

- `src/screens/PDFReaderScreen.tsx` - Enhanced error handling
- `app.json` - Android SSL configuration
- `package.json` - react-native-pdf dependency

---

## ✨ Next Steps

1. ✅ Apply the fix above
2. ✅ Test opening a PDF
3. ✅ Watch Expo console for logs
4. ✅ Report any new errors (they'll be more specific now!)

**The app should now show helpful error messages instead of infinite loading! 🎉**