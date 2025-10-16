@echo off
echo ========================================
echo   ACT Gen-1 API Server Startup
echo ========================================
echo.

REM Activate virtual environment
echo [1/3] Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    echo Please ensure .venv exists. Run: python -m venv .venv
    pause
    exit /b 1
)
echo ✓ Virtual environment activated
echo.

REM Check if uvicorn is installed
echo [2/3] Checking dependencies...
python -c "import uvicorn" 2>nul
if errorlevel 1 (
    echo ERROR: uvicorn not found
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)
echo ✓ Dependencies OK
echo.

REM Start the server
echo [3/3] Starting API server...
echo.
echo ========================================
echo   Server will start on http://localhost:8000
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause