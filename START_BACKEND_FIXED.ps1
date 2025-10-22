# Correct Backend Startup Script for Android Emulator Testing
# KEY: Binds to 0.0.0.0 so Android emulator can reach it via 10.0.2.2:8000

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 ACT Gen-1 Backend: Correct Startup (0.0.0.0)" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$apiDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"

# Kill any existing process on port 8000
Write-Host "🔍 Checking for processes on port 8000..." -ForegroundColor Yellow
$existingProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if ($existingProcess) {
    Write-Host "⚠️  Found existing process on port 8000" -ForegroundColor Yellow
    $proc = Get-Process -Id $existingProcess.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "💀 Killing: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Yellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ Killed" -ForegroundColor Green
    }
}
Write-Host ""

# Navigate to API directory
Set-Location $apiDir

# Activate venv
Write-Host "🐍 Activating Python virtual environment..." -ForegroundColor Yellow
& "$apiDir\.venv\Scripts\Activate.ps1"
Write-Host "✓ Environment activated" -ForegroundColor Green
Write-Host ""

# Ensure requirements are installed
Write-Host "📦 Verifying dependencies..." -ForegroundColor Yellow
$venvPython = "$apiDir\.venv\Scripts\python.exe"
& $venvPython -m pip install -q -r requirements.txt 2>$null
Write-Host "✓ Dependencies ready" -ForegroundColor Green
Write-Host ""

# Show connection info
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📡 Connection Information" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🖥️  Host Machine (Windows):" -ForegroundColor White
Write-Host "   http://localhost:8000" -ForegroundColor Cyan
Write-Host "   http://127.0.0.1:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 From Android Emulator:" -ForegroundColor White
Write-Host "   http://10.0.2.2:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 API Documentation:" -ForegroundColor White
Write-Host "   http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Starting FastAPI backend on 0.0.0.0:8000..." -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start backend with explicit host binding
# IMPORTANT: --host 0.0.0.0 allows connections from emulator
uvicorn main:app --reload --host 0.0.0.0 --port 8000

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ Backend server stopped" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan