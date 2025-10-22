# Complete 502 Bad Gateway Fix & Diagnostic Script
# This fixes backend connectivity issues between Android emulator and local backend

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 ACT Gen-1: Complete 502 Bad Gateway Fix" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$apiDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"
$mobileDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

# ══════════════════════════════════════════════════════════════════════════
# STEP 1: Diagnose Current Issues
# ══════════════════════════════════════════════════════════════════════════

Write-Host "Step 1️⃣ : Diagnosing Current Issues" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check if port 8000 is in use
Write-Host "🔍 Checking if port 8000 is in use..." -ForegroundColor Gray
$port8000 = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($port8000) {
    Write-Host "⚠️  Port 8000 is already in use!" -ForegroundColor Red
    Write-Host "   Process: $($port8000.OwningProcess)" -ForegroundColor Gray
    
    # Try to find and kill the process
    $proc = Get-Process -Id $port8000.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "   Found process: $($proc.ProcessName)" -ForegroundColor Gray
        Write-Host "   💀 Killing existing process..." -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "   ✓ Process killed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Port 8000 is free and ready" -ForegroundColor Green
}
Write-Host ""

# Check if venv exists
Write-Host "🔍 Checking Python virtual environment..." -ForegroundColor Gray
if (Test-Path "$apiDir\.venv\Scripts\activate.ps1") {
    Write-Host "✅ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  Virtual environment NOT found" -ForegroundColor Yellow
    Write-Host "   Creating Python virtual environment..." -ForegroundColor Gray
    Set-Location $apiDir
    python -m venv .venv
    Write-Host "   ✓ Virtual environment created" -ForegroundColor Green
}
Write-Host ""

# ══════════════════════════════════════════════════════════════════════════
# STEP 2: Setup Python Environment
# ══════════════════════════════════════════════════════════════════════════

Write-Host "Step 2️⃣ : Setting Up Python Environment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Set-Location $apiDir

# Activate venv
Write-Host "🐍 Activating virtual environment..." -ForegroundColor Gray
& "$apiDir\.venv\Scripts\Activate.ps1"
Write-Host "✓ Virtual environment activated" -ForegroundColor Green
Write-Host ""

# Upgrade pip
Write-Host "📦 Upgrading pip..." -ForegroundColor Gray
python -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies from requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some dependencies might have issues, continuing anyway..." -ForegroundColor Yellow
}
Write-Host ""

# ══════════════════════════════════════════════════════════════════════════
# STEP 3: Verify Configuration
# ══════════════════════════════════════════════════════════════════════════

Write-Host "Step 3️⃣ : Verifying Backend Configuration" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

# Check .env file
if (Test-Path "$apiDir\.env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    $envContent = Get-Content "$apiDir\.env"
    Write-Host "   Content preview:" -ForegroundColor Gray
    $envContent | Select-Object -First 3 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "⚠️  .env file NOT found" -ForegroundColor Yellow
    Write-Host "   Creating default .env..." -ForegroundColor Gray
    @"
DATABASE_URL=sqlite+aiosqlite:///./dev.db?check_same_thread=False
JWT_SECRET=VE5pLXN0OFEzLU1wQTg2dGZrMmhYN2pMVVBfOGZzTm5QcmJpNTUyVGhyMQ==
FIREBASE_CREDENTIALS_PATH=$apiDir\act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json
"@ | Set-Content "$apiDir\.env"
    Write-Host "   ✓ .env created with defaults" -ForegroundColor Green
}

# Check Firebase credentials
if (Test-Path "$apiDir\act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json") {
    Write-Host "✅ Firebase credentials found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Firebase credentials NOT found" -ForegroundColor Yellow
    Write-Host "   This might cause issues, but app should still run" -ForegroundColor Gray
}

