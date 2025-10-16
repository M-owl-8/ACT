# ACT Gen-1 Setup Guide

## Authentication & Data Persistence

Your app now has **full authentication with persistent login**! Here's how it works:

### ✅ What's Already Working

1. **Secure Token Storage**: Login tokens are stored securely using `expo-secure-store`
2. **Auto-Login**: When you reopen the app, it automatically logs you back in
3. **Data Persistence**: Your user data persists across app reinstalls (as long as you don't uninstall the app)
4. **Token Refresh**: Expired tokens are automatically refreshed in the background

### 📱 Setting Up for Physical Device (USB Connection)

Since you're using a physical device via USB, you need to configure the API URL:

#### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually something like `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for your local IP address (usually starts with `192.168.` or `10.0.`)

#### Step 2: Create `.env` File

1. Navigate to `act-gen1/apps/mobile/`
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your IP:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_HERE:8000
   ```
   Example:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
   ```

#### Step 3: Restart the App

After creating/editing `.env`, restart your Expo development server:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
```

### 🚀 Running the Full Stack

#### Terminal 1 - Start Backend API
```bash
cd act-gen1/apps/api
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Mac/Linux

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Important**: Use `--host 0.0.0.0` to make the API accessible from your phone!

#### Terminal 2 - Start Mobile App
```bash
cd act-gen1/apps/mobile
npm start
```

Then scan the QR code with Expo Go app on your phone.

### 🔐 How Authentication Works

1. **Sign Up**: 
   - User creates account
   - Backend generates access & refresh tokens
   - Tokens are saved to secure storage
   - User profile is fetched
   - User is automatically logged in

2. **Login**:
   - User enters credentials
   - Backend validates and returns tokens
   - Tokens are saved to secure storage
   - User profile is fetched
   - User is logged in

3. **App Restart**:
   - App checks secure storage for tokens
   - If found, automatically fetches user profile
   - User is logged in without entering credentials
   - If tokens are expired, they're automatically refreshed

4. **Logout**:
   - Tokens are removed from secure storage
   - User is redirected to login screen

### 🔧 Troubleshooting

#### "Cannot connect to server" Error

**Check these in order:**

1. **Is the API server running?**
   ```bash
   # Should see: "Uvicorn running on http://0.0.0.0:8000"
   ```

2. **Is your phone on the same WiFi network as your computer?**
   - Both devices must be on the same network
   - Some public/corporate WiFi networks block device-to-device communication

3. **Is the IP address correct in `.env`?**
   - Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) again
   - Your IP might change if you reconnect to WiFi

4. **Is your firewall blocking the connection?**
   - Windows: Allow Python through Windows Firewall
   - Mac: System Preferences → Security & Privacy → Firewall → Allow incoming connections

5. **Did you restart the Expo server after changing `.env`?**
   - Environment variables are only loaded on startup
   - Stop (Ctrl+C) and restart `npm start`

#### "Token expired" or "Invalid token" Error

This usually means:
- The backend database was reset
- Tokens were manually deleted
- Token secret was changed

**Solution**: Just logout and login again.

#### App Shows Login Screen After Restart

This means tokens weren't saved properly. Check:
1. Expo SecureStore is working (should work on physical devices)
2. No errors in console during login
3. Try logging in again and check console logs

### 📊 Monitoring Authentication

Watch the console logs for these messages:

**On App Start:**
```
🔐 Initializing authentication...
✅ Found stored tokens, restoring session...
📡 Fetching user profile...
✅ Profile fetched successfully: user@example.com
✅ Auth initialization complete
```

**On Login:**
```
🔐 Attempting login for: user@example.com
✅ Login successful, saving tokens...
✅ Tokens saved, fetching profile...
✅ Profile fetched successfully: user@example.com
✅ Login complete! User authenticated.
```

**On Logout:**
```
🔄 Logging out...
✅ Tokens cleared
```

### 🎯 Testing the Persistence

1. **Sign up** with a new account
2. **Close the app** completely (swipe away from recent apps)
3. **Reopen the app** - you should be automatically logged in!
4. **Uninstall and reinstall** - you'll need to login again (this is expected)

### 🔒 Security Notes

- Tokens are stored in **Expo SecureStore** (encrypted storage)
- Access tokens expire after 30 minutes (automatically refreshed)
- Refresh tokens expire after 7 days
- Passwords are hashed with Argon2 (industry standard)
- All API communication should use HTTPS in production

### 📝 Next Steps

Your authentication is now fully functional! You can:

1. ✅ Sign up once and stay logged in
2. ✅ Close and reopen the app without logging in again
3. ✅ Your data persists on the backend
4. ✅ Tokens are automatically refreshed

The only time you need to login again is:
- After explicitly logging out
- After uninstalling the app
- After tokens expire (7 days of inactivity)
- After backend database reset

Enjoy your app! 🎉