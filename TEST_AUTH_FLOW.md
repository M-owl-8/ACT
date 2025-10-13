# Authentication Flow Testing Guide

## ✅ Setup Complete

### Backend (FastAPI)
- **Status:** ✅ Running
- **Local URL:** http://localhost:8000
- **Public URL (ngrok):** https://turpentinic-subjacently-freddy.ngrok-free.dev
- **API Docs:** http://localhost:8000/docs

### Frontend (Expo)
- **Status:** ✅ Running
- **API Base URL:** Configured to use ngrok tunnel
- **QR Code:** Available in terminal for scanning

## 🧪 Testing the Authentication Flow

### 1. Test Registration (Create New User)

**Via Expo App:**
1. Open Expo Go on your phone and scan the QR code
2. You should see the Login screen
3. Tap "Sign Up" to go to Register screen
4. Enter:
   - Email: `test@example.com`
   - Password: `password123` (min 8 characters)
   - Confirm Password: `password123`
5. Tap "Create Account"
6. ✅ Should automatically log you in and show Profile screen

**Via API Docs (Alternative):**
1. Open http://localhost:8000/docs
2. Find `POST /auth/register`
3. Click "Try it out"
4. Enter:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. Click "Execute"
6. ✅ Should return `access_token` and `refresh_token`

### 2. Test Login (Existing User)

**Via Expo App:**
1. If logged in, tap "🚪 Logout" first
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Tap "Login"
4. ✅ Should show Profile screen with user info

**Via API Docs:**
1. Open http://localhost:8000/docs
2. Find `POST /auth/login`
3. Enter same credentials
4. ✅ Should return tokens

### 3. Test Profile Fetch (GET /users/me)

**Via Expo App:**
- Profile screen automatically fetches and displays:
  - ✅ Email
  - ✅ Account Type (Admin/User)
  - ✅ Language
  - ✅ Name (if set)

**Via API Docs:**
1. First, login to get a token
2. Click "Authorize" button (top right)
3. Enter: `Bearer YOUR_ACCESS_TOKEN`
4. Find `GET /users/me`
5. Click "Try it out" → "Execute"
6. ✅ Should return user profile data

### 4. Test Token Refresh

**Automatic (via Expo App):**
- The app automatically refreshes tokens when they expire
- This happens in the background via axios interceptor
- ✅ You should never see "Session expired" errors

**Manual Test (via API Docs):**
1. Get a refresh token from login/register
2. Find `POST /auth/refresh`
3. Enter:
   ```json
   {
     "refresh_token": "YOUR_REFRESH_TOKEN"
   }
   ```
4. ✅ Should return new access_token and refresh_token

### 5. Test Logout

**Via Expo App:**
1. On Profile screen, tap "🚪 Logout"
2. ✅ Should return to Login screen
3. ✅ Tokens should be cleared from secure storage

**Via API Docs:**
1. Find `POST /auth/logout`
2. Enter your refresh_token
3. ✅ Token should be revoked on backend

### 6. Test Session Persistence

**Via Expo App:**
1. Login to the app
2. Close the app completely (swipe away)
3. Reopen the app
4. ✅ Should automatically restore session and show Profile screen
5. ✅ No need to login again

## 🎨 Features Implemented

### ✅ Auth Store (`src/store/auth.ts`)
- Token management with SecureStore
- Automatic session restoration
- Profile fetching
- Logout with backend token revocation
- Error handling

### ✅ Login Screen (`src/screens/LoginScreen.tsx`)
- Email/password validation
- Form validation with react-hook-form
- Loading states
- Error messages
- Navigation to Register

### ✅ Register Screen (`src/screens/RegisterScreen.tsx`)
- Email/password validation
- Password confirmation
- Minimum password length (8 chars)
- Form validation
- Auto-login after registration

### ✅ Profile Screen (`src/screens/ProfileScreen.tsx`)
- Display user info
- Edit name functionality
- Logout button
- Bearer token authentication

### ✅ Navigation (`src/navigation/AppNavigator.tsx`)
- Conditional rendering (Auth vs App flow)
- No headers on auth screens
- Styled header on Profile screen

### ✅ API Client (`src/api/client.ts`)
- Automatic Bearer token injection
- Token refresh on 401 errors
- Request queue during refresh
- ngrok header bypass

### ✅ Japanese Night Backdrop
- Beautiful animated background
- Used on welcome screen
- Can be applied to other screens

## 🔧 Configuration

### Environment Variables
```
EXPO_PUBLIC_API_BASE_URL=https://turpentinic-subjacently-freddy.ngrok-free.dev
```

### API Endpoints Used
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login existing user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Revoke refresh token
- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update user profile

## 🐛 Troubleshooting

### "Network Error" on Login/Register
- ✅ Check if API is running: http://localhost:8000
- ✅ Check if ngrok tunnel is active
- ✅ Verify .env has correct ngrok URL
- ✅ Restart Expo: Press `r` in terminal

### "Invalid credentials" Error
- ✅ Make sure you registered the user first
- ✅ Check password is at least 8 characters
- ✅ Email format is valid

### Session Not Persisting
- ✅ Check SecureStore permissions
- ✅ Look for errors in console logs
- ✅ Try logout and login again

### QR Code Not Scanning
- ✅ Make sure Expo Go app is installed
- ✅ Check phone and computer are on same network
- ✅ Try pressing `w` to open in web browser instead

## 📱 Testing on Different Platforms

### iOS (Physical Device)
1. Install Expo Go from App Store
2. Open Camera app
3. Scan QR code
4. ✅ Should open in Expo Go

### Android (Physical Device)
1. Install Expo Go from Play Store
2. Open Expo Go app
3. Scan QR code from app
4. ✅ Should load the app

### Web Browser
1. Press `w` in Expo terminal
2. ✅ Should open in browser at http://localhost:8081
3. Note: SecureStore may not work in web, use localStorage fallback if needed

## 🎯 Next Steps

1. ✅ Test complete auth flow end-to-end
2. ✅ Verify token refresh works automatically
3. ✅ Test session persistence after app restart
4. Add more screens (Dashboard, Entries, etc.)
5. Implement i18n language switching
6. Add theme customization
7. Implement categories and books features

## 📝 Notes

- ngrok URL is stable but will change if ngrok restarts
- For production, use a real domain name
- Consider adding biometric authentication (Face ID/Touch ID)
- Add "Remember Me" functionality if needed
- Implement password reset flow