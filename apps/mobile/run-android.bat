@echo off
echo ========================================
echo 🚀 ACT Mobile App - Android Setup & Run
echo ========================================
echo.

cd /d "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies already installed
)

if not exist "android" (
    echo 🔨 Generating native Android project...
    call npx expo prebuild --platform android
    if errorlevel 1 (
        echo ❌ Failed to generate Android project
        pause
        exit /b 1
    )
) else (
    echo ✅ Android project already exists
)

echo.
echo 🎯 Starting Android app...
echo.

call npm run android
pause