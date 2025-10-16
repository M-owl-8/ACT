# ============================================
# ACT Mobile - Environment Setup Script
# ============================================
# This script sets up the correct Java environment
# for building the Android app.
#
# Usage:
#   .\setup-env.ps1
#   npm run android
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACT Mobile - Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME to correct JDK 17 location
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

Write-Host "Setting JAVA_HOME..." -ForegroundColor Yellow
$Env:JAVA_HOME = $javaHome

# Add Java bin to PATH for this session
$Env:Path = "$javaHome\bin;$Env:Path"

Write-Host "[OK] JAVA_HOME set to: $javaHome" -ForegroundColor Green
Write-Host ""

# Set ANDROID_HOME (Android SDK location)
$androidHome = "C:\Users\user\AppData\Local\Android\Sdk"

Write-Host "Setting ANDROID_HOME..." -ForegroundColor Yellow
$Env:ANDROID_HOME = $androidHome
$Env:ANDROID_SDK_ROOT = $androidHome

# Add Android tools to PATH
$platformTools = "$androidHome\platform-tools"
$Env:Path = "$platformTools;$Env:Path"

Write-Host "[OK] ANDROID_HOME set to: $androidHome" -ForegroundColor Green
Write-Host ""

# Verify Java installation
Write-Host "Verifying Java installation..." -ForegroundColor Yellow
Write-Host ""

try {
    $javaVersion = java -version 2>&1 | Select-Object -First 1
    Write-Host "[OK] Java found: $javaVersion" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Java not found!" -ForegroundColor Red
    Write-Host "Please check your Java installation." -ForegroundColor Red
    exit 1
}

# Verify Android SDK
Write-Host "Verifying Android SDK..." -ForegroundColor Yellow
if (Test-Path $androidHome) {
    Write-Host "[OK] ANDROID_HOME: $androidHome" -ForegroundColor Green
    
    # Check for platform-tools (adb)
    $adbPath = "$androidHome\platform-tools\adb.exe"
    if (Test-Path $adbPath) {
        Write-Host "[OK] ADB found" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] ADB not found in platform-tools" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Android SDK not found at $androidHome" -ForegroundColor Red
    Write-Host "  Please install Android Studio and SDK" -ForegroundColor Red
    Write-Host "  Or update the path in this script" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Environment Ready!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run:" -ForegroundColor White
Write-Host "  npm run android" -ForegroundColor Cyan
Write-Host "  npm run ios" -ForegroundColor Cyan
Write-Host "  npm start" -ForegroundColor Cyan
Write-Host ""
Write-Host "Or build release:" -ForegroundColor White
Write-Host "  cd android" -ForegroundColor Cyan
Write-Host "  .\gradlew bundleRelease" -ForegroundColor Cyan
Write-Host ""