@echo off
echo ========================================
echo   ACT Gen-1 - Start All Services
echo ========================================
echo.

echo This script will start:
echo   1. API Server (Backend)
echo   2. Mobile App (Expo Dev Server)
echo.
echo Press any key to continue...
pause >nul
echo.

REM Start API Server in new window
echo Starting API Server...
start "ACT API Server" cmd /k "cd apps\api && .venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 3 >nul
echo ✓ API Server started in new window
echo.

REM Wait a bit for API to initialize
echo Waiting for API to initialize...
timeout /t 5 >nul
echo.

REM Start Mobile App in new window
echo Starting Mobile App...
start "ACT Mobile App" cmd /k "cd apps\mobile && npm start"
echo ✓ Mobile App started in new window
echo.

echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo API Server: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Mobile App: Check the Expo Dev Server window
echo.
echo To stop services:
echo   - Close the terminal windows
echo   - Or press Ctrl+C in each window
echo.
echo Press any key to exit this window...
pause >nul