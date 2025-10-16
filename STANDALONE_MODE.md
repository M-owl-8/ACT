# 📱 ACT Gen-1 Standalone Mode

## 🎯 What is Standalone Mode?

**Standalone Mode** means your app works **completely offline** - no laptop, no backend server, no WiFi needed!

All your data is stored **directly on your phone** using SQLite database.

---

## ✨ Features

✅ **No Backend Required** - Everything runs on your phone  
✅ **Works Offline** - No internet connection needed  
✅ **Persistent Data** - Your data stays on your device  
✅ **Fast & Responsive** - No network delays  
✅ **Secure** - Data encrypted on your device  
✅ **Auto-Login** - Stay logged in across app restarts  

---

## 🏗️ Architecture

### **Before (Client-Server)**
```
Phone App → WiFi → Laptop API → SQLite Database
❌ Requires laptop running
❌ Requires same WiFi network
❌ Network delays
```

### **After (Standalone)**
```
Phone App → Local SQLite Database
✅ No laptop needed
✅ No WiFi needed
✅ Instant responses
```

---

## 📦 What's Included

### **Local Database**
- **SQLite** database stored on your phone
- **Tables**: users, categories, entries, books
- **Default data**: Pre-seeded categories and sample books

### **Authentication**
- **Local user accounts** (no backend)
- **Password hashing** (SHA-256)
- **Secure storage** (Expo SecureStore)
- **Auto-login** on app restart

### **Data Persistence**
- All data saved to phone storage
- Survives app restarts
- **Note**: Data is deleted if you uninstall the app

---

## 🚀 How to Use

### **1. Build and Install**

Since we added SQLite (native module), you need to rebuild:

```powershell
# Navigate to mobile app
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Build for Android (connected via USB)
npx expo run:android
```

This will:
- Build the app with SQLite included
- Install it on your phone via USB
- Start the app automatically

### **2. Create Account**

1. Open the app on your phone
2. Tap **"Create New Account"**
3. Enter your email and password
4. Tap **"Create Account"**

Your account is created **locally on your phone**!

### **3. Use the App**

- Add income/expenses
- View reports
- Browse books
- Everything works offline!

### **4. Close and Reopen**

- Close the app completely
- Reopen it
- **You're automatically logged in!** ✨

---

## 🔒 Security

### **Password Storage**
- Passwords are **hashed** using SHA-256
- Never stored in plain text
- Cannot be recovered (only reset)

### **Data Encryption**
- User credentials stored in **Expo SecureStore**
- OS-level encryption (Keychain on iOS, KeyStore on Android)
- Protected by device lock screen

### **Local Storage**
- Database file: `act_gen1.db`
- Location: App's private storage
- Only accessible by your app

---

## 📊 Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

### **Categories Table**
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default INTEGER DEFAULT 0,
  created_at DATETIME
);
```

### **Entries Table**
```sql
CREATE TABLE entries (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')),
  description TEXT,
  date DATE NOT NULL,
  created_at DATETIME,
  updated_at DATETIME
);
```

### **Books Table**
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  cover_url TEXT,
  category TEXT,
  rating REAL,
  created_at DATETIME
);
```

---

## 🔄 Data Lifecycle

### **First Time**
1. App starts
2. Database created (`act_gen1.db`)
3. Tables created
4. Default categories seeded
5. Sample books seeded
6. Login screen shown

### **After Registration**
1. User account created in database
2. User ID saved to SecureStore
3. Default categories copied to user
4. User logged in
5. Main app shown

### **App Restart**
1. App starts
2. Database opened
3. User ID retrieved from SecureStore
4. User loaded from database
5. **Auto-logged in!**
6. Main app shown

### **Logout**
1. User taps logout
2. User ID removed from SecureStore
3. User state cleared
4. Login screen shown
5. **Data remains in database**

### **App Uninstall**
1. App uninstalled
2. **All data deleted** (database + SecureStore)
3. Fresh start on reinstall

---

## 🆚 Standalone vs Client-Server

| Feature | Standalone | Client-Server |
|---------|-----------|---------------|
| **Requires Laptop** | ❌ No | ✅ Yes |
| **Requires WiFi** | ❌ No | ✅ Yes |
| **Works Offline** | ✅ Yes | ❌ No |
| **Data Sync** | ❌ No | ✅ Yes |
| **Multi-Device** | ❌ No | ✅ Yes |
| **Cloud Backup** | ❌ No | ✅ Yes |
| **Speed** | ⚡ Instant | 🐌 Network delay |
| **Setup** | 🟢 Easy | 🟡 Complex |

---

## 🔧 Switching Between Modes

### **To Use Standalone Mode (Current)**
```typescript
// index.ts
import App from './AppStandalone';
registerRootComponent(App);
```

### **To Use Client-Server Mode**
```typescript
// index.ts
import App from './App';
registerRootComponent(App);
```

Then rebuild:
```powershell
npx expo run:android
```

---

## 🐛 Troubleshooting

### **App won't build**
```powershell
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

### **Database errors**
```powershell
# Uninstall app from phone
# Reinstall (fresh database)
npx expo run:android
```

### **Login not persisting**
- Check if SecureStore is working
- Look for errors in console logs
- Try logout and login again

### **Can't see data**
- Data is per-user
- Make sure you're logged in
- Check console logs for database errors

---

## 📱 Building for Production

### **Development Build (Current)**
```powershell
npx expo run:android
```

### **Production APK**
```powershell
# Build APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### **Google Play Store**
```powershell
# Build AAB (Android App Bundle)
cd android
./gradlew bundleRelease

# AAB location:
# android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🎯 Next Steps

1. **Build the app**: `npx expo run:android`
2. **Create an account** on your phone
3. **Add some data** (income/expenses)
4. **Close and reopen** - you'll stay logged in!
5. **Disconnect from laptop** - app still works!

---

## 💡 Future Enhancements

Possible additions for standalone mode:

- **Export/Import** - Backup data to file
- **Biometric Auth** - Fingerprint/Face ID
- **Data Encryption** - Encrypt entire database
- **Cloud Sync** - Optional sync to cloud
- **Multi-User** - Multiple accounts on one device

---

## 📚 Related Files

- **Database**: `src/services/database.ts`
- **Auth Store**: `src/store/authLocal.ts`
- **Login Screen**: `src/screens/LoginScreenStandalone.tsx`
- **Register Screen**: `src/screens/RegisterScreenStandalone.tsx`
- **Navigator**: `src/navigation/AppNavigatorStandalone.tsx`
- **App Entry**: `AppStandalone.tsx`

---

**Your app is now truly standalone!** 🎉  
No laptop, no WiFi, no backend - just your phone! 📱