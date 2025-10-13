# ACT Gen-1 Project Startup Script
# This script starts all services needed for the project

Write-Host "🚀 Starting ACT Gen-1 Project..." -ForegroundColor Cyan
Write-Host ""

# Check if API is already running
$apiProcess = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*uvicorn*" }
if ($apiProcess) {
    Write-Host "✅ API is already running on http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "🔧 Starting FastAPI Backend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api'; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    Start-Sleep -Seconds 3
    Write-Host "✅ API started on http://localhost:8000" -ForegroundColor Green
}

Write-Host ""

# Check if ngrok is already running
$ngrokProcess = Get-Process -Name ngrok -ErrorAction SilentlyContinue
if ($ngrokProcess) {
    Write-Host "✅ ngrok tunnel is already running" -ForegroundColor Green
    Write-Host "   Check tunnel URL at: http://localhost:4041" -ForegroundColor Gray
} else {
    Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 8000"
    Start-Sleep -Seconds 3
    Write-Host "✅ ngrok tunnel started" -ForegroundColor Green
    Write-Host "   View tunnel details at: http://localhost:4041" -ForegroundColor Gray
}

Write-Host ""

# Check if Expo is already running
$expoProcess = Get-Process -Name node -ErrorAction SilentlyContinue
if ($expoProcess) {
    Write-Host "✅ Expo is already running" -ForegroundColor Green
} else {
    Write-Host "📱 Starting Expo Development Server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile'; npx expo start"
    Start-Sleep -Seconds 5
    Write-Host "✅ Expo started" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 All services are running!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Service URLs:" -ForegroundColor White
Write-Host "   • API (Local):    http://localhost:8000" -ForegroundColor Gray
Write-Host "   • API Docs:       http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "   • ngrok Dashboard: http://localhost:4041" -ForegroundColor Gray
Write-Host "   • Expo Web:       http://localhost:8081" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 To test on your phone:" -ForegroundColor White
Write-Host "   1. Open Expo Go app" -ForegroundColor Gray
Write-Host "   2. Scan the QR code from the Expo terminal" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Testing Guide: See TEST_AUTH_FLOW.md" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")