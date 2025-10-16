# ACT Gen-1 Authentication Testing Checklist

Use this checklist to verify that authentication and data persistence are working correctly.

## 🔧 Setup Verification

### Backend Setup
- [ ] API server is running
- [ ] Server started with `--host 0.0.0.0` (for physical device)
- [ ] Can access `http://localhost:8000/docs` in browser
- [ ] Database file exists (`apps/api/dev.db`)

### Mobile Setup
- [ ] `.env` file exists in `apps/mobile/`
- [ ] `EXPO_PUBLIC_API_BASE_URL` is set correctly:
  - [ ] For emulator: `http://10.0.2.2:8000`
  - [ ] For physical device: `http://YOUR_LOCAL_IP:8000`
- [ ] Expo server is running (`npm start`)
- [ ] App is installed on device/emulator

### Network Verification
- [ ] Phone and computer on same WiFi network (for physical device)
- [ ] Can access `http://YOUR_IP:8000/docs` from phone's browser
- [ ] Firewall allows connections on port 8000

## 📝 Registration Flow

### Test 1: New User Registration
1. [ ] Open app (should show login screen)
2. [ ] Tap "Sign Up" / "Create Account"
3. [ ] Enter email: `test@example.com`
4. [ ] Enter password: `password123`
5. [ ] Confirm password: `password123`
6. [ ] Tap "Create Account"
7. [ ] **Expected**: Loading indicator appears
8. [ ] **Expected**: Automatically logged in to main app
9. [ ] **Expected**: See main tabs (Income, Expenses, etc.)

**Console Logs to Check:**
```
📝 Attempting registration for: test@example.com
✅ Registration successful, saving tokens...
✅ Tokens saved, fetching profile...
✅ Profile fetched successfully: test@example.com
✅ Registration complete! User authenticated.
```

### Test 2: Duplicate Email
1. [ ] Logout from app
2. [ ] Try to register with same email again
3. [ ] **Expected**: Error message "Email already registered"

## 🔐 Login Flow

### Test 3: Successful Login
1. [ ] Open app (should show login screen)
2. [ ] Enter email: `test@example.com`
3. [ ] Enter password: `password123`
4. [ ] Tap "Login" / "Unlock"
5. [ ] **Expected**: Loading indicator appears
6. [ ] **Expected**: Automatically logged in to main app
7. [ ] **Expected**: See main tabs

**Console Logs to Check:**
```
🔐 Attempting login for: test@example.com
✅ Login successful, saving tokens...
✅ Tokens saved, fetching profile...
✅ Profile fetched successfully: test@example.com
✅ Login complete! User authenticated.
```

### Test 4: Wrong Password
1. [ ] Enter correct email
2. [ ] Enter wrong password
3. [ ] Tap "Login"
4. [ ] **Expected**: Error message "Invalid email or password"
5. [ ] **Expected**: Still on login screen

### Test 5: Wrong Email
1. [ ] Enter non-existent email
2. [ ] Enter any password
3. [ ] Tap "Login"
4. [ ] **Expected**: Error message "Invalid email or password"

## 🔄 Persistence Testing

### Test 6: App Restart (Most Important!)
1. [ ] Login to app successfully
2. [ ] Verify you're on the main screen
3. [ ] **Close app completely** (swipe away from recent apps)
4. [ ] **Reopen app**
5. [ ] **Expected**: Brief loading screen
6. [ ] **Expected**: Automatically logged in (NO login screen!)
7. [ ] **Expected**: See main tabs immediately

**Console Logs to Check:**
```
🔐 Initializing authentication...
✅ Found stored tokens, restoring session...
📡 Fetching user profile...
✅ Profile fetched successfully: test@example.com
✅ Auth initialization complete
```

### Test 7: Multiple Restarts
1. [ ] Close and reopen app 3 times
2. [ ] **Expected**: Auto-login every time
3. [ ] **Expected**: No login screen shown

### Test 8: Background/Foreground
1. [ ] Open app (logged in)
2. [ ] Press home button (app goes to background)
3. [ ] Wait 30 seconds
4. [ ] Reopen app
5. [ ] **Expected**: Still logged in
6. [ ] **Expected**: No login screen

## 🚪 Logout Flow

### Test 9: Manual Logout
1. [ ] Login to app
2. [ ] Navigate to Profile/Settings
3. [ ] Tap "Logout"
4. [ ] **Expected**: Redirected to login screen
5. [ ] **Expected**: Close and reopen app shows login screen

**Console Logs to Check:**
```
🔄 Logging out...
✅ Tokens cleared
```

### Test 10: Logout Persistence
1. [ ] Logout from app
2. [ ] Close app completely
3. [ ] Reopen app
4. [ ] **Expected**: Login screen shown
5. [ ] **Expected**: Must login again

