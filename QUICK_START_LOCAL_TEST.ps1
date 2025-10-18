# Quick Start: Local Testing (Backend + Mobile)
# This script starts both the backend and mobile app for local testing

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 ACT Gen-1: Local Testing Setup" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get user's local IP for physical device testing
Write-Host "📡 Getting your computer's IP address..." -ForegroundColor Yellow
$ipConfig = ipconfig
$ipAddress = ($ipConfig | Select-String "IPv4 Address.*: (\d+\.\d+\.\d+\.\d+)" | Select-Object -First 1).Matches.Groups[1].Value

if ($ipAddress) {
    Write-Host "✅ Your IP: $ipAddress" -ForegroundColor Green
} else {
    Write-Host "❌ Could not find IP address" -ForegroundColor Red
    $ipAddress = "192.168.1.100"
    Write-Host "   Using placeholder: $ipAddress" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 API Base URLs:" -ForegroundColor Cyan
Write-Host "   • Android Emulator: http://10.0.2.2:8000 (automatic)" -ForegroundColor Gray
Write-Host "   • iOS Simulator:    http://localhost:8000 (automatic)" -ForegroundColor Gray
Write-Host "   • Physical Device:  http://$ipAddress:8000" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to start backend
$startBackend = Read-Host "Start Backend API server? (y/n)"

if ($startBackend -eq "y" -or $startBackend -eq "Y") {
    Write-Host ""
    Write-Host "🔧 Starting Backend..." -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    # Change to API directory
    Push-Location "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"
    
    # Activate virtual environment
    Write-Host "📦 Activating Python virtual environment..." -ForegroundColor Yellow
    & .\.venv\Scripts\Activate.ps1
    
    # Start server
    Write-Host ""
    Write-Host "🚀 Starting Uvicorn server..." -ForegroundColor Green
    Write-Host "   API will be available at: http://localhost:8000" -ForegroundColor Gray
    Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
    
    Pop-Location
} else {
    Write-Host ""
    Write-Host "ℹ️  Make sure backend is already running on http://localhost:8000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📱 Starting Mobile App..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Change to mobile directory
Push-Location "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

# Ask about physical device
$usePhysicalDevice = Read-Host "Testing on physical device? (y/n)"

if ($usePhysicalDevice -eq "y" -or $usePhysicalDevice -eq "Y") {
    Write-Host ""
    Write-Host "📲 Setting up for physical device..." -ForegroundColor Yellow
    Write-Host "   Device IP will be set to: http://$ipAddress:8000" -ForegroundColor Gray
    $env:EXPO_PUBLIC_API_BASE_URL = "http://$ipAddress:8000"
    Write-Host "   Environment variable set: EXPO_PUBLIC_API_BASE_URL" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Expo development server..." -ForegroundColor Green
Write-Host "   Press 'a' for Android emulator" -ForegroundColor Gray
Write-Host "   Press 'i' for iOS simulator" -ForegroundColor Gray
Write-Host "   Press 'w' for web browser" -ForegroundColor Gray
Write-Host "   Scan QR code for physical device" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm start

Pop-Location