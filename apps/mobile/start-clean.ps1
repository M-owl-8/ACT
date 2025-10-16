# Clean Start Script for ACT Mobile App
# This script clears cache and starts the app fresh

Write-Host "🧹 Cleaning ACT Mobile App..." -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile directory
Set-Location "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

# Kill any processes using port 8081
Write-Host "Checking for processes on port 8081..." -ForegroundColor Yellow
try {
    $process = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "✅ Killed process on port 8081" -ForegroundColor Green
    } else {
        Write-Host "✅ Port 8081 is free" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ Port 8081 is free" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Metro bundler with clean cache..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Once Metro starts, press 'a' to run on Android" -ForegroundColor Yellow
Write-Host "Or scan the QR code with Expo Go app" -ForegroundColor Yellow
Write-Host ""

# Start Expo with clean cache
npx expo start --clear