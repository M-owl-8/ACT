# ============================================
# ACT Gen-1 Backend Startup Script
# ============================================

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    ACT Gen-1 - Backend Startup         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Navigate to API directory
$apiPath = "$PSScriptRoot\apps\api"
Set-Location $apiPath

# Check if venv exists
if (-not (Test-Path ".\venv\Scripts\activate.bat")) {
    Write-Host "⚠️  Virtual environment not found. Creating..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "📦 Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\activate.bat

# Install/Update requirements
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pip install -q -r requirements.txt
Write-Host "✅ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Starting FastAPI Server..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📍 API URL: http://localhost:8000" -ForegroundColor Yellow
Write-Host "📚 Docs:    http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "❤️  Health:  http://localhost:8000/health" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Start the server with reload enabled for development
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload