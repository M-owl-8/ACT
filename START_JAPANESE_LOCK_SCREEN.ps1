# 🌸 Japanese Lock Screen - Quick Start Script
# This script will set up and launch the ACT Gen-1 app with the new Japanese lock screen

Write-Host "🌸 ACT Gen-1 - Japanese Lock Screen Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$rootDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1"
if (-not (Test-Path $rootDir)) {
    Write-Host "❌ Error: Project directory not found!" -ForegroundColor Red
    Write-Host "Expected: $rootDir" -ForegroundColor Yellow
    exit 1
}

Set-Location $rootDir
Write-Host "✅ Project directory found" -ForegroundColor Green
Write-Host ""

# Step 1: Check Node.js
Write-Host "📦 Step 1: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Install mobile dependencies
Write-Host "📦 Step 2: Installing mobile app dependencies..." -ForegroundColor Yellow
Set-Location "$rootDir\apps\mobile"

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (this may take a few minutes)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Dependencies already installed. Checking for updates..." -ForegroundColor Cyan
    npm install
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Check if API is running
Write-Host "🔍 Step 3: Checking API server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ API server is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API server not detected" -ForegroundColor Yellow
    Write-Host "   Starting API server in background..." -ForegroundColor Cyan
    
    Set-Location "$rootDir\apps\api"
    
    # Check if virtual environment exists
    if (Test-Path ".venv") {
        Write-Host "   Activating virtual environment..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\apps\api'; .\.venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload" -WindowStyle Minimized
        Write-Host "✅ API server started in background" -ForegroundColor Green
        Start-Sleep -Seconds 3
    } else {
        Write-Host "⚠️  Virtual environment not found. Please set up API manually." -ForegroundColor Yellow
        Write-Host "   Run: cd apps\api; python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt" -ForegroundColor Cyan
    }
}
Write-Host ""

# Step 4: Display information
Write-Host "📱 Step 4: Launching mobile app..." -ForegroundColor Yellow
Set-Location "$rootDir\apps\mobile"
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🌸 JAPANESE LOCK SCREEN - READY!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What you'll see:" -ForegroundColor Cyan
Write-Host "  ✨ Animated sakura petals floating" -ForegroundColor White
Write-Host "  🎨 Beautiful gradient background" -ForegroundColor White
Write-Host "  🕐 Live clock display" -ForegroundColor White
Write-Host "  🔐 Glassmorphism login card" -ForegroundColor White
Write-Host "  🎯 Japanese aesthetic design" -ForegroundColor White
Write-Host ""
Write-Host "Test credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@actgen1.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Controls:" -ForegroundColor Cyan
Write-Host "  Press 'i' - Open iOS simulator" -ForegroundColor White
Write-Host "  Press 'a' - Open Android emulator" -ForegroundColor White
Write-Host "  Press 'w' - Open in web browser" -ForegroundColor White
Write-Host "  Press 'r' - Reload app" -ForegroundColor White
Write-Host "  Press 'q' - Quit" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  📖 JAPANESE_LOCK_SCREEN_GUIDE.md - Full guide" -ForegroundColor White
Write-Host "  🧪 TEST_JAPANESE_LOCK_SCREEN.md - Testing guide" -ForegroundColor White
Write-Host "  📊 IMPLEMENTATION_SUMMARY.md - Summary" -ForegroundColor White
Write-Host ""
Write-Host "Starting Expo dev server..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Start Expo
npm start

Write-Host ""
Write-Host "👋 Thanks for using ACT Gen-1!" -ForegroundColor Cyan