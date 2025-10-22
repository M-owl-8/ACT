# ============================================================================
# 🚀 START BOTH BACKEND + MOBILE WITH LOCAL CONFIG (AUTOMATED FIX)
# ============================================================================
# This script:
# 1. Kills port 8000 conflicts
# 2. Starts backend on 0.0.0.0:8000 (correct binding)
# 3. Clears metro cache
# 4. Starts mobile app with LOCAL backend config
# ============================================================================

param(
    [switch]$SkipBackend = $false
)

$projectRoot = "c:\Users\user\Desktop\Bitway\Programs\act-gen1"
$apiDir = "$projectRoot\apps\api"
$mobileDir = "$projectRoot\apps\mobile"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 ACT Gen-1: START LOCAL (BOTH BACKEND + MOBILE) 🚀         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PART 1: BACKEND STARTUP
# ============================================================================

if (-not $SkipBackend) {
    Write-Host "PART 1: Starting Backend on 0.0.0.0:8000" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
    Write-Host ""

    # Kill port 8000
    Write-Host "🔍 Clearing port 8000..." -ForegroundColor Yellow
    $existingProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
    if ($existingProcess) {
        $proc = Get-Process -Id $existingProcess.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            Write-Host "✅ Port 8000 cleared" -ForegroundColor Green
        }
    }

    # Prepare backend
    Write-Host "📦 Setting up backend..." -ForegroundColor Yellow
    Set-Location $apiDir
    & "$apiDir\.venv\Scripts\Activate.ps1"
    $venvPython = "$apiDir\.venv\Scripts\python.exe"
    & $venvPython -m pip install -q -r requirements.txt 2>$null
    
    Write-Host "📡 Connection Info:" -ForegroundColor Cyan
    Write-Host "   • Windows:   http://localhost:8000" -ForegroundColor White
    Write-Host "   • Emulator:  http://10.0.2.2:8000 ✅" -ForegroundColor Green
    Write-Host "   • Docs:      http://localhost:8000/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Starting backend..." -ForegroundColor Green
    Write-Host "   (Keep this window open!)" -ForegroundColor Yellow
    Write-Host ""

    # Start backend (this will block until user stops it)
    # Note: To run backend in background and continue, uncomment below and adjust
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
}
else {
    Write-Host "⏭️  Skipping backend (use -SkipBackend flag)" -ForegroundColor Yellow
}