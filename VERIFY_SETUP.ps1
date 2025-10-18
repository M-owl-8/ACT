# Verification Script: Check if everything is ready for testing and deployment

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ ACT Gen-1: Setup Verification" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Python Environment
Write-Host "1️⃣  Checking Python Environment..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($pythonVersion -match "Python 3") {
    Write-Host "   ✅ Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Python not found or wrong version" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Virtual Environment
Write-Host ""
Write-Host "2️⃣  Checking Python Virtual Environment..." -ForegroundColor Yellow
$venvPath = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\.venv"
if (Test-Path "$venvPath\Scripts\activate") {
    Write-Host "   ✅ Virtual environment exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Virtual environment not found" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Backend Dependencies
Write-Host ""
Write-Host "3️⃣  Checking Backend Dependencies..." -ForegroundColor Yellow
& "$venvPath\Scripts\activate.ps1"
$fastapi = pip show fastapi 2>&1
if ($fastapi -match "Name: fastapi") {
    Write-Host "   ✅ FastAPI installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ FastAPI not installed" -ForegroundColor Red
    $allGood = $false
}

$firebase = pip show firebase-admin 2>&1
if ($firebase -match "Name: firebase-admin") {
    Write-Host "   ✅ Firebase Admin SDK installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Firebase Admin SDK not installed" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Firebase Credentials
Write-Host ""
Write-Host "4️⃣  Checking Firebase Credentials..." -ForegroundColor Yellow
$firebaseFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json"
if (Test-Path $firebaseFile) {
    $size = (Get-Item $firebaseFile).Length
    Write-Host "   ✅ Firebase credentials file found ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Firebase credentials file not found" -ForegroundColor Red
    Write-Host "      Expected at: $firebaseFile" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Node.js and npm
Write-Host ""
Write-Host "5️⃣  Checking Node.js & npm..." -ForegroundColor Yellow
$nodeVersion = node --version 2>&1
if ($nodeVersion -match "v") {
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    $allGood = $false
}

$npmVersion = npm --version 2>&1
if ($npmVersion -match "\.") {
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check 6: Mobile Dependencies
Write-Host ""
Write-Host "6️⃣  Checking Mobile Dependencies..." -ForegroundColor Yellow
$mobilePackage = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\package.json"
if (Test-Path $mobilePackage) {
    Write-Host "   ✅ package.json exists" -ForegroundColor Green
    
    $nodeModules = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\node_modules"
    if (Test-Path $nodeModules) {
        $moduleCount = @(Get-ChildItem $nodeModules).Count
        Write-Host "   ✅ node_modules installed ($moduleCount packages)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  node_modules not installed (run 'npm install' in mobile dir)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ package.json not found" -ForegroundColor Red
    $allGood = $false
}

# Check 7: Railway CLI
Write-Host ""
Write-Host "7️⃣  Checking Railway CLI..." -ForegroundColor Yellow
$railway = railway --version 2>&1
if ($railway -match "railway") {
    Write-Host "   ✅ Railway CLI: $railway" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Railway CLI not installed (will install if needed)" -ForegroundColor Yellow
}

# Check 8: Backend Configuration
Write-Host ""
Write-Host "8️⃣  Checking Backend Configuration..." -ForegroundColor Yellow
$envFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\.env"
if (Test-Path $envFile) {
    Write-Host "   ✅ .env configuration file exists" -ForegroundColor Green
    
    $content = Get-Content $envFile
    if ($content -match "DATABASE_URL") {
        Write-Host "   ✅ DATABASE_URL configured" -ForegroundColor Green
    }
    if ($content -match "JWT_SECRET") {
        Write-Host "   ✅ JWT_SECRET configured" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
    $allGood = $false
}

# Check 9: Database
Write-Host ""
Write-Host "9️⃣  Checking Database..." -ForegroundColor Yellow
$dbFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\dev.db"
if (Test-Path $dbFile) {
    $size = (Get-Item $dbFile).Length / 1MB
    Write-Host "   ✅ SQLite database exists ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  SQLite database not found (will be created on first run)" -ForegroundColor Yellow
}

# Check 10: Port Availability
Write-Host ""
Write-Host "🔟 Checking Port 8000 Availability..." -ForegroundColor Yellow
$port8000 = netstat -ano 2>&1 | findstr ":8000"
if ($port8000) {
    Write-Host "   ⚠️  Port 8000 is in use (something already running)" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Port 8000 is available" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You're ready to:" -ForegroundColor Green
    Write-Host "  1. Run: .\QUICK_START_LOCAL_TEST.ps1" -ForegroundColor Gray
    Write-Host "  2. Or: .\RAILWAY_DEPLOYMENT_SETUP.ps1" -ForegroundColor Gray
} else {
    Write-Host "❌ SOME ISSUES FOUND" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues marked with ❌ above" -ForegroundColor Red
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan