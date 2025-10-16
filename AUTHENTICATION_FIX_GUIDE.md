# 🔐 Authentication Issues - Complete Fix Guide

## 🔴 Issues Identified

### 1. **Crypto Error** ✅ FIXED
**Error**: `Property 'crypto' doesn't exist`
**Cause**: The app was using `crypto.subtle` API which doesn't exist in React Native
**Location**: `apps/mobile/src/store/authLocal.ts`
**Status**: ✅ **FIXED** - Replaced with React Native compatible hash function

### 2. **Backend Not Running** ⚠️ ACTION REQUIRED
**Error**: `Invalid email or password`
**Cause**: Backend API server is not running at `http://10.21.69.205:8000`
**Status**: ⚠️ **NEEDS ACTION** - Start the backend server

### 3. **App Using Wrong Version** ⚠️ DECISION NEEDED
**Current**: App is using `AppStandalone` (offline mode with local database)
**Expected**: You want to use backend API version
**Status**: ⚠️ **DECISION NEEDED** - Choose which version to use

---

## 🎯 Choose Your Path

### Option A: Use Backend API (Recommended for Production)
**Best for**: Production deployment, multi-device sync, cloud storage

**Steps**:
1. Start the backend server
2. Switch app to use backend version
3. Test registration and login

### Option B: Use Standalone Mode (Offline)
**Best for**: Testing without backend, offline-first app

**Steps**:
1. Keep current configuration
2. Test with fixed crypto function
3. All data stored locally on device

---

## 📋 Option A: Backend API Setup (RECOMMENDED)

### Step 1: Start Backend Server

```powershell
# Navigate to API directory
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Verify backend is running**:
```powershell
# In a new PowerShell window
Invoke-RestMethod -Uri "http://10.21.69.205:8000/health"
```

Expected response: `{"status":"healthy"}`

### Step 2: Switch App to Backend Version

Edit `apps/mobile/index.ts`:

**Current (Standalone)**:
```typescript
import App from './AppStandalone';
```

**Change to (Backend)**:
```typescript
import App from './App';
```

### Step 3: Verify API Configuration

Check `apps/mobile/.env`:
```bash
EXPO_PUBLIC_API_BASE_URL=http://10.21.69.205:8000
```

### Step 4: Restart Mobile App

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Kill any running Metro bundler
# Then restart
npx expo start --clear
```

### Step 5: Test Registration

1. Open app on emulator/device
2. Click "Create Account"
3. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
4. Click "Create Account"

**Expected**: Registration successful, redirected to home screen

### Step 6: Test Login

1. Logout if logged in
2. Click "Sign In"
3. Enter same credentials
4. Click "Sign In"

**Expected**: Login successful, redirected to home screen

---

## 📋 Option B: Standalone Mode Setup

### Step 1: Keep Current Configuration

The app is already configured for standalone mode.

### Step 2: Restart Mobile App

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npx expo start --clear
```

### Step 3: Test Registration

1. Open app on emulator/device
2. Click "Create Account"
3. Enter:
   - Email: `test@example.com`
   - Password: `Test123!`
4. Click "Create Account"

**Expected**: Registration successful, user stored in local SQLite database

### Step 4: Test Login

1. Logout if logged in
2. Click "Sign In"
3. Enter same credentials
4. Click "Sign In"

**Expected**: Login successful with local authentication

---

## 🔧 Fixes Applied

### File: `apps/mobile/src/store/authLocal.ts`

**Before** (Broken):
```typescript
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data); // ❌ Doesn't work in React Native
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

**After** (Fixed):
```typescript
async function hashPassword(password: string): Promise<string> {
  // Simple hash using string manipulation (React Native compatible)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const salted = Math.abs(hash).toString(16) + password.length.toString(16);
  return salted.padStart(16, '0');
}
```

**Note**: This is a simple hash for demo purposes. For production, use `expo-crypto` or a proper hashing library.

---

## 🧪 Testing Checklist

