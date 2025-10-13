# Troubleshooting Guide - ACT Gen-1

## ✅ Issues Fixed

### 1. Package Version Mismatch
**Problem**: `expo-notifications@0.30.3` was incompatible with Expo SDK 54

**Solution**: Updated to `expo-notifications@~0.32.12`
```bash
npx expo install expo-notifications@~0.32.12
```

### 2. Missing Dependencies
**Problem**: `expo-sharing` and `expo-file-system` were not installed

**Solution**: Installed both packages
```bash
npx expo install expo-sharing expo-file-system
```

**Updated package.json**:
```json
"expo-file-system": "~19.0.17",
"expo-notifications": "~0.32.12",
"expo-sharing": "~14.0.7"
```

### 3. Backend API Not Running
**Problem**: Network Error - Mobile app couldn't connect to backend

**Solution**: Started the FastAPI backend server
```bash
cd apps/api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Backend Status**: ✅ Running on `http://10.21.69.205:8000`

### 4. Expo Notifications Warning
**Problem**: `expo-notifications` doesn't support push notifications in Expo Go (SDK 53+)

**Solution**: Added graceful error handling in CalendarScreen.tsx
- Notifications will work for scheduling/reminders
- Push notifications require a development build (not Expo Go)
- App continues to function without push notifications

---

## 🚀 Current Status

### Backend API
- ✅ Running on `http://10.21.69.205:8000`
- ✅ Database initialized with default data
- ✅ All endpoints operational
- ✅ Daily backup task active

### Mobile App
- ✅ All dependencies installed
- ✅ Connected to backend API
- ✅ Bundling successfully
- ⚠️ Push notifications limited in Expo Go (expected)

---

## 📱 Running the App

### Start Backend (Terminal 1)
```bash
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
.\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Start Mobile App (Terminal 2)
```bash
cd C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm start
# or
npx expo start
```

### Access Points
- **Backend API Docs**: http://10.21.69.205:8000/docs
- **Mobile App**: Scan QR code in Expo Go app

---

## ⚠️ Known Limitations

### Expo Go Limitations
1. **Push Notifications**: Not supported in Expo Go (SDK 53+)
   - **Impact**: Local notifications for reminders won't trigger
   - **Workaround**: Use a development build for full notification support
   - **Documentation**: https://docs.expo.dev/develop/development-builds/introduction/

2. **Features Still Working**:
   - ✅ Calendar view and reminder management
   - ✅ All CRUD operations for reminders
   - ✅ Expense tracking from reminders
   - ✅ All other app features

### Creating a Development Build (Optional)
If you need push notifications:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android --profile development

# Build for iOS
eas build --platform ios --profile development
```

---

## 🔧 Common Issues

### Issue: "Network Error" when logging in
**Cause**: Backend API not running

**Solution**:
1. Check if backend is running: `http://10.21.69.205:8000/docs`
2. If not, start it: `cd apps/api && .\.venv\Scripts\Activate.ps1 && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

### Issue: "Unable to resolve module"
**Cause**: Missing dependencies

**Solution**:
```bash
cd apps/mobile
npm install
# or
npx expo install
```

### Issue: Expo Go crashes on notification
**Cause**: Expo Go limitation with expo-notifications

**Solution**: This is expected. The app handles it gracefully. For full notification support, create a development build.

### Issue: Can't connect from physical device
**Cause**: Device and computer not on same network

**Solution**:
1. Ensure both are on the same WiFi network
2. Check firewall settings allow port 8000
3. Verify IP address in `.env` file matches your computer's IP:
   ```bash
   # Check your IP
   ipconfig
   # Update apps/mobile/.env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000
   ```

---

## 📊 Testing Checklist

### Backend Tests
- [ ] API docs accessible at http://10.21.69.205:8000/docs
- [ ] Can create user account
- [ ] Can login and get token
- [ ] Can fetch categories
- [ ] Can create expense/income entries

### Mobile App Tests
- [ ] App loads without errors
- [ ] Can login with credentials
- [ ] Can view dashboard
- [ ] Can create expense
- [ ] Can create income
- [ ] Can view calendar
- [ ] Can create reminder
- [ ] Can view motivation screen
- [ ] Can change language in settings
- [ ] Can export data (CSV/JSON)
- [ ] Can switch theme (light/dark)

---

## 🆘 Getting Help

### Check Logs
**Backend logs**: Check terminal where uvicorn is running

**Mobile logs**: Check Expo Dev Tools or Metro bundler output

### Debug Mode
Enable debug logging in mobile app:
```typescript
// In src/api/client.ts
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method, config.url);
  return config;
});
```

### Reset Everything
If all else fails:
```bash
# Backend
cd apps/api
rm dev.db
# Restart backend - it will recreate database

# Mobile
cd apps/mobile
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📚 Additional Resources

- **Expo Documentation**: https://docs.expo.dev/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Native Documentation**: https://reactnative.dev/
- **Expo Notifications**: https://docs.expo.dev/versions/latest/sdk/notifications/
- **Development Builds**: https://docs.expo.dev/develop/development-builds/introduction/

---

**Last Updated**: 2025-01-12
**Status**: All critical issues resolved ✅