# Start Fixed App Script
# This script starts both the backend and the fixed mobile app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACT Gen-1 - Start Fixed App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "apps\mobile\package.json")) {
    Write-Host "❌ Error: Must run from project root (act-gen1)" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ In correct directory" -ForegroundColor Green
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Check if backend is running
Write-Host "Checking backend status..." -ForegroundColor Yellow
if (Test-Port 8000) {
    Write-Host "✅ Backend is already running on port 8000" -ForegroundColor Green
} else {
    Write-Host "⚠️ Backend is not running" -ForegroundColor Yellow
    Write-Host "Starting backend..." -ForegroundColor Yellow
    
    # Start backend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\apps\api'; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    
    Write-Host "✅ Backend started in new window" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting Mobile App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile directory
Set-Location "apps\mobile"

Write-Host "📱 Starting Expo..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "1. Start Metro bundler only (then run on device)" -ForegroundColor White
Write-Host "2. Build and run on Android emulator" -ForegroundColor White
Write-Host "3. Build and run on connected Android device" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Starting Metro bundler..." -ForegroundColor Yellow
        npx expo start
    }
    "2" {
        Write-Host ""
        Write-Host "Building and running on Android emulator..." -ForegroundColor Yellow
        Write-Host "This may take a few minutes..." -ForegroundColor Yellow
        npx expo run:android
    }
    "3" {
        Write-Host ""
        Write-Host "Building and running on connected device..." -ForegroundColor Yellow
        Write-Host "Make sure your device is connected via USB with USB debugging enabled" -ForegroundColor Yellow
        npx expo run:android --device
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Starting Metro bundler..." -ForegroundColor Yellow
        npx expo start
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  App Started!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "To test the fix:" -ForegroundColor Yellow
Write-Host "1. Open the app on your device" -ForegroundColor White
Write-Host "2. Navigate to the login screen" -ForegroundColor White
Write-Host "3. Verify no crashes occur" -ForegroundColor White
Write-Host "4. Check the glass card effect" -ForegroundColor White
Write-Host ""