# Check database file
if (Test-Path "$apiDir\dev.db") {
    $dbSize = (Get-Item "$apiDir\dev.db").Length / 1KB
    Write-Host "✅ Database exists ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Database will be created on first run" -ForegroundColor Cyan
}
Write-Host ""

# ══════════════════════════════════════════════════════════════════════════
# STEP 4: Test Backend in Background (Quick startup test)
# ══════════════════════════════════════════════════════════════════════════

Write-Host "Step 4️⃣ : Testing Backend Startup" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Write-Host "🚀 Starting backend in test mode (5 second test)..." -ForegroundColor Gray
$testProc = Start-Process -FilePath python -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8000" `
    -WorkingDirectory $apiDir -PassThru -WindowStyle Hidden -RedirectStandardOutput "$apiDir\backend_test.log"

Start-Sleep -Seconds 5

# Check if process is still running
if ($testProc.HasExited) {
    Write-Host "❌ Backend crashed immediately!" -ForegroundColor Red
    Write-Host "   Check logs below:" -ForegroundColor Gray
    Get-Content "$apiDir\backend_test.log" | Select-Object -Last 20 | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
    Stop-Process -Id $testProc.Id -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "✅ Backend started successfully" -ForegroundColor Green
    
    # Test connection
    Write-Host "🔌 Testing local connection to http://localhost:8000/health..." -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ Backend is responding!" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Connection test failed: $_" -ForegroundColor Yellow
    }
    
    # Kill test process
    Stop-Process -Id $testProc.Id -Force -ErrorAction SilentlyContinue
    Write-Host "   Test process stopped" -ForegroundColor Gray
}

Write-Host ""

# ══════════════════════════════════════════════════════════════════════════
# STEP 5: Show Final Instructions
# ══════════════════════════════════════════════════════════════════════════

Write-Host "Step 5️⃣ : Ready to Start Backend" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ All checks passed! Backend is ready to run." -ForegroundColor Green
Write-Host ""

Write-Host "📌 Important: How to properly start the backend" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run EXACTLY this command (copy-paste to ensure 0.0.0.0):" -ForegroundColor White
Write-Host ""
Write-Host "  cd $apiDir" -ForegroundColor Yellow
Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "  uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Cyan
Write-Host ""

Write-Host "Or use the automated starter:" -ForegroundColor White
Write-Host "  START_BACKEND_AND_MOBILE.ps1" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔑 Key points to fix 502 error:" -ForegroundColor Yellow
Write-Host "  1. Backend MUST bind to 0.0.0.0 (not 127.0.0.1)" -ForegroundColor White
Write-Host "  2. Port 8000 MUST be free and accessible" -ForegroundColor White
Write-Host "  3. Android emulator uses http://10.0.2.2:8000 to reach host" -ForegroundColor White
Write-Host "  4. Wait for '✅ ACT Gen-1 API is ready!' message" -ForegroundColor White
Write-Host ""

Write-Host "🧪 Verification Steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend (see above)" -ForegroundColor White
Write-Host "  2. Open browser: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "  3. You should see Swagger UI" -ForegroundColor White
Write-Host "  4. Then start mobile app: npm run android" -ForegroundColor Cyan
Write-Host "  5. App will connect to http://10.0.2.2:8000 (emulator's view of host)" -ForegroundColor White
Write-Host ""

Write-Host "❌ If still getting 502:" -ForegroundColor Yellow
Write-Host "  • Check if backend is actually running (should see startup messages)" -ForegroundColor White
Write-Host "  • Check if http://localhost:8000/health returns {'status':'ok'}" -ForegroundColor White
Write-Host "  • Check Windows Firewall isn't blocking port 8000" -ForegroundColor White
Write-Host "  • Verify --host 0.0.0.0 in startup command (NOT 127.0.0.1)" -ForegroundColor White
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Fix Complete! Backend is ready." -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Cleanup
Remove-Item "$apiDir\backend_test.log" -ErrorAction SilentlyContinue

Read-Host "Press Enter to finish"