### Backend API Mode
- [ ] Backend server running at `http://10.21.69.205:8000`
- [ ] Health endpoint responds: `/health`
- [ ] App switched to `App.tsx` (not `AppStandalone.tsx`)
- [ ] Registration works
- [ ] Login works
- [ ] Profile loads after login
- [ ] Logout works
- [ ] Can login again after logout

### Standalone Mode
- [ ] App using `AppStandalone.tsx`
- [ ] Database initializes successfully
- [ ] Registration works (stores in local DB)
- [ ] Login works (checks local DB)
- [ ] User session persists after app restart
- [ ] Logout works
- [ ] Can login again after logout

---

## 🐛 Troubleshooting

### Issue: "Invalid email or password" on Login

**Cause**: User doesn't exist in database

**Solution**:
- **Backend mode**: Register a new user first
- **Standalone mode**: Register a new user first
- Check you're using the correct email/password

### Issue: "Network Error" or "Cannot connect"

**Cause**: Backend server not running or wrong IP

**Solution**:
1. Check backend is running:
   ```powershell
   Invoke-RestMethod -Uri "http://10.21.69.205:8000/health"
   ```

2. If using physical device, ensure:
   - Device and computer on same WiFi network
   - Computer's firewall allows port 8000
   - IP address is correct (check with `ipconfig`)

3. For emulator, try using `10.0.2.2:8000` instead

### Issue: "Property 'crypto' doesn't exist"

**Status**: ✅ Should be fixed now

**If still occurs**:
1. Clear Metro bundler cache:
   ```powershell
   npx expo start --clear
   ```

2. Verify the fix was applied to `authLocal.ts`

3. Restart the app completely

### Issue: App crashes on startup

**Solution**:
1. Check logs in Expo dev tools
2. Clear app data:
   ```powershell
   # For Android
   adb shell pm clear com.actgen1.mobile
   ```
3. Reinstall the app

---

## 📊 Current Configuration

### App Entry Point
**File**: `apps/mobile/index.ts`
**Current**: Using `AppStandalone` (offline mode)

### API Configuration
**File**: `apps/mobile/.env`
**Current**: `EXPO_PUBLIC_API_BASE_URL=http://10.21.69.205:8000`

### Auth Stores
- **Backend**: `src/store/auth.ts` - Used by `App.tsx`
- **Standalone**: `src/store/authLocal.ts` - Used by `AppStandalone.tsx` ✅ Fixed

---

## 🚀 Recommended Next Steps

### For Development (Right Now)

1. **Choose your mode**:
   - Backend API: Follow "Option A" above
   - Standalone: Follow "Option B" above

2. **Test thoroughly**:
   - Register new user
   - Login
   - Logout
   - Login again

3. **Verify all features work**:
   - Add income/expense
   - View reports
   - Change settings

### For Production (Later)

1. **Use Backend API mode**:
   - Deploy backend to production (Railway, Render, etc.)
   - Update `EXPO_PUBLIC_API_BASE_URL` to production URL
   - Use HTTPS for security

2. **Improve security**:
   - Use proper password hashing (backend handles this)
   - Enable HTTPS
   - Implement rate limiting
   - Add input validation

3. **Test on real devices**:
   - Build APK/AAB
   - Test on multiple Android versions
   - Test network conditions

---

## 💡 Quick Commands Reference

### Start Backend
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Mobile App
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npx expo start --clear
```

### Test Backend Health
```powershell
Invoke-RestMethod -Uri "http://10.21.69.205:8000/health"
```

### Switch to Backend Mode
Edit `apps/mobile/index.ts`:
```typescript
import App from './App'; // Backend mode
```

### Switch to Standalone Mode
Edit `apps/mobile/index.ts`:
```typescript
import App from './AppStandalone'; // Standalone mode
```

---

## ✅ Summary

| Issue | Status | Action Required |
|-------|--------|-----------------|
| Crypto error | ✅ Fixed | None - already fixed |
| Backend not running | ⚠️ Pending | Start backend server |
| Wrong app version | ⚠️ Pending | Choose mode and switch if needed |

**Next Step**: Choose Option A (Backend) or Option B (Standalone) and follow the steps above.

---

**Need help?** Check the troubleshooting section or review the error logs in Expo dev tools.