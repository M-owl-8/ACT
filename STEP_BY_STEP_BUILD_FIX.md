# 🚀 STEP-BY-STEP: Fix Build & Prepare for Play Store

## ⚠️ Current Status

Your build failed because native modules weren't properly compiled. But the good news:

✅ Keystore is configured
✅ Firebase is configured  
✅ All dependencies installed
❌ **API URL is pointing to localhost (needs production URL)**
❌ **Native modules need compilation (EAS Build will handle this)**

---

## 📋 PRE-BUILD CHECKLIST

### Step 1: Set Production Backend URL

⚠️ **CRITICAL:** Your app currently connects to `http://10.21.69.205:8000` (your local dev PC). For Play Store, it needs a real production URL!

**Option A: Use Railway (Recommended)**
If your backend is deployed to Railway:
1. Go to https://railway.app
2. Find your project
3. Copy the deployment URL (looks like `https://your-app-xxxx.up.railway.app`)

**Option B: Use Your Custom Domain**
If you have your own domain:
- Use: `https://yourdomain.com`

**Option C: Use Another Service**
- Heroku, AWS, Google Cloud, Azure, etc.

---

### Step 2: Update .env for Production

**File:** `c:\work\act-gen1\apps\mobile\.env`

**Current (Development):**
```bash
EXPO_PUBLIC_API_BASE_URL=http://10.21.69.205:8000
```

**Change to (Production):**
```bash
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.com
```

**Example:**
```bash
EXPO_PUBLIC_API_BASE_URL=https://act-production-8080.up.railway.app
```

**⚠️ CRITICAL:**
- ✅ Must start with `https://` (secure)
- ✅ Must be reachable from the internet
- ❌ NOT localhost
- ❌ NOT internal IP
- ❌ NOT `http://` (must be `https://`)

---

## 🏗️ BUILD PROCESS

### Step 3: Install EAS CLI

```powershell
npm install -g eas-cli
```

Verify it worked:
```powershell
eas --version
```

Expected output: `eas/13.x.x` or higher

---

### Step 4: Create Expo Account (if needed)

1. Go to https://expo.dev
2. Click "Sign Up"
3. Enter email and create password
4. Verify email
5. Done!

---

### Step 5: Login to Expo

```powershell
eas login
```

You'll be prompted for:
- Email: Enter your Expo account email
- Password: Enter your Expo account password

Success message:
```
✅ Logged in as your-email@example.com
```

---

### Step 6: Build Release Bundle

Navigate to your mobile app directory:

```powershell
cd c:\work\act-gen1\apps\mobile
```

Build the release AAB:

```powershell
eas build --platform android --type app-bundle
```

**What will happen:**
- EAS will start building in the cloud
- You'll see progress in the terminal
- Build takes 5-10 minutes
- You'll get a download link when complete

**Example output:**
```
✅ Build finished!
📦 You can download the build from:
https://eas-builds.s3.us-west-2.amazonaws.com/builds/...
```

---

### Step 7: Download Your AAB File

1. Click the download link from the terminal
2. Or go to https://expo.dev/dashboard
3. Navigate to your project
4. Download the latest build
5. Save it to a safe location

**Output:** File named `app-release.aab` (50-150 MB)

---

## 🎯 AFTER BUILD SUCCEEDS

### Step 8: Prepare Play Store Upload

You need:
- ✅ AAB file (from Step 7)
- ✅ Google Play Console account ($25 USD)
- ✅ App screenshots (4-6 per required size)
- ✅ App icon (512x512 PNG)
- ✅ Short description (80 chars)
- ✅ Full description (4000 chars)
- ✅ Privacy policy URL

### Step 9: Create Play Console Account

1. Go to https://play.google.com/console
2. Click "Create account"
3. Pay $25 USD registration fee
4. Done! You can now upload apps

### Step 10: Create App in Play Console

1. Click "Create app"
2. App name: `ACT`
3. Default language: English (or Japanese)
4. App category: Choose appropriate category
5. Proceed through setup

