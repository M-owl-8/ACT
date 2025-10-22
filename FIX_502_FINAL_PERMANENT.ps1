# ============================================================================
# 🔥 FINAL 502 FIX - PERMANENT SOLUTION 🔥
# ============================================================================
# This script fixes BOTH issues:
# 1. Backend not binding to 0.0.0.0
# 2. App pointing to production URL instead of local backend
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🔥 ACT Gen-1: FINAL 502 FIX - PERMANENT SOLUTION 🔥          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "c:\Users\user\Desktop\Bitway\Programs\act-gen1"
$apiDir = "$projectRoot\apps\api"
$mobileDir = "$projectRoot\apps\mobile"

# ============================================================================
# STEP 1: Kill any existing processes on port 8000
# ============================================================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "STEP 1: Clearing port 8000..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$existingProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Found process on port 8000, killing..." -ForegroundColor Yellow
    $proc = Get-Process -Id $existingProcess.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Port 8000 cleared" -ForegroundColor Green
    }
}
else {
    Write-Host "✅ Port 8000 is free" -ForegroundColor Green
}

# ============================================================================
# STEP 2: Verify Python virtual environment
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "STEP 2: Verifying Python virtual environment..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

if (!(Test-Path "$apiDir\.venv\Scripts\Activate.ps1")) {
    Write-Host "❌ Virtual environment not found, creating..." -ForegroundColor Red
    Set-Location $apiDir
    python -m venv .venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}
else {
    Write-Host "✅ Virtual environment exists" -ForegroundColor Green
}

# ============================================================================
# STEP 3: Install Python dependencies
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "STEP 3: Installing/verifying Python dependencies..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Set-Location $apiDir
& "$apiDir\.venv\Scripts\Activate.ps1"
$venvPython = "$apiDir\.venv\Scripts\python.exe"
& $venvPython -m pip install -q -r requirements.txt 2>$null
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# ============================================================================
# STEP 4: Verify mobile app .env configuration
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "STEP 4: Checking mobile app configuration..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

$envFile = "$mobileDir\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    if ($envContent -match "EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000") {
        Write-Host "✅ .env is correctly set to LOCAL backend" -ForegroundColor Green
        Write-Host "   URL: http://10.0.2.2:8000" -ForegroundColor Cyan
    }
    else {
        Write-Host "⚠️  .env is NOT set to local backend!" -ForegroundColor Red
        Write-Host "   Current: $(($envContent | Select-String 'EXPO_PUBLIC_API_BASE_URL'))" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   The file was already fixed, but you need to:" -ForegroundColor Yellow
        Write-Host "   1. Stop the metro bundler (Ctrl+C)" -ForegroundColor Yellow
        Write-Host "   2. Run: npm start --reset-cache" -ForegroundColor Yellow
        Write-Host "   3. Reinstall the app" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
}

# ============================================================================
# STEP 5: Start Backend
# ============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "STEP 5: Starting FastAPI Backend (0.0.0.0:8000)..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host ""
Write-Host "📡 Connection Information:" -ForegroundColor Cyan
Write-Host "  • Host (Windows):     http://localhost:8000" -ForegroundColor White
Write-Host "  • Host (127.0.0.1):   http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  • Emulator:           http://10.0.2.2:8000 ✅" -ForegroundColor Green
Write-Host "  • API Docs:           http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Backend is starting..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

Set-Location $apiDir
uvicorn main:app --reload --host 0.0.0.0 --port 8000

Write-Host ""
Write-Host "✅ Backend stopped" -ForegroundColor Green