# 🚀 Quick Start: Backend + Android Emulator

## **Automated Start (Recommended)**

```powershell
# Run this in PowerShell from anywhere:
c:\Users\user\Desktop\Bitway\Programs\act-gen1\START_BACKEND_EMULATOR.ps1
```

This script will:
1. ✅ Check/create Python virtual environment
2. ✅ Install dependencies
3. ✅ Create .env file if needed
4. ✅ Start backend on http://localhost:8000
5. ✅ Start mobile app on Android emulator

---

## **Manual Start (Step by Step)**

### **Terminal 1: Start Backend**

```powershell
# Navigate to backend
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api

# Activate virtual environment (if first time, create it)
.\.venv\Scripts\Activate.ps1

# If venv doesn't exist, create it:
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
✅ ACT Gen-1 API is ready!
Uvicorn running on http://0.0.0.0:8000
```

---

### **Terminal 2: Start Mobile App**

```powershell
# Navigate to mobile
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Run on Android emulator
npm run android
```

**What happens:**
- Emulator starts (takes 2-3 minutes on first launch)
- App builds automatically
- App loads in emulator when ready

---

## **Testing the Connection**

### **1. Backend Health Check**

Open browser and go to:
```
http://localhost:8000/docs
```

You should see: **Swagger UI with all API endpoints**

### **2. Check Backend Logs**

In the backend terminal, you should see:
```
✓ Database tables ready
✓ Default data seeded
✓ Daily backup task started
✅ ACT Gen-1 API is ready!
```

### **3. Test App Login**

In the Android emulator:
1. Wait for app to load
2. Click "Login"
3. Use test credentials or register new account
4. Check backend logs for API calls

---

## **IP Addresses Reference**

| Device | URL |
|--------|-----|
| **Backend** (your computer) | `http://localhost:8000` |
| **Android Emulator** sees it as | `http://10.0.2.2:8000` |
| **Physical Device** (if testing) | `http://YOUR_IP:8000` |

The mobile app is already configured to use `http://10.0.2.2:8000` for emulator.

---

## **Troubleshooting**

### **Backend won't start**

```powershell
# Check Python installation
python --version

# Check if port 8000 is available
netstat -ano | findstr :8000

# If port in use, kill the process
taskkill /PID [PID_NUMBER] /F
```

### **Emulator won't start**

```powershell
# List available emulators
emulator -list-avds

# Start emulator manually
emulator -avd [DEVICE_NAME]

# Then run app
npm run android
```

### **App can't reach backend**

- ✅ Check backend is running on port 8000
- ✅ Check `http://localhost:8000/docs` works in browser
- ✅ Check mobile app logs in emulator
- ✅ Use `http://10.0.2.2:8000` not `localhost`

### **Clear cache and rebuild**

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Clear everything
rm -r node_modules
rm -r android/build
rm package-lock.json

# Reinstall
npm install

# Try again
npm run android
```

---

## **Quick Commands Reference**

```powershell
# Backend
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload

# Mobile
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm run android

# Stop backend
# Press Ctrl+C in backend terminal

# Stop emulator
# Close emulator window or: emulator -kill-all
```

---

## **Expected Timeline**

| Step | Time |
|------|------|
| Backend startup | 5-10 seconds |
| Emulator startup (first time) | 2-3 minutes |
| Emulator startup (subsequent) | 30-60 seconds |
| App build & load | 1-2 minutes |
| **Total first time** | **5-7 minutes** |
| **Total subsequent** | **2-3 minutes** |

---

## **Success Indicators** ✅

- [ ] Backend terminal shows: `Uvicorn running on http://0.0.0.0:8000`
- [ ] Backend terminal shows: `✅ ACT Gen-1 API is ready!`
- [ ] Emulator window shows ACT app loaded
- [ ] App login screen visible
- [ ] No red error messages in either terminal

You're ready to test! 🎉