### Step 11: Upload AAB File

In Play Console:
1. Go to "Internal testing"
2. Click "Create release"
3. Upload your `app-release.aab` file
4. Review version details
5. Save

### Step 12: Fill In Store Listing

1. Go to "Store listing"
2. Add screenshots
3. Add app icon
4. Add description
5. Set content rating

### Step 13: Set Up Pricing & Distribution

1. Countries: Choose where to publish
2. Pricing: Free or paid
3. Content rating: Answer questionnaire

### Step 14: Submit for Review

1. Review everything one more time
2. Click "Submit"
3. Google will review (2-4 hours)
4. Check email for approval/rejection

### Step 15: App Goes Live! 🎉

Once approved:
- ✅ App appears on Play Store
- ✅ Public download link available
- ✅ Users can download from Play Store
- ✅ Reviews & ratings tracking begins

---

## 📊 Timeline

| Step | Task | Duration |
|------|------|----------|
| 1-2 | Configure backend URL | 5 min |
| 3-5 | Setup EAS + Expo account | 10 min |
| 6-7 | Build & download AAB | 15 min |
| 8-9 | Create Play Console account | 10 min |
| 10-14 | Upload & submit to Play Store | 30 min |
| 15 | Google review | 2-4 hours |
| **TOTAL** | **All steps** | **~3 hours** |

---

## ✅ QUICK START CHECKLIST

- [ ] **Backend URL Configuration**
  - [ ] Production backend deployed (Railway, Heroku, etc.)
  - [ ] Copy backend URL
  - [ ] Update `.env` with production URL
  - [ ] Verify URL is `https://` (not `http://`)

- [ ] **EAS Setup**
  - [ ] Install EAS: `npm install -g eas-cli`
  - [ ] Create Expo account at https://expo.dev
  - [ ] Login: `eas login`

- [ ] **Build Release**
  - [ ] Navigate to: `cd c:\work\act-gen1\apps\mobile`
  - [ ] Build: `eas build --platform android --type app-bundle`
  - [ ] Wait for completion (~10 min)
  - [ ] Download AAB file

- [ ] **Play Store**
  - [ ] Create account at https://play.google.com/console ($25)
  - [ ] Create new app
  - [ ] Upload AAB file
  - [ ] Fill in store listing
  - [ ] Submit for review

---

## 🔧 TROUBLESHOOTING

### "API URL still points to localhost"
**Solution:** Edit `c:\work\act-gen1\apps\mobile\.env` and update `EXPO_PUBLIC_API_BASE_URL` to your production domain

### "eas command not found"
**Solution:** Install with `npm install -g eas-cli`

### "Not logged in to Expo"
**Solution:** Run `eas login` and enter your Expo credentials

### "Build failed: Could not resolve dependencies"
**Solution:** This shouldn't happen with EAS Build - it handles all native modules automatically. If it does, try:
```powershell
cd c:\work\act-gen1\apps\mobile
eas build --platform android --type app-bundle --clear-cache
```

### "Backend returns 404 errors in production"
**Solution:** Your production backend might have different API paths. Check:
- Backend is running on the production domain
- All endpoints match the app's API calls
- CORS is properly configured

---

## 🚀 START NOW!

### Execute This Right Now (Copy & Paste):

**Step 1: Update backend URL**
```powershell
# Edit this file and change the URL
notepad "c:\work\act-gen1\apps\mobile\.env"
```

**Step 2: Build**
```powershell
cd c:\work\act-gen1\apps\mobile
eas build --platform android --type app-bundle
```

That's it! Follow the prompts and your app will be built! 🎉

---

## 📞 Need Help?

**Backend not deployed yet?**
→ See `COMPLETE_BACKEND_DEPLOYMENT_GUIDE.md`

**Don't have Play Console account?**
→ Go to https://play.google.com/console

**App rejected by Google?**
→ Common reasons: missing privacy policy, inappropriate content, crashes

**Still having issues?**
→ Check EAS logs: `eas build:list`