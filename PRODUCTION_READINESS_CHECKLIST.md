# 🚀 ACT Gen-1 Production Readiness Checklist

**Status**: ⚠️ NOT READY - Critical Issues Found  
**Last Updated**: 2025-01-XX  
**Target Launch**: TBD (Estimated 7-10 days from fixes)

---

## ❌ CRITICAL BLOCKERS (Must Fix Before Launch)

### 1. Backend Deployment ❌
- [ ] **Current**: Using local IP `http://10.21.69.205:8000`
- [ ] **Required**: Deploy to production HTTPS server
- [ ] **Options**:
  - Railway.app (Recommended - Free tier, easy Python deployment)
  - Render.com (Free tier available)
  - DigitalOcean App Platform ($5/month)
  - Your own VPS with domain
- [ ] **Action**: See `BACKEND_DEPLOYMENT_GUIDE.md`

### 2. Firebase Setup ❌
- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Add Android app with package name: `com.act.app`
- [ ] Download `google-services.json` to `apps/mobile/`
- [ ] Enable Firebase Cloud Messaging (FCM)
- [ ] Test push notifications
- [ ] **Action**: See `FIREBASE_SETUP_GUIDE.md`

### 3. Security Configuration ❌
- [ ] Change JWT_SECRET in production
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS only in production
- [ ] Set secure CORS origins
- [ ] **Action**: See `SECURITY_HARDENING.md`

### 4. Build Configuration ⚠️
- [ ] Fix EAS production build to use AAB (not APK)
- [ ] Set up proper versioning
- [ ] Configure ProGuard/R8 for code obfuscation
- [ ] **Action**: See fixes below

### 5. Login Issues ⚠️
- [ ] Test login flow end-to-end
- [ ] Verify token refresh works
- [ ] Test offline behavior
- [ ] Fix any network timeout issues
- [ ] **Action**: Run `TEST_LOGIN_FLOW.ps1`

---

## ⚠️ HIGH PRIORITY (Should Fix Before Launch)

### 6. Testing Coverage
- [ ] Test registration flow
- [ ] Test add income/expense
- [ ] Test reports generation
- [ ] Test CSV/JSON export
- [ ] Test calendar and reminders
- [ ] Test settings (language, currency, theme)
- [ ] Test logout and re-login
- [ ] **Action**: Run `COMPREHENSIVE_TEST.ps1`

### 7. Error Handling
- [ ] Add proper error messages for all API failures
- [ ] Handle offline mode gracefully
- [ ] Add retry logic for failed requests
- [ ] Show user-friendly error messages

### 8. Performance
- [ ] Test on low-end Android device (Android 8+)
- [ ] Optimize image assets
- [ ] Enable ProGuard for smaller APK
- [ ] Test app startup time (<3 seconds)

---

## 📋 MEDIUM PRIORITY (Nice to Have)

### 9. Analytics & Monitoring
- [ ] Set up Sentry for crash reporting
- [ ] Configure Firebase Analytics
- [ ] Add key event tracking
- [ ] Set up backend logging

### 10. Legal & Compliance
- [ ] Create Privacy Policy
- [ ] Create Terms of Service
- [ ] Add GDPR compliance (if targeting EU)
- [ ] Set up data deletion flow

### 11. Play Store Assets
- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (4-8 images)
- [ ] App description (short & full)
- [ ] Promo video (optional)

---

## 🔧 IMMEDIATE FIXES NEEDED

### Fix 1: Update EAS Configuration for AAB
**File**: `apps/mobile/eas.json`
```json
{
  "cli": { "version": ">= 13.2.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "android": { 
        "buildType": "app-bundle"  // ← Changed from "apk"
      }
    }
  }
}
```

### Fix 2: Add Production Environment Variables
**File**: `apps/mobile/.env.production` (create new)
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.act-bitway.uz
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
```

### Fix 3: Update Backend Config for Production
**File**: `apps/api/.env.production` (create new)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/actdb
JWT_SECRET=<generate-strong-secret-here>
CORS_ORIGINS=https://act-bitway.uz,https://www.act-bitway.uz
```

---

## 📊 TESTING TIMELINE

### Day 1-2: Fix Critical Issues
- Deploy backend to production
- Set up Firebase
- Fix security issues
- Update build configuration

### Day 3-4: Comprehensive Testing
- Test all features end-to-end
- Fix bugs found during testing
- Test on multiple devices
- Performance optimization

### Day 5-6: Build & Internal Testing
- Build preview APK
- Install on 3-5 test devices
- Collect feedback
- Fix critical bugs

### Day 7-8: Production Build
- Build production AAB
- Upload to Play Console (Internal Testing)
- Test with internal testers
- Monitor crash reports

### Day 9-10: Final Review & Launch
- Review all checklist items
- Submit for review
- Monitor initial rollout
- Prepare hotfix process

---

## 🎯 SUCCESS CRITERIA

Before submitting to Play Store, ensure:
- ✅ App works on Android 8+ devices
- ✅ No crashes during 30-minute test session
- ✅ All core features work (login, add entry, reports, export)
- ✅ Backend is on HTTPS with valid SSL
- ✅ Firebase notifications work
- ✅ App size < 50MB
- ✅ Startup time < 3 seconds
- ✅ Privacy policy is live
- ✅ All secrets are in environment variables
- ✅ Sentry is configured and receiving events

---

## 📞 NEXT STEPS

1. **Read this checklist completely**
2. **Run**: `.\TEST_CURRENT_STATE.ps1` to assess current status
3. **Follow**: Step-by-step guides in order:
   - `BACKEND_DEPLOYMENT_GUIDE.md`
   - `FIREBASE_SETUP_GUIDE.md`
   - `SECURITY_HARDENING.md`
   - `COMPREHENSIVE_TEST_GUIDE.md`
4. **Build**: Preview APK and test thoroughly
5. **Deploy**: Production AAB to Play Store

---

## 🆘 NEED HELP?

If you encounter issues:
1. Check `TROUBLESHOOTING.md`
2. Review error logs in `apps/mobile/logs/`
3. Check Sentry dashboard for crashes
4. Review backend logs

**Remember**: Don't rush! A buggy app will get bad reviews. Take time to test thoroughly.