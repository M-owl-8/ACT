# 📱 ACT Gen-1 Mobile App - Testing Instructions

## 🎯 Quick Start Guide

### ✅ What's Ready to Test

1. **Backend API** - Running on `http://10.21.69.205:8000`
2. **Mobile App** - Running via Expo with tunnel
3. **Authentication** - Login/Register fully functional
4. **Profile Screen** - Shows user info with "What is your name?" feature

---

## 🔐 Login Credentials

Use these credentials to log into the app:

```
Email: user@actgen1.com
Password: password123
```

---

## 📲 How to Test on Your Phone

### Step 1: Install Expo Go App
- **Android**: Download "Expo Go" from Google Play Store
- **iOS**: Download "Expo Go" from App Store

### Step 2: Scan QR Code
1. Open the PowerShell terminal where Expo is running
2. You'll see a QR code displayed in the terminal
3. **Android**: Open Expo Go app and scan the QR code
4. **iOS**: Open Camera app and scan the QR code, then tap the notification

### Step 3: Test the App

#### 🎨 Welcome Screen (2 seconds)
- Pink background with katana emoji 🗡️
- Loading animation

#### 🔑 Login Screen
- Beautiful pink gradient design
- Email field (pre-filled hint: user@actgen1.com)
- Password field
- Blue "Login" button
- "Sign Up" link at bottom

#### 👤 Profile Screen (After Login)
You'll see:
- **Welcome!** header with user emoji
- **Email**: user@actgen1.com
- **What is your name?** section
  - Click "+ Add Your Name" button
  - Enter your name
  - Click "Save"
  - Your name will be displayed
- **Account Type**: ✨ User (or 👑 Admin)
- **Language**: EN
- **Logout** button (red)

---

## 🧪 What to Test

### ✅ Working Features:
1. **Login Flow**
   - Enter email and password
   - Click Login
   - Should navigate to Profile screen

2. **Profile Display**
   - Email shown correctly
   - Can add/edit name
   - Account type displayed
   - Language preference shown

3. **Name Feature**
   - Click "+ Add Your Name"
   - Type your name
   - Click "Save"
   - Name should appear and persist

4. **Logout**
   - Click logout button
   - Should return to login screen
   - Tokens cleared from secure storage

### ⏳ Not Yet Implemented:
- Dashboard with charts
- Add/Edit/Delete expenses/income
- Categories management
- Motivation system (streaks, goals)
- Financial literacy books
- Settings (language switch, export CSV)
- Multi-language support (EN/RU/UZ)

---

## 🔧 Technical Details

### Backend API Endpoints Working:
- ✅ `POST /auth/register` - Create new account
- ✅ `POST /auth/login` - Login with email/password
- ✅ `POST /auth/logout` - Logout and revoke tokens
- ✅ `GET /users/me` - Get current user profile
- ✅ `PATCH /users/me` - Update user profile (name, language, theme)
- ✅ `GET /categories` - List all categories (16 default categories seeded)
- ✅ `GET /books` - List financial literacy books (20 books seeded)

### Database:
- SQLite database at: `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\dev.db`
- Users table includes: id, email, password_hash, name, is_admin, language, theme, currency
- Daily backups running automatically

### Mobile App Stack:
- **Framework**: React Native + Expo
- **Navigation**: React Navigation (Native Stack)
- **State Management**: Zustand
- **Forms**: React Hook Form
- **HTTP Client**: Axios with interceptors
- **Secure Storage**: Expo SecureStore (for JWT tokens)
- **i18n**: react-i18next (configured but not fully implemented)

---

## 🐛 Troubleshooting

### If login fails:
1. Check that backend API is running: `http://10.21.69.205:8000/health`
2. Verify your phone is on the same network as your computer
3. Check Expo terminal for error messages

### If QR code doesn't work:
1. Make sure Expo Go app is installed
2. Try using the tunnel URL directly from Expo terminal
3. Check firewall settings on your computer

### If name doesn't save:
1. Check internet connection
2. Look at Expo terminal for API errors
3. Verify backend is responding: Test `/users/me` endpoint

---

## 📊 Current Progress

### ✅ Completed (MVP Phase 1):
- [x] Backend API with FastAPI
- [x] User authentication (JWT)
- [x] Database models for all features
- [x] 16 default categories seeded
- [x] 20 financial literacy books seeded
- [x] Mobile app basic structure
- [x] Login/Register screens
- [x] Profile screen with name feature
- [x] Secure token storage
- [x] API client with auth interceptors
- [x] Daily database backups

### 🚧 In Progress (MVP Phase 2):
- [ ] Dashboard with charts
- [ ] Entry tracking (add/edit/delete)
- [ ] Categories CRUD
- [ ] Motivation system
- [ ] Books library UI
- [ ] Settings screen
- [ ] Multi-language support
- [ ] Export to CSV

---

## 🎨 Design Notes

**Color Scheme:**
- Primary: Pink (#FFB7C5) - Japanese-inspired
- Accent: Blue (#007AFF) - iOS standard
- Background: Light gray (#F5F5F5)
- Cards: White with subtle shadows

**Typography:**
- Headers: Bold, large (32-36px)
- Body: Regular (16-18px)
- Labels: Semi-bold (14px)

**UI Philosophy:**
- Clean, minimal Japanese-inspired design
- Card-based layouts
- Generous padding and spacing
- Smooth animations
- Emoji for visual interest

---

## 📝 Next Steps

1. **Test the current features** on your phone
2. **Provide feedback** on UI/UX
3. **Report any bugs** you encounter
4. **Suggest improvements** for the profile screen
5. **Decide priority** for next features to implement

---

## 🚀 Running the App Again

If you need to restart:

```powershell
# Start Backend API
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Start Mobile App
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npx expo start --tunnel
```

---

**Enjoy testing! 🎉**