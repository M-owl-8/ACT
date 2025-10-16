# ACT Gen-1 Mobile App

Personal Finance Tracker with persistent authentication and secure data storage.

## 🚀 Quick Start

### For Physical Device (USB Connection)

1. **Find your computer's IP address:**
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```
   Look for your local IP (usually starts with `192.168.` or `10.0.`)

2. **Update the `.env` file:**
   ```bash
   # Edit apps/mobile/.env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000
   ```
   Example: `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000`

3. **Start the backend API:**
   ```bash
   cd ../api
   .venv\Scripts\activate  # Windows
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   ⚠️ **Important**: Use `--host 0.0.0.0` to make it accessible from your phone!

4. **Start the mobile app:**
   ```bash
   npm install  # First time only
   npm start
   ```

5. **Scan QR code** with Expo Go app on your phone

### For Emulator/Simulator

The default configuration works out of the box:
- Android Emulator: `http://10.0.2.2:8000`
- iOS Simulator: `http://localhost:8000`

## 🔐 Authentication Features

### ✅ What's Implemented

- **Secure Login & Registration**: Email/password authentication
- **Persistent Sessions**: Stay logged in after closing the app
- **Automatic Token Refresh**: Tokens refresh automatically when expired
- **Secure Storage**: Tokens stored in encrypted storage (Expo SecureStore)
- **Auto-Login**: Automatically logs you back in on app restart
- **Session Management**: Proper logout with token revocation

### 🔄 How It Works

1. **First Time (Sign Up)**:
   - Create account with email/password
   - Backend generates access & refresh tokens
   - Tokens saved to secure storage
   - User profile fetched
   - ✅ You're logged in!

2. **Subsequent Opens**:
   - App checks for stored tokens
   - If found, fetches user profile
   - ✅ Auto-logged in (no credentials needed)

3. **Token Expiration**:
   - Access tokens expire after 30 minutes
   - Automatically refreshed in background
   - Refresh tokens last 7 days
   - After 7 days of inactivity, need to login again

4. **Logout**:
   - Tokens removed from storage
   - Backend revokes refresh token
   - Redirected to login screen

## 📱 Testing Persistence

1. Sign up or login
2. Close the app completely (swipe away from recent apps)
3. Reopen the app
4. ✅ You should be automatically logged in!

**Note**: Uninstalling the app will clear all local data (including tokens), so you'll need to login again.

## 🛠️ Troubleshooting

### "Cannot connect to server"

**Checklist:**
1. ✅ Is the API server running? (Check terminal for "Uvicorn running...")
2. ✅ Is your phone on the same WiFi as your computer?
3. ✅ Did you update `.env` with your computer's IP?
4. ✅ Did you restart the Expo server after changing `.env`?
5. ✅ Is your firewall allowing connections on port 8000?

**Quick Test:**
Open your phone's browser and go to `http://YOUR_IP:8000/docs`
- If it loads: API is accessible ✅
- If it doesn't: Network/firewall issue ❌

### "Token expired" or "Invalid token"

**Solution**: Logout and login again

**Causes**:
- Backend database was reset
- Token secret was changed
- Tokens were manually deleted

### App shows login screen after restart

**Possible causes**:
1. Tokens weren't saved properly (check console logs)
2. SecureStore isn't working (rare on physical devices)
3. Tokens expired (after 7 days)

**Solution**: Login again and check console for error messages

## 📊 Console Logs

Watch for these messages to understand what's happening:

### On App Start
```
🔐 Initializing authentication...
✅ Found stored tokens, restoring session...
📡 Fetching user profile...
✅ Profile fetched successfully: user@example.com
✅ Auth initialization complete
```

### On Login
```
🔐 Attempting login for: user@example.com
✅ Login successful, saving tokens...
✅ Tokens saved, fetching profile...
✅ Login complete! User authenticated.
```

### On Network Error
```
❌ Login error: Network Error
Cannot connect to server. Please check:
1. API server is running
2. Network connection
3. For physical devices: Configure EXPO_PUBLIC_API_BASE_URL
```

## 🏗️ Project Structure

```
src/
├── api/
│   └── client.ts          # Axios client with auth interceptors
├── screens/
│   ├── LoginScreen.tsx    # Login UI
│   ├── RegisterScreen.tsx # Registration UI
│   └── JapaneseLockScreen.tsx # Alternative login UI
├── store/
│   └── auth.ts           # Zustand auth store with persistence
└── navigation/
    └── AppNavigator.tsx  # Navigation with auth routing
```

## 🔒 Security

- **Password Hashing**: Argon2 (industry standard)
- **Token Storage**: Expo SecureStore (encrypted)
- **Token Rotation**: Refresh tokens are rotated on use
- **Token Revocation**: Logout revokes tokens on backend
- **HTTPS**: Use HTTPS in production (ngrok, etc.)

## 🎯 API Endpoints Used

- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and revoke tokens
- `GET /users/me` - Get current user profile

## 📦 Dependencies

- **expo-secure-store**: Encrypted token storage
- **axios**: HTTP client with interceptors
- **zustand**: State management
- **react-hook-form**: Form handling
- **@react-navigation**: Navigation

## 🚀 Deployment Notes

### For Production

1. **Use HTTPS**: Never use HTTP in production
2. **Environment Variables**: Set proper API URL
3. **Token Expiration**: Consider shorter expiration times
4. **Error Tracking**: Integrate Sentry (already configured)
5. **Biometric Auth**: Consider adding fingerprint/face ID

### Using ngrok (for testing on any network)

```bash
# In API terminal
ngrok http 8000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update .env
EXPO_PUBLIC_API_BASE_URL=https://abc123.ngrok.io
```

## 📝 Development Tips

1. **Check logs**: Always watch console for auth flow
2. **Test persistence**: Close and reopen app frequently
3. **Test network errors**: Turn off API server to see error handling
4. **Test token refresh**: Wait 30+ minutes to see auto-refresh
5. **Test logout**: Ensure tokens are properly cleared

## 🎉 You're All Set!

Your authentication system is production-ready with:
- ✅ Persistent login across app restarts
- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ Proper error handling
- ✅ Network resilience

Just configure your IP address and start building! 🚀