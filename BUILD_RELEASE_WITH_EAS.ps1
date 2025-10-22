#!/usr/bin/env pwsh
<#
    BUILD_RELEASE_WITH_EAS.ps1
    Builds ACT app release AAB for Google Play Store using EAS Build
    
    Prerequisites:
    - EAS CLI installed: npm install -g eas-cli
    - Expo account created at https://expo.dev
    - Logged in: eas login
#>

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ACT APP - BUILDING RELEASE WITH EAS BUILD              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Run this from: c:\work\act-gen1\apps\mobile" -ForegroundColor Yellow
    exit 1
}

# Step 1: Check EAS CLI is installed
Write-Host "Step 1: Checking EAS CLI..." -ForegroundColor Yellow
$easVersion = eas --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ EAS CLI not installed" -ForegroundColor Red
    Write-Host "Install with: npm install -g eas-cli" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ EAS CLI installed: $easVersion" -ForegroundColor Green
Write-Host ""

# Step 2: Check Expo login
Write-Host "Step 2: Checking Expo login..." -ForegroundColor Yellow
eas whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged into Expo" -ForegroundColor Red
    Write-Host "Login with: eas login" -ForegroundColor Yellow
    Write-Host "Create account at: https://expo.dev" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Expo account verified" -ForegroundColor Green
Write-Host ""

# Step 3: Build release
Write-Host "Step 3: Building release bundle for Android..." -ForegroundColor Yellow
Write-Host "⏱️  This will take 5-10 minutes..." -ForegroundColor Cyan
Write-Host ""

eas build --platform android --type app-bundle --auto-submit

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   ✅ BUILD SUCCESSFUL!                                     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your AAB file has been built and ready for Google Play Store!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📌 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Google Play Console: https://play.google.com/console" -ForegroundColor White
    Write-Host "2. Create new app named 'ACT'" -ForegroundColor White
    Write-Host "3. Upload the AAB file from EAS" -ForegroundColor White
    Write-Host "4. Fill in store listing details" -ForegroundColor White
    Write-Host "5. Submit for review" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build failed. Check error messages above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Not logged in: run 'eas login'" -ForegroundColor White
    Write-Host "- Package name conflict: check eas.json" -ForegroundColor White
    Write-Host "- Network issues: check internet connection" -ForegroundColor White
    exit 1
}