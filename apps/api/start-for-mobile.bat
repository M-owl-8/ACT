@echo off
echo ========================================
echo Starting ACT Gen-1 API for Mobile Device
echo ========================================
echo.
echo This will start the API server accessible from your phone.
echo Make sure your phone is on the same WiFi network!
echo.
echo Your local IP addresses:
ipconfig | findstr /i "IPv4"
echo.
echo ========================================
echo Starting server on 0.0.0.0:8000...
echo ========================================
echo.

cd /d "%~dp0"
call .venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000