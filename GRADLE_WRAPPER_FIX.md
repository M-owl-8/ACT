# Gradle Wrapper Fix for EAS Build

## Problem
The previous production AAB build failed with error:
```
ENOENT: no such file or directory, open '/home/expo/workingdir/build/apps/mobile/android/gradlew'
```

## Root Cause
The gradle wrapper files (`gradlew`, `gradlew.bat`, and `gradle/` directory) exist locally but were **gitignored** in `.gitignore`, preventing them from being uploaded to EAS during the build process.

## Solution Applied

### 1. Updated `.gitignore` (Line 10-13)
Added exceptions to allow gradle wrapper files to be tracked in git:
```gitignore
# BUT include gradle wrapper (needed for builds)
!android/gradlew
!android/gradlew.bat
!android/gradle/
```

### 2. Forced Git to Track Wrapper Files
```bash
git add -f apps/mobile/android/gradlew
git add -f apps/mobile/android/gradlew.bat
git add -f apps/mobile/android/gradle/wrapper/gradle-wrapper.jar
git add -f apps/mobile/android/gradle/wrapper/gradle-wrapper.properties
git commit -m "fix: add gradle wrapper files for EAS build support"
git push
```

### 3. Retried Production Build
New build triggered with fixed git repository including gradle wrapper files.

## What This Fixes
✅ Gradle wrapper files now available during EAS cloud build
✅ Build system can properly initialize gradle
✅ Production AAB build should complete successfully

## Files Modified
- `.gitignore` - Added !android/gradlew exceptions
- `apps/mobile/android/gradlew` - Now tracked in git
- `apps/mobile/android/gradlew.bat` - Now tracked in git
- `apps/mobile/android/gradle/wrapper/*` - Now tracked in git

## Next Steps
1. **Monitor the build** - Check EAS dashboard for completion (8-12 minutes)
2. **Download AAB** - Once complete, download from EAS dashboard
3. **Version bump** (if needed) - For production releases, increment versionCode
4. **Play Store submission** - Follow PRODUCTION_AAB_GUIDE.md for submission steps

## Important Notes
- Gradle wrapper files are **standard for gradle projects** and should always be in version control
- This prevents developers from needing to install gradle manually
- EAS needs these files to properly initialize the Android build environment
- Never gitignore: gradlew, gradlew.bat, or gradle/wrapper directory