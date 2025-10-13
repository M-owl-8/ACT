# ACT Gen-1 Project Stop Script
# This script stops all running services

Write-Host "🛑 Stopping ACT Gen-1 Project Services..." -ForegroundColor Red
Write-Host ""

# Stop Expo (Node processes)
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "🔴 Stopping Expo..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Expo stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Expo is not running" -ForegroundColor Gray
}

# Stop ngrok
$ngrokProcesses = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrokProcesses) {
    Write-Host "🔴 Stopping ngrok..." -ForegroundColor Yellow
    Stop-Process -Name ngrok -Force -ErrorAction SilentlyContinue
    Write-Host "✅ ngrok stopped" -ForegroundColor Green
} else {
    Write-Host "ℹ️  ngrok is not running" -ForegroundColor Gray
}

# Stop API (Python/uvicorn)
$pythonProcesses = Get-Process -Name python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "🔴 Stopping API..." -ForegroundColor Yellow
    # Only stop Python processes that are running uvicorn
    foreach ($proc in $pythonProcesses) {
        try {
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($proc.Id)").CommandLine
            if ($cmdLine -like "*uvicorn*") {
                Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
                Write-Host "✅ API stopped (PID: $($proc.Id))" -ForegroundColor Green
            }
        } catch {
            # Ignore errors
        }
    }
} else {
    Write-Host "ℹ️  API is not running" -ForegroundColor Gray
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "✅ All services stopped!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""
Write-Host "To start again, run: .\START_PROJECT.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")