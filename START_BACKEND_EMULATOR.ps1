# Start Backend & Android Emulator for Testing
# This script runs both backend and mobile app simultaneously

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 ACT Gen-1: Backend + Emulator Launcher" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Define paths
$backendDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"
$mobileDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

# Step 1: Check if venv exists
Write-Host "Step 1️⃣ : Checking Python Virtual Environment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

$venvPath = "$backendDir\.venv"
if (-Not (Test-Path $venvPath)) {
    Write-Host "❌ Virtual environment not found at $venvPath" -ForegroundColor Red
    Write-Host "📋 Creating virtual environment..." -ForegroundColor Yellow
    
    Set-Location $backendDir
    python -m venv .venv
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Virtual environment created" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
}
Write-Host ""

# Step 2: Activate venv and install requirements
Write-Host "Step 2️⃣ : Installing/Checking Dependencies" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

Set-Location $backendDir
& "$venvPath\Scripts\Activate.ps1"

Write-Host "📋 Installing/checking requirements..." -ForegroundColor Cyan
pip install -q -r requirements.txt 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Check if .env exists
Write-Host "Step 3️⃣ : Checking Environment Configuration" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray

if (-Not (Test-Path "$backendDir\.env")) {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host "📋 Creating default .env..." -ForegroundColor Gray
    
    @"
DATABASE_URL=sqlite+aiosqlite:///./act.db
JWT_SECRET=VE5pLXN0OFEzLU1wQTg2dGZrMmhYN2pMVVBfOGZzTm5QcmJpNTUyVGhyMQ==
FIREBASE_CREDENTIALS_JSON=
BACKEND_URL=http://localhost:8000
"@ | Out-File "$backendDir\.env" -Encoding UTF8
    
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "✅ .env file found" -ForegroundColor Green
}
Write-Host ""

# Step 4: Start backend in new PowerShell window
Write-Host "Step 4️⃣ : Starting Backend Server" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "🔄 Starting uvicorn on port 8000..." -ForegroundColor Cyan

$backendScript = @"
cd '$backendDir'
`& '$venvPath\Scripts\Activate.ps1'
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Backend starting on http://localhost:8000" -ForegroundColor Green
Write-Host "📚 API docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

Start-Process powershell -ArgumentList "-NoExit -Command {$backendScript}"
Start-Sleep -Seconds 3

Write-Host "✅ Backend window opened" -ForegroundColor Green
Write-Host ""

# Step 5: Start mobile app in new PowerShell window
Write-Host "Step 5️⃣ : Starting Android Emulator & Mobile App" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "⏳ This may take 30-60 seconds..." -ForegroundColor Cyan

$mobileScript = @"
cd '$mobileDir'
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📱 Mobile App Launcher" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Starting Android emulator and building app..." -ForegroundColor Yellow
Write-Host ""
npm run android
"@

Start-Process powershell -ArgumentList "-NoExit -Command {$mobileScript}"

Write-Host "✅ Mobile app window opened" -ForegroundColor Green
Write-Host ""

# Step 6: Summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Startup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 You should now have 2 new windows:" -ForegroundColor White
Write-Host ""
Write-Host "  1️⃣  Backend Server (http://localhost:8000)" -ForegroundColor Cyan
Write-Host "     • Shows: uvicorn startup logs" -ForegroundColor Gray
Write-Host "     • Check logs for: ✅ ACT Gen-1 API is ready!" -ForegroundColor Green
Write-Host "     • Test: http://localhost:8000/docs (in browser)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2️⃣  Mobile App (Android Emulator)" -ForegroundColor Cyan
Write-Host "     • Shows: npm build logs" -ForegroundColor Gray
Write-Host "     • Wait for emulator to start (2-3 minutes)" -ForegroundColor Yellow
Write-Host "     • App will auto-load when ready" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Connection:" -ForegroundColor Cyan
Write-Host "   Android emulator connects to: http://10.0.2.2:8000" -ForegroundColor Yellow
Write-Host "   (This is the special IP that emulator uses to reach localhost)" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Wait for emulator to fully load" -ForegroundColor White
Write-Host "   2. Test login/register flow" -ForegroundColor White
Write-Host "   3. Check backend logs for any errors" -ForegroundColor White
Write-Host "   4. Close this window when done (Ctrl+C in each window)" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Keep both windows open while testing!" -ForegroundColor Yellow
Write-Host ""