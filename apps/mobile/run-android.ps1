# ACT Mobile App - Android Run Script
# This script sets up and runs the Android app

Write-Host "🚀 ACT Mobile App - Android Setup & Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile directory
Set-Location "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Check if android folder exists
if (-Not (Test-Path "android")) {
    Write-Host "🔨 Generating native Android project..." -ForegroundColor Yellow
    npx expo prebuild --platform android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Android project" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Android project already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎯 Starting Android app..." -ForegroundColor Green
Write-Host ""

# Run the app
npm run android