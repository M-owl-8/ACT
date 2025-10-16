# ACT Gen-1 Troubleshooting Guide

## 🔥 Core Issues and Solutions

### Issue 1: Network Error / Login Not Working

**Root Cause:** The backend API server is not running.

**Symptoms:**
- Login shows "Network Error"
- App logs show: `Unable to connect to http://10.0.2.2:8000`
- Connection timeout errors

**Solution:**

1. **Start the Backend Server:**
   ```powershell
   # Option 1: Use the startup script
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1
   .\START_BACKEND.ps1
   
   # Option 2: Manual start
   cd apps\api
   .\.venv\Scripts\Activate.ps1
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Verify Backend is Running:**
   - Open browser: http://localhost:8000/docs
   - You should see the FastAPI documentation page
   - Check terminal for: "Uvicorn running on http://0.0.0.0:8000"

3. **Test API Connection:**
   ```powershell
   # Test from PowerShell
   Invoke-WebRequest -Uri http://localhost:8000/docs
   ```

---

### Issue 2: expo-blur Warning (Native Module Not Found)

**Root Cause:** The `expo-blur` native module is not properly linked in the development build.

**Symptoms:**
```
WARN  The native view manager for module(ExpoBlurView) from NativeViewManagerAdapter 
isn't exported by expo-modules-core. Views of this type may not render correctly.
```

**Impact:** 
- ⚠️ **Low Priority** - The app still works! 
- The glass blur effect falls back to a semi-transparent white background
- All functionality remains intact

**Solutions:**

#### Quick Fix (Already Applied):
The code now includes a fallback that uses a regular View with semi-transparent background when BlurView is not available. **No action needed.**

#### Complete Fix (Rebuild Native App):
If you want the full blur effect:

```powershell
# 1. Clean the build
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
Remove-Item -Recurse -Force android\app\build

# 2. Rebuild the development client
npx expo prebuild --clean
npx expo run:android

# This will take 5-10 minutes
```

**Note:** The fallback looks great, so rebuilding is optional!

---

### Issue 3: App Won't Start / Metro Bundler Error

**Symptoms:**
- "Unable to resolve module"
- "Module not found"
- Bundler crashes

**Solutions:**

1. **Clear Cache and Reinstall:**
   ```powershell
   cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
   
   # Clear cache
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   npx expo start -c
   
   # Reinstall
   npm install
   npm start
   ```

2. **Check Dependencies:**
   ```powershell
   # Verify all packages are installed
   npm list expo-blur
   npm list expo-linear-gradient
   npm list react-hook-form
   ```

---

## 🚀 Quick Start Checklist

Before running the app, ensure:

- [ ] **Backend is running** on port 8000
  ```powershell
  .\START_BACKEND.ps1
  ```

- [ ] **Dependencies are installed**
  ```powershell
  cd apps\mobile
  npm install
  ```

- [ ] **Emulator/Simulator is running**
  - Android: Open Android Studio → AVD Manager → Start emulator
  - iOS: Open Xcode → Simulator

- [ ] **Start the mobile app**
  ```powershell
  cd apps\mobile
  npm start
  # Press 'a' for Android or 'i' for iOS
  ```

---

## 🔍 Diagnostic Commands

### Check Backend Status
```powershell
# Test if backend is running
Test-NetConnection -ComputerName localhost -Port 8000

# Check backend logs
cd apps\api
Get-Content -Path "uvicorn.log" -Tail 50
```

### Check Mobile App Status
```powershell
# Check Expo status
cd apps\mobile
npx expo doctor

# Check for issues
npm run android -- --verbose
```

### Check Network Configuration
```powershell
# For Android Emulator
# The emulator uses 10.0.2.2 to access host machine's localhost

# Test from emulator (using adb)
adb shell
curl http://10.0.2.2:8000/docs
```

---

## 📱 Platform-Specific Issues

### Android Emulator

**Issue:** Can't connect to backend
**Solution:** 
- Backend must use `0.0.0.0` not `127.0.0.1`
- Emulator accesses host via `10.0.2.2`
- Check firewall isn't blocking port 8000

**Issue:** Slow performance
**Solution:**
- Enable hardware acceleration in BIOS
- Allocate more RAM to emulator (4GB+)
- Use x86_64 system image, not ARM

### iOS Simulator

**Issue:** Can't connect to backend
**Solution:**
- Use `localhost` or your machine's IP address
- Update `EXPO_PUBLIC_API_BASE_URL` in `.env`

---

## 🛠️ Environment Variables

Create `.env` file in `apps/mobile/`:

```env
# For Android Emulator
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000

# For iOS Simulator
# EXPO_PUBLIC_API_BASE_URL=http://localhost:8000

# For Physical Device (replace with your IP)
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```

---

## 🔐 Test Credentials

```
Email: admin@actgen1.com
Password: admin123
```

---

## 📊 Common Error Messages

### "Network Error"
→ Backend not running. Start with `.\START_BACKEND.ps1`

### "Unable to resolve expo-blur"
→ Run `npm install` in `apps/mobile`

### "Port 8000 already in use"
→ Backend already running or another app using port
```powershell
# Find process using port 8000
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
# Kill the process
Stop-Process -Id <ProcessId>
```

### "ECONNREFUSED"
→ Backend not accessible. Check:
1. Backend is running
2. Firewall allows port 8000
3. Using correct IP address (10.0.2.2 for Android emulator)

---

## 🆘 Still Having Issues?

1. **Check all services are running:**
   ```powershell
   # Backend
   Test-NetConnection localhost -Port 8000
   
   # Mobile app
   Get-Process -Name "node" -ErrorAction SilentlyContinue
   ```

2. **Restart everything:**
   ```powershell
   # Stop all
   Stop-Process -Name "node" -Force
   Stop-Process -Name "python" -Force
   
   # Start fresh
   .\START_APP.ps1
   ```

3. **Check logs:**
   - Backend logs: Terminal where uvicorn is running
   - Mobile logs: Expo terminal
   - Device logs: `adb logcat` (Android) or Console.app (iOS)

---

## 📝 Maintenance Commands

### Update Dependencies
```powershell
# Backend
cd apps\api
pip install --upgrade -r requirements.txt

# Mobile
cd apps\mobile
npm update
```

### Clean Everything
```powershell
# Mobile
cd apps\mobile
Remove-Item -Recurse -Force node_modules, .expo, android\app\build
npm install

# Backend
cd apps\api
Remove-Item -Recurse -Force __pycache__, .pytest_cache
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Backend Terminal:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Mobile Terminal:**
```
› Metro waiting on exp://10.21.69.205:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Press a │ open Android
› Press i │ open iOS simulator
```

**Mobile App Logs:**
```
LOG  🌐 API Base URL: http://10.0.2.2:8000
```

**No Errors:**
- No "Network Error" messages
- No "ECONNREFUSED" errors
- Login works successfully

---

## 🎯 Performance Optimization

### Backend
- Use `--workers 4` for production
- Enable caching for database queries
- Use connection pooling

### Mobile
- Enable Hermes engine (already enabled)
- Use `useNativeDriver: true` for animations (already done)
- Optimize images and assets

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Native Debugging](https://reactnative.dev/docs/debugging)
- [Android Emulator Networking](https://developer.android.com/studio/run/emulator-networking)

---

**Last Updated:** October 2025
**Version:** 1.0.0