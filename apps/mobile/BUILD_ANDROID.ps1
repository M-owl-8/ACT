# ACT Android Build Script
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('development', 'preview', 'production', 'setup')]
    [string]$Profile = 'setup'
)

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   ACT Android Build Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

switch ($Profile) {
    'setup' {
        Write-Host "Setting up EAS Build..." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Step 1: Checking EAS CLI installation..." -ForegroundColor Cyan
        
        try {
            $easVersion = eas --version
            Write-Host "EAS CLI is installed: $easVersion" -ForegroundColor Green
        }
        catch {
            Write-Host "EAS CLI not found. Installing..." -ForegroundColor Red
            npm install -g eas-cli
            Write-Host "EAS CLI installed successfully" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "Step 2: Login to EAS..." -ForegroundColor Cyan
        Write-Host "Please login with your Expo account:" -ForegroundColor Yellow
        eas login
        
        Write-Host ""
        Write-Host "Step 3: Configure EAS Build..." -ForegroundColor Cyan
        eas build:configure
        
        Write-Host ""
        Write-Host "Setup complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update app.config.js with your Expo username" -ForegroundColor White
        Write-Host "2. Run: .\BUILD_ANDROID.ps1 -Profile development" -ForegroundColor White
        Write-Host ""
    }
    
    'development' {
        Write-Host "Building Development APK..." -ForegroundColor Yellow
        Write-Host "This build includes development tools." -ForegroundColor Gray
        Write-Host ""
        
        eas build --platform android --profile development
        
        Write-Host ""
        Write-Host "Build submitted!" -ForegroundColor Green
        Write-Host "Check build status at: https://expo.dev" -ForegroundColor Cyan
        Write-Host ""
    }
    
    'preview' {
        Write-Host "Building Preview APK..." -ForegroundColor Yellow
        Write-Host "This is a production-like build for testing." -ForegroundColor Gray
        Write-Host ""
        
        eas build --platform android --profile preview
        
        Write-Host ""
        Write-Host "Build submitted!" -ForegroundColor Green
        Write-Host "Check build status at: https://expo.dev" -ForegroundColor Cyan
        Write-Host ""
    }
    
    'production' {
        Write-Host "Building Production AAB..." -ForegroundColor Yellow
        Write-Host "This build is for Google Play Store." -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Before building for production:" -ForegroundColor Yellow
        Write-Host "1. Have you updated the version in app.config.js?" -ForegroundColor White
        Write-Host "2. Have you incremented android.versionCode?" -ForegroundColor White
        Write-Host "3. Have you tested with preview build?" -ForegroundColor White
        Write-Host ""
        
        $confirm = Read-Host "Continue with production build? (y/n)"
        if ($confirm -ne 'y') {
            Write-Host "Build cancelled." -ForegroundColor Red
            exit
        }
        
        eas build --platform android --profile production
        
        Write-Host ""
        Write-Host "Build submitted!" -ForegroundColor Green
        Write-Host "Check build status at: https://expo.dev" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "After build completes:" -ForegroundColor Yellow
        Write-Host "1. Download the .aab file" -ForegroundColor White
        Write-Host "2. Upload to Google Play Console" -ForegroundColor White
        Write-Host "3. Or use: eas submit --platform android --latest" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  .\BUILD_ANDROID.ps1 -Profile setup        # Initial setup" -ForegroundColor Gray
Write-Host "  .\BUILD_ANDROID.ps1 -Profile development  # Build dev APK" -ForegroundColor Gray
Write-Host "  .\BUILD_ANDROID.ps1 -Profile preview      # Build preview APK" -ForegroundColor Gray
Write-Host "  .\BUILD_ANDROID.ps1 -Profile production   # Build production AAB" -ForegroundColor Gray
Write-Host ""
Write-Host "  eas build:list                            # View all builds" -ForegroundColor Gray
Write-Host "  eas submit --platform android --latest    # Submit to Play Store" -ForegroundColor Gray
Write-Host "  eas credentials                           # Manage credentials" -ForegroundColor Gray
Write-Host ""