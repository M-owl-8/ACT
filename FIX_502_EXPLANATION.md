# 🔧 ACT Gen-1: Complete 502 Bad Gateway Fix

## What's Causing the 502 Error?

The 502 error (Bad Gateway) happens when the Android emulator **cannot reach your backend API**. This is usually caused by:

### ❌ **Common Causes:**

1. **Wrong Host Binding** ← Most Common!
   - Backend binds to `127.0.0.1` (localhost only)
   - Android emulator can only reach `10.0.2.2` (special Android emulator IP)
   - ❌ Wrong: `uvicorn main:app` (binds to 127.0.0.1)
   - ❌ Wrong: `uvicorn main:app --host 127.0.0.1`
   - ✅ **Correct: `uvicorn main:app --host 0.0.0.0`**

2. **Backend Not Running**
   - Process crashed or never started
   - You should see: `✅ ACT Gen-1 API is ready!`

3. **Port 8000 In Use**
   - Another process using port 8000
   - Backend can't bind to the port

4. **Firewall Blocking**
   - Windows Firewall blocking port 8000
   - Less common, but possible

---

## 🎯 Quick Fix (Step-by-Step)

### Step 1: Kill Any Existing Process on Port 8000

```powershell
# Open PowerShell and run:
Get-NetTCPConnection -LocalPort 8000 | Select-Object -First 1 | ForEach-Object { 
    Stop-Process -Id $_.OwningProcess -Force 
}
```

Or use the automated fix:
```powershell
.\FIX_502_FOREVER.ps1
```

### Step 2: Start Backend with CORRECT Host Binding

**Option A: Automated (Recommended)**
```powershell
.\START_BACKEND_FIXED.ps1
```

**Option B: Manual**
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Key requirement:** `--host 0.0.0.0` (not 127.0.0.1)

### Step 3: Verify Backend is Running

Open browser: `http://localhost:8000/health`

You should see:
```json
{"status": "ok", "app": "ACT Gen-1 MVP - Personal Finance Tracker"}
```

### Step 4: Start Mobile App

In another terminal:
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm run android
```

### Step 5: Test in App

In the Android emulator:
1. Register a new account or login
2. Backend should now respond (no 502 error)

---

## 🔍 How Android Emulator Networking Works

```
Your Windows Computer          Android Emulator
━━━━━━━━━━━━━━━━━━           ━━━━━━━━━━━━━
localhost (127.0.0.1)   X    (Can't reach this)
0.0.0.0 (all interfaces) ✅  Can reach via 10.0.2.2

When backend binds to 0.0.0.0:
Emulator requests: http://10.0.2.2:8000
Host receives it at: http://0.0.0.0:8000 ✅
```

---

## ✅ Success Indicators

When backend starts correctly, you should see:

```
🚀 Starting ACT Gen-1 API...
📊 Database: sqlite+aiosqlite:///./dev.db...
✓ Database tables ready
✓ Default data seeded
✓ Daily backup task started
✅ ACT Gen-1 API is ready!

INFO:     Application startup complete [uvicorn]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## 🧪 Testing Checklist

- [ ] Port 8000 is free (no other process using it)
- [ ] Backend starts with `--host 0.0.0.0` in the command
- [ ] You see "ACT Gen-1 API is ready!" message
- [ ] `http://localhost:8000/health` works in browser
- [ ] Android emulator is running
- [ ] Mobile app starts and shows login screen
- [ ] No 502 errors when trying to register/login

---

## ❌ Still Getting 502? Troubleshooting

### 1. Check if Backend is Actually Running

Look for messages like:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

If you don't see this, backend didn't start. Check for error messages.

### 2. Verify Host Binding

Check the command in the terminal. Must have `--host 0.0.0.0`

```
❌ Wrong:  uvicorn main:app --reload --port 8000
✅ Right:  uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Check Port 8000 Availability

```powershell
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
```

If shows results, something is using port 8000. Kill it with:

```powershell
# Run the FIX_502_FOREVER.ps1 script, or manually:
Get-NetTCPConnection -LocalPort 8000 | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
}
```

### 4. Check Firewall

Windows Firewall might be blocking port 8000:

1. Search for "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Find Python (from venv) and check both Private and Public
4. Restart backend

### 5. Check Mobile App Configuration

File: `apps/mobile/src/api/client.ts`

Should have:
```typescript
const LOCAL_API_URL = "http://10.0.2.2:8000";  // ← Correct for emulator
```

This is already configured correctly!

### 6. Check .env File

File: `apps/api/.env`

Should exist with:
```
DATABASE_URL=sqlite+aiosqlite:///./dev.db?check_same_thread=False
JWT_SECRET=VE5pLXN0OFEzLU1wQTg2dGZrMmhYN2pMVVBfOGZzTm5QcmJpNTUyVGhyMQ==
```

If missing, the fix script will create it.

---

## 🚀 Complete Workflow to Test App

### Terminal 1: Start Backend
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Wait for: `✅ ACT Gen-1 API is ready!`

### Terminal 2: Start Mobile App
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm run android
```

Wait for Android emulator to load.

### Browser: Verify Backend
```
http://localhost:8000/docs  ← Should show Swagger UI
http://localhost:8000/health ← Should return {"status": "ok"}
```

### In Emulator: Test App
1. See ACT login screen
2. Click "Sign Up"
3. Enter email and password
4. Should NOT see 502 error (should see success message)

---

## 📝 Summary

**The FIX:**
- Use `--host 0.0.0.0` when starting backend
- Ensure port 8000 is free
- Mobile app already configured to use `http://10.0.2.2:8000`

**The ROOT CAUSE:**
- Backend binding to 127.0.0.1 (localhost only)
- Android emulator can't reach 127.0.0.1
- Must bind to 0.0.0.0 (all interfaces)
- Emulator reaches it via special IP: 10.0.2.2

**The RESULT:**
- ✅ No more 502 errors
- ✅ App can register and login
- ✅ Ready for Play Store testing

---

## 🎁 Bonus: Automated Solutions

**Use these scripts for easy setup:**

1. **FIX_502_FOREVER.ps1** - Diagnoses and fixes all issues
2. **START_BACKEND_FIXED.ps1** - Starts backend correctly
3. **START_BACKEND_AND_MOBILE.ps1** - Starts both backend and mobile

---

## Need More Help?

Check these files:
- Backend config: `apps/api/main.py` (CORS setup)
- Mobile client: `apps/mobile/src/api/client.ts` (API URL config)
- Environment: `apps/api/.env` (database and JWT settings)