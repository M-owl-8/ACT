# Quick Start Script - Backend + Mobile App
# This script starts both the backend API and mobile app

Write-Host "🚀 ACT Gen-1 Quick Start" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if backend virtual environment exists
$venvPath = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\.venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "❌ Backend virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: cd apps\api; python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Backend virtual environment found" -ForegroundColor Green

# Start backend in a new window
Write-Host ""
Write-Host "🔧 Starting Backend API Server..." -ForegroundColor Yellow
Write-Host "   URL: http://10.21.69.205:8000" -ForegroundColor Gray
Write-Host "   Docs: http://10.21.69.205:8000/docs" -ForegroundColor Gray

$backendScript = @"
Set-Location 'c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api'
.\.venv\Scripts\Activate.ps1
Write-Host '🚀 Starting FastAPI Backend...' -ForegroundColor Cyan
Write-Host 'API URL: http://10.21.69.205:8000' -ForegroundColor Green
Write-Host 'API Docs: http://10.21.69.205:8000/docs' -ForegroundColor Green
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host ''
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend health
try {
    $response = Invoke-RestMethod -Uri "http://10.21.69.205:8000/health" -TimeoutSec 5
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend health check failed, but continuing..." -ForegroundColor Yellow
    Write-Host "   The backend might still be starting up" -ForegroundColor Gray
}

# Start mobile app in a new window
Write-Host ""
Write-Host "📱 Starting Mobile App..." -ForegroundColor Yellow

$mobileScript = @"
Set-Location 'c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile'
Write-Host '📱 Starting Expo Mobile App...' -ForegroundColor Cyan
Write-Host 'API URL: http://10.21.69.205:8000' -ForegroundColor Green
Write-Host ''
Write-Host 'Scan QR code with Expo Go app or press:' -ForegroundColor Yellow
Write-Host '  a - Open on Android emulator' -ForegroundColor Gray
Write-Host '  i - Open on iOS simulator' -ForegroundColor Gray
Write-Host '  w - Open in web browser' -ForegroundColor Gray
Write-Host ''
npx expo start --clear
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $mobileScript

Write-Host ""
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Quick Reference:" -ForegroundColor Cyan
Write-Host "   Backend API: http://10.21.69.205:8000" -ForegroundColor White
Write-Host "   API Docs: http://10.21.69.205:8000/docs" -ForegroundColor White
Write-Host "   Mobile App: Check the Expo window for QR code" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Backend:" -ForegroundColor Cyan
Write-Host "   Invoke-RestMethod -Uri 'http://10.21.69.205:8000/health'" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Test Registration:" -ForegroundColor Cyan
Write-Host "   1. Open app on device/emulator" -ForegroundColor Gray
Write-Host "   2. Click 'Create Account'" -ForegroundColor Gray
Write-Host "   3. Enter email and password" -ForegroundColor Gray
Write-Host "   4. Click 'Create Account'" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop servers:" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C in each PowerShell window" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Happy coding!" -ForegroundColor Green