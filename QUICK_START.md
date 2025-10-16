# 🚀 Quick Start Guide - ACT Gen-1

Get your app running on your phone in 5 minutes!

## Step 1: Find Your IP Address (30 seconds)

**Windows:**
1. Open Command Prompt
2. Run: `ipconfig`
3. Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Or use the helper script:**
```bash
# Double-click this file:
get-ip.bat
```

## Step 2: Configure Mobile App (1 minute)

1. Open: `act-gen1\apps\mobile\.env`
2. Find the line: `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000`
3. Change it to: `EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000`
   
   Example: `EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000`

4. Save the file

## Step 3: Start Backend API (1 minute)

**Option A - Use the helper script:**
```bash
# Double-click this file:
apps\api\start-for-mobile.bat
```

**Option B - Manual:**
```bash
cd act-gen1\apps\api
.venv\Scripts\activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ You should see: "✅ ACT Gen-1 API is ready!"

## Step 4: Start Mobile App (2 minutes)

**Open a NEW terminal:**
```bash
cd act-gen1\apps\mobile
npm start
```

✅ You should see a QR code

## Step 5: Run on Your Phone (1 minute)

1. Install **Expo Go** app from Play Store/App Store
2. Open Expo Go
3. Scan the QR code from terminal
4. Wait for app to load

✅ You should see the login screen!

## Step 6: Test It! (2 minutes)

1. **Sign Up**: Create a new account
   - Email: `test@example.com`
   - Password: `password123`

2. **Verify Auto-Login**:
   - Close the app completely (swipe away)
   - Reopen the app
   - ✅ You should be automatically logged in!

## 🎉 Success!

If you see the main app screen after reopening, **everything is working!**

Your app now has:
- ✅ Persistent login (stays logged in after closing)
- ✅ Secure token storage
- ✅ Automatic token refresh
- ✅ Full authentication system

## 🐛 Troubleshooting

### "Cannot connect to server"

**Quick Fix:**
1. Open phone's browser
2. Go to: `http://YOUR_IP:8000/docs`
3. If it loads → API is accessible ✅
4. If it doesn't → Check these:
   - [ ] Both devices on same WiFi?
   - [ ] API server running?
   - [ ] Correct IP in `.env`?
   - [ ] Restarted Expo after changing `.env`?

### "Network Error" or "Timeout"

1. Check API server is running (see terminal)
2. Verify IP address: `ipconfig`
3. Restart Expo server: Ctrl+C, then `npm start`
4. Check Windows Firewall (allow Python)

### App shows login screen after restart

This means tokens weren't saved. Check:
1. Did you see "✅ Login successful" in console?
2. Any errors in console?
3. Try logging in again

## 📚 More Help

- **Full Setup Guide**: See `SETUP_GUIDE.md`
- **Testing Checklist**: See `TESTING_CHECKLIST.md`
- **Mobile README**: See `apps/mobile/README.md`

## 🎯 What's Next?

Now that authentication works, you can:
1. Add income/expense entries
2. View reports and charts
3. Set reminders
4. Read motivational content
5. Browse book recommendations

All your data will persist across app restarts! 🎉

---

**Need Help?**
- Check console logs for detailed error messages
- All logs are prefixed with emojis (🔐, ✅, ❌, etc.)
- Look for red error messages in terminal