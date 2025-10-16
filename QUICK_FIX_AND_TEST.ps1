# QUICK_FIX_AND_TEST.ps1
# Quick script to fix common issues and test the app

Write-Host "🔧 ACT Gen-1 Quick Fix & Test" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$ROOT = "c:\Users\user\Desktop\Bitway\Programs\act-gen1"
$MOBILE = Join-Path $ROOT "apps\mobile"
$API = Join-Path $ROOT "apps\api"

# Step 1: Check if backend is running
Write-Host "📡 Step 1: Checking backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://10.21.69.205:8000/health" -TimeoutSec 3 -UseBasicParsing
    Write-Host "  ✅ Backend is running" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "  ❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "  Starting backend..." -ForegroundColor Yellow
    $backendRunning = $false
    
    # Start backend in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$API'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    
    Write-Host "  ⏳ Waiting for backend to start (10 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    try {
        $health = Invoke-RestMethod -Uri "http://10.21.69.205:8000/health" -TimeoutSec 3 -UseBasicParsing
        Write-Host "  ✅ Backend started successfully" -ForegroundColor Green
        $backendRunning = $true
    } catch {
        Write-Host "  ❌ Failed to start backend" -ForegroundColor Red
        Write-Host "  Please start manually:" -ForegroundColor Yellow
        Write-Host "    cd $API" -ForegroundColor White
        Write-Host "    .\.venv\Scripts\Activate.ps1" -ForegroundColor White
        Write-Host "    uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
        exit 1
    }
}
Write-Host ""

# Step 2: Test login flow
if ($backendRunning) {
    Write-Host "🔐 Step 2: Testing login flow..." -ForegroundColor Yellow
    
    $testEmail = "quicktest@actgen1.com"
    $testPassword = "QuickTest123!"
    
    # Try to register
    $registerBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "http://10.21.69.205:8000/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "  ✅ Registration successful" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  ℹ️  User already exists (OK)" -ForegroundColor Cyan
        } else {
            Write-Host "  ⚠️  Registration issue: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    # Try to login
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://10.21.69.205:8000/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "  ✅ Login successful" -ForegroundColor Green
        Write-Host "  🔑 Token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
        
        # Test profile fetch
        $headers = @{
            "Authorization" = "Bearer $($loginResponse.access_token)"
        }
        $profile = Invoke-RestMethod -Uri "http://10.21.69.205:8000/users/me" -Method Get -Headers $headers -TimeoutSec 10
        Write-Host "  ✅ Profile fetch successful" -ForegroundColor Green
        Write-Host "  👤 User: $($profile.email)" -ForegroundColor Gray
        
    } catch {
        Write-Host "  ❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Step 3: Check mobile dependencies
Write-Host "📦 Step 3: Checking mobile dependencies..." -ForegroundColor Yellow
$nodeModules = Join-Path $MOBILE "node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Dependencies not installed" -ForegroundColor Yellow
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    Set-Location $MOBILE
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to install dependencies" -ForegroundColor Red
    }
}
Write-Host ""

# Step 4: Check Firebase configuration
Write-Host "🔥 Step 4: Checking Firebase..." -ForegroundColor Yellow
$firebaseFile = Join-Path $MOBILE "google-services.json"
if (Test-Path $firebaseFile) {
    Write-Host "  ✅ Firebase configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Firebase NOT configured" -ForegroundColor Yellow
    Write-Host "  📋 To fix:" -ForegroundColor Yellow
    Write-Host "    1. Follow FIREBASE_SETUP_GUIDE.md" -ForegroundColor White
    Write-Host "    2. Download google-services.json" -ForegroundColor White
    Write-Host "    3. Place in: $MOBILE" -ForegroundColor White
}
Write-Host ""

# Step 5: Check .env configuration
Write-Host "🌍 Step 5: Checking environment..." -ForegroundColor Yellow
$envFile = Join-Path $MOBILE ".env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match '10\.21\.69\.205') {
        Write-Host "  ✅ API URL configured for local testing" -ForegroundColor Green
        Write-Host "  ⚠️  Remember to change for production!" -ForegroundColor Yellow
    } elseif ($envContent -match 'https://') {
        Write-Host "  ✅ API URL configured for production" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  API URL may need configuration" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
    Write-Host "  Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# API Configuration for ACT Gen-1
EXPO_PUBLIC_API_BASE_URL=http://10.21.69.205:8000
"@
    Set-Content -Path $envFile -Value $envContent
    Write-Host "  ✅ .env file created" -ForegroundColor Green
}
Write-Host ""

# Step 6: Summary and next steps
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

if ($backendRunning) {
    Write-Host "✅ Backend: Running" -ForegroundColor Green
} else {
    Write-Host "❌ Backend: Not running" -ForegroundColor Red
}

if (Test-Path $nodeModules) {
    Write-Host "✅ Mobile: Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "❌ Mobile: Dependencies missing" -ForegroundColor Red
}

if (Test-Path $firebaseFile) {
    Write-Host "✅ Firebase: Configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Firebase: Not configured" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "🚀 NEXT STEPS" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Start the mobile app:" -ForegroundColor White
Write-Host "   cd $MOBILE" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Test on device/emulator:" -ForegroundColor White
Write-Host "   • Press 'a' for Android" -ForegroundColor Gray
Write-Host "   • Or scan QR code with Expo Go" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Test login with:" -ForegroundColor White
Write-Host "   Email: $testEmail" -ForegroundColor Gray
Write-Host "   Password: $testPassword" -ForegroundColor Gray
Write-Host ""

Write-Host "4. If login works, test these features:" -ForegroundColor White
Write-Host "   ✓ Add income entry" -ForegroundColor Gray
Write-Host "   ✓ Add expense entry" -ForegroundColor Gray
Write-Host "   ✓ View reports" -ForegroundColor Gray
Write-Host "   ✓ Export data" -ForegroundColor Gray
Write-Host "   ✓ Set reminder" -ForegroundColor Gray
Write-Host ""

Write-Host "5. For production deployment:" -ForegroundColor White
Write-Host "   • Read: PRODUCTION_READINESS_CHECKLIST.md" -ForegroundColor Gray
Write-Host "   • Follow: BACKEND_DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host "   • Setup: FIREBASE_SETUP_GUIDE.md" -ForegroundColor Gray
Write-Host ""

Write-Host "==============================" -ForegroundColor Cyan
Write-Host "💡 TIPS" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "• If login fails, check backend logs" -ForegroundColor White
Write-Host "• If app crashes, check Expo logs" -ForegroundColor White
Write-Host "• For network errors, verify device can reach backend" -ForegroundColor White
Write-Host "• Run .\TEST_CURRENT_STATE.ps1 for detailed diagnostics" -ForegroundColor White
Write-Host ""