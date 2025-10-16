# 🚀 How to Build a TRUE Standalone APK

## ❌ The Problem

The current APK you installed contains `expo-dev-client`, which is a **development tool** that requires connecting to a Metro bundler. This is why you see the "Enter URL or scan QR code" screen.

## ✅ The Solution: Use EAS Build (FREE!)

Expo provides a **FREE cloud build service** that creates proper standalone APKs. Here's how:

---

## 📋 Step-by-Step Instructions

### **Step 1: Install EAS CLI**

```powershell
npm install -g eas-cli
```

### **Step 2: Login to Expo**

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Login (create free account if needed)
eas login
```

If you don't have an account:
- Go to https://expo.dev
- Click "Sign Up" (it's FREE!)
- Use your email or GitHub

### **Step 3: Configure the Project**

```powershell
# Link project to your Expo account
eas build:configure
```

This will:
- Create/update `eas.json`
- Link the project to your Expo account

### **Step 4: Build Standalone APK**

```powershell
# Build APK on Expo's servers (FREE!)
eas build --platform android --profile preview
```

**What happens:**
1. Your code is uploaded to Expo's servers
2. They build a proper standalone APK (takes ~10-15 minutes)
3. You get a download link

### **Step 5: Download & Install**

Once the build completes:
1. You'll get a download link in the terminal
2. Download the APK to your Desktop
3. Transfer to your phone and install

**This APK will be a TRUE standalone app** - no laptop, no WiFi, no connection needed!

---

## 🎯 Alternative: Remove Dev Client (Advanced)

If you want to build locally without EAS, you need to remove `expo-dev-client`:

### **Step 1: Remove Dev Client**

```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Remove expo-dev-client
npm uninstall expo-dev-client expo-dev-launcher expo-dev-menu expo-dev-menu-interface
```

### **Step 2: Update app.config.js**

Remove these lines from `app.config.js`:
```javascript
// Remove this if it exists:
developmentClient: true
```

### **Step 3: Rebuild**

```powershell
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android --variant release
```

**Problem:** This will likely fail on Windows due to the long path issue we encountered earlier.

---

## 🏆 Recommended Approach: EAS Build

**Why EAS Build is better:**
- ✅ Works on Windows (builds happen in cloud)
- ✅ No long path issues
- ✅ Creates proper standalone APK
- ✅ FREE for personal use
- ✅ Handles all the complexity
- ✅ Can build for both Android and iOS

**Cost:** FREE
- Free tier: Unlimited builds for personal projects
- No credit card required

---

## 📱 What You'll Get

After using EAS Build, your APK will:
- ✅ Open directly to login screen (no dev menu)
- ✅ Work completely offline
- ✅ No laptop needed
- ✅ No WiFi needed
- ✅ Be a true standalone app

---

## 🐛 Troubleshooting

### "Not logged in"
```powershell
eas login
```

### "Project not configured"
```powershell
eas build:configure
```

### "Build failed"
- Check the build logs in the terminal
- Most common issue: Missing credentials (EAS will guide you)

---

## ⚡ Quick Start (Copy-Paste)

```powershell
# 1. Install EAS CLI
npm install -g eas-cli

# 2. Navigate to project
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# 3. Login
eas login

# 4. Configure
eas build:configure

# 5. Build
eas build --platform android --profile preview

# 6. Wait for build to complete (~10-15 minutes)
# 7. Download APK from the link provided
# 8. Install on your phone
# 9. Enjoy your standalone app! 🎉
```

---

## 💡 Pro Tips

1. **First build takes longer** (~15 mins), subsequent builds are faster (~5-10 mins)
2. **You can close the terminal** - build continues in cloud
3. **Check build status** at https://expo.dev/accounts/[your-username]/projects/act-app/builds
4. **Download APK anytime** from the Expo dashboard

---

## 🎊 That's It!

This is the **official, recommended way** to build standalone Expo apps. It's what professional developers use, and it's completely FREE for personal projects.

No more dev client, no more connection screens - just a pure standalone app! 🚀