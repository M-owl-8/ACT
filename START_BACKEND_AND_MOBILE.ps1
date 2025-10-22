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

# Kill any existing process on port 8000
Write-Host ""
Write-Host "🔍 Checking port 8000..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($existingProcess) {
    $proc = Get-Process -Id $existingProcess.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "   Killing existing process: $($proc.ProcessName)" -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Start backend in a new window
Write-Host ""
Write-Host "🔧 Starting Backend API Server..." -ForegroundColor Yellow
Write-Host "   Host URL: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Emulator URL: http://10.0.2.2:8000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Gray

$backendScript = @"
Set-Location 'c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api'
.\.venv\Scripts\Activate.ps1
Write-Host ''
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '🚀 FastAPI Backend Starting' -ForegroundColor Green
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Access from Host: http://localhost:8000' -ForegroundColor Cyan
Write-Host 'Access from Emulator: http://10.0.2.2:8000' -ForegroundColor Cyan
Write-Host 'API Docs: http://localhost:8000/docs' -ForegroundColor Green
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test backend health
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -TimeoutSec 5
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
Write-Host ''
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host '📱 Starting Expo Mobile App' -ForegroundColor Green
Write-Host '════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Backend API: http://10.0.2.2:8000' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Press one of the options below:' -ForegroundColor Yellow
Write-Host '  a - Open on Android emulator' -ForegroundColor Gray
Write-Host '  i - Open on iOS simulator' -ForegroundColor Gray
Write-Host '  w - Open in web browser' -ForegroundColor Gray
Write-Host ''
npx expo start --clear
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $mobileScript

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Both servers are starting!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Quick Reference:" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔌 From Your Computer:" -ForegroundColor White
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 From Android Emulator:" -ForegroundColor White
Write-Host "   Backend API: http://10.0.2.2:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📡 Connection Breakdown:" -ForegroundColor Yellow
Write-Host "   • Backend bound to: 0.0.0.0:8000 (all interfaces)" -ForegroundColor Gray
Write-Host "   • You access via: localhost:8000" -ForegroundColor Gray
Write-Host "   • Emulator accesses via: 10.0.2.2:8000 (special emulator IP)" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Quick Test in PowerShell:" -ForegroundColor Cyan
Write-Host "   Invoke-RestMethod -Uri 'http://localhost:8000/health'" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Testing in App:" -ForegroundColor Cyan
Write-Host "   1. Wait for app to load in emulator" -ForegroundColor Gray
Write-Host "   2. Click 'Sign Up'" -ForegroundColor Gray
Write-Host "   3. Enter email and password" -ForegroundColor Gray
Write-Host "   4. Should create account (NO 502 errors)" -ForegroundColor Gray
Write-Host ""
Write-Host "⚙️  If you get 502 errors:" -ForegroundColor Yellow
Write-Host "   • Make sure backend window shows 'ACT Gen-1 API is ready!'" -ForegroundColor Gray
Write-Host "   • Run: .\FIX_502_FOREVER.ps1 to diagnose" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 To stop servers:" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C in each PowerShell window" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Happy coding!" -ForegroundColor Green