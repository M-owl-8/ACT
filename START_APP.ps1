#!/usr/bin/env pwsh
# ACT Gen-1 Application Startup Script
# This script starts both the backend API and mobile app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACT Gen-1 Application Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$ROOT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$API_DIR = Join-Path $ROOT_DIR "apps\api"
$MOBILE_DIR = Join-Path $ROOT_DIR "apps\mobile"

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Function to start the backend
function Start-Backend {
    Write-Host "🚀 Starting Backend API..." -ForegroundColor Green
    
    # Check if port 8000 is already in use
    if (Test-Port -Port 8000) {
        Write-Host "✅ Backend is already running on port 8000" -ForegroundColor Yellow
        return $true
    }
    
    # Check if virtual environment exists
    $venvPath = Join-Path $API_DIR ".venv\Scripts\Activate.ps1"
    if (-not (Test-Path $venvPath)) {
        Write-Host "❌ Virtual environment not found. Creating..." -ForegroundColor Red
        Set-Location $API_DIR
        python -m venv .venv
        & $venvPath
        pip install -r requirements.txt
    }
    
    # Start the backend in a new window
    Write-Host "📦 Starting FastAPI server on http://localhost:8000" -ForegroundColor Cyan
    $backendScript = @"
Set-Location '$API_DIR'
& '$venvPath'
Write-Host '🔥 Backend API is running on http://localhost:8000' -ForegroundColor Green
Write-Host '📚 API Docs: http://localhost:8000/docs' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Press Ctrl+C to stop the server' -ForegroundColor Yellow
uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    
    # Wait for backend to start
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    while (-not (Test-Port -Port 8000) -and $attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        $attempt++
        Write-Host "." -NoNewline
    }
    Write-Host ""
    
    if (Test-Port -Port 8000) {
        Write-Host "✅ Backend started successfully!" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Backend failed to start" -ForegroundColor Red
        return $false
    }
}

# Function to start the mobile app
function Start-Mobile {
    Write-Host ""
    Write-Host "📱 Starting Mobile App..." -ForegroundColor Green
    
    # Check if node_modules exists
    $nodeModulesPath = Join-Path $MOBILE_DIR "node_modules"
    if (-not (Test-Path $nodeModulesPath)) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        Set-Location $MOBILE_DIR
        npm install
    }
    
    # Start the mobile app
    Write-Host "🎨 Starting Expo development server..." -ForegroundColor Cyan
    Set-Location $MOBILE_DIR
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  🎉 Application is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test Credentials:" -ForegroundColor Yellow
    Write-Host "  Email: admin@actgen1.com" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "Press 'i' for iOS simulator" -ForegroundColor Magenta
    Write-Host "Press 'a' for Android emulator" -ForegroundColor Magenta
    Write-Host "Press 'w' for web browser" -ForegroundColor Magenta
    Write-Host ""
    
    npm start
}

# Main execution
try {
    # Start backend
    $backendStarted = Start-Backend
    
    if (-not $backendStarted) {
        Write-Host ""
        Write-Host "⚠️  Backend failed to start. Do you want to continue with mobile app only? (y/n)" -ForegroundColor Yellow
        $response = Read-Host
        if ($response -ne 'y') {
            Write-Host "❌ Startup cancelled" -ForegroundColor Red
            exit 1
        }
    }
    
    # Start mobile app
    Start-Mobile
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    exit 1
}