## 🌐 Network Error Handling

### Test 11: API Server Down
1. [ ] Stop the API server
2. [ ] Try to login
3. [ ] **Expected**: Clear error message about network connection
4. [ ] **Expected**: Error mentions checking API server

### Test 12: Wrong API URL
1. [ ] Edit `.env` with wrong IP: `EXPO_PUBLIC_API_BASE_URL=http://1.2.3.4:8000`
2. [ ] Restart Expo server
3. [ ] Try to login
4. [ ] **Expected**: Network error message
5. [ ] **Expected**: Helpful troubleshooting info

### Test 13: Network Recovery
1. [ ] Login successfully
2. [ ] Stop API server
3. [ ] Try to navigate in app
4. [ ] **Expected**: Error messages for API calls
5. [ ] Start API server again
6. [ ] Try navigation again
7. [ ] **Expected**: App works normally

## 🔄 Token Refresh Testing

### Test 14: Token Expiration (Advanced)
1. [ ] Login to app
2. [ ] Wait 31 minutes (access token expires after 30 min)
3. [ ] Make an API call (navigate to different screen)
4. [ ] **Expected**: Token automatically refreshed
5. [ ] **Expected**: No login screen shown
6. [ ] **Expected**: API call succeeds

**Console Logs to Check:**
```
🔄 Access token expired, refreshing...
✅ Token refreshed successfully
```

### Test 15: Long Inactivity
1. [ ] Login to app
2. [ ] Close app
3. [ ] Wait 8 days (refresh token expires after 7 days)
4. [ ] Open app
5. [ ] **Expected**: Login screen shown
6. [ ] **Expected**: Must login again

## 📊 Data Persistence Testing

### Test 16: User Data Persistence
1. [ ] Login to app
2. [ ] Add some income/expense entries
3. [ ] Close app completely
4. [ ] Reopen app
5. [ ] **Expected**: Auto-login
6. [ ] **Expected**: All data still there

### Test 17: Profile Changes
1. [ ] Login to app
2. [ ] Change profile settings (language, theme, etc.)
3. [ ] Close app
4. [ ] Reopen app
5. [ ] **Expected**: Settings preserved

## 🔒 Security Testing

### Test 18: Token Storage
1. [ ] Login to app
2. [ ] Check console logs
3. [ ] **Expected**: No tokens visible in logs (security)
4. [ ] **Expected**: Only success/error messages

### Test 19: Multiple Devices
1. [ ] Login on Device A
2. [ ] Login on Device B with same account
3. [ ] **Expected**: Both devices work independently
4. [ ] Logout on Device A
5. [ ] **Expected**: Device B still logged in

## 🎯 Edge Cases

### Test 20: App Reinstall
1. [ ] Login to app
2. [ ] **Uninstall app completely**
3. [ ] **Reinstall app**
4. [ ] Open app
5. [ ] **Expected**: Login screen shown (tokens cleared)
6. [ ] Login with same credentials
7. [ ] **Expected**: All backend data still there

### Test 21: Rapid Login/Logout
1. [ ] Login
2. [ ] Immediately logout
3. [ ] Immediately login again
4. [ ] Repeat 3 times
5. [ ] **Expected**: All operations work correctly

### Test 22: Invalid Token Handling
1. [ ] Login to app
2. [ ] Reset backend database (delete `dev.db`)
3. [ ] Restart API server
4. [ ] Try to use app
5. [ ] **Expected**: Redirected to login screen
6. [ ] **Expected**: Can login again

## ✅ Success Criteria

Your authentication system is working correctly if:

- ✅ Can register new users
- ✅ Can login with correct credentials
- ✅ Cannot login with wrong credentials
- ✅ **Auto-login works after app restart** (MOST IMPORTANT!)
- ✅ Logout clears session properly
- ✅ Network errors show helpful messages
- ✅ Tokens refresh automatically
- ✅ User data persists across restarts
- ✅ Security: tokens not exposed in logs

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution**: 
1. Check API server is running with `--host 0.0.0.0`
2. Verify IP address in `.env`
3. Restart Expo server after changing `.env`
4. Check firewall settings

### Issue: Login screen shows after restart
**Solution**:
1. Check console logs for errors
2. Verify tokens are being saved (check logs)
3. Try logout and login again
4. Check SecureStore is working

### Issue: "Token expired" errors
**Solution**:
1. Logout and login again
2. Check backend database wasn't reset
3. Verify token refresh is working

## 📝 Testing Notes

Date: _______________
Tester: _______________

Tests Passed: _____ / 22
Tests Failed: _____ / 22

Failed Tests:
- [ ] Test #___ : _______________
- [ ] Test #___ : _______________
- [ ] Test #___ : _______________

Notes:
_________________________________
_________________________________
_________________________________