#!/usr/bin/env pwsh
# Start Backend API Server

$API_DIR = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"
$VENV_ACTIVATE = Join-Path $API_DIR ".venv\Scripts\Activate.ps1"

Write-Host "🚀 Starting Backend API Server..." -ForegroundColor Green
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path $VENV_ACTIVATE)) {
    Write-Host "❌ Virtual environment not found at: $VENV_ACTIVATE" -ForegroundColor Red
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    Set-Location $API_DIR
    python -m venv .venv
    & $VENV_ACTIVATE
    pip install -r requirements.txt
}

# Activate virtual environment and start server
Set-Location $API_DIR
& $VENV_ACTIVATE

Write-Host "✅ Virtual environment activated" -ForegroundColor Green
Write-Host "🔥 Starting FastAPI server on http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000