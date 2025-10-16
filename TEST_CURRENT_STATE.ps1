# TEST_CURRENT_STATE.ps1
# Comprehensive test script to assess production readiness

Write-Host "🔍 ACT Gen-1 Production Readiness Assessment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()
$passed = @()

# Test 1: Check if backend is running
Write-Host "📡 Test 1: Backend Connectivity" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://10.21.69.205:8000/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ Backend is running locally" -ForegroundColor Green
        $passed += "Backend running"
        Write-Host "  ⚠️  WARNING: Using local IP (not production-ready)" -ForegroundColor Yellow
        $warnings += "Backend on local IP - needs production deployment"
    }
} catch {
    Write-Host "  ❌ Backend is NOT running" -ForegroundColor Red
    $issues += "Backend not accessible"
}
Write-Host ""

# Test 2: Check Firebase configuration
Write-Host "🔥 Test 2: Firebase Configuration" -ForegroundColor Yellow
$firebaseFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\google-services.json"
if (Test-Path $firebaseFile) {
    Write-Host "  ✅ google-services.json found" -ForegroundColor Green
    $passed += "Firebase configured"
} else {
    Write-Host "  ❌ google-services.json NOT found" -ForegroundColor Red
    $issues += "Missing Firebase configuration"
}
Write-Host ""

# Test 3: Check JWT secret
Write-Host "🔐 Test 3: Security Configuration" -ForegroundColor Yellow
$configFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\config.py"
$configContent = Get-Content $configFile -Raw
if ($configContent -match 'CHANGE_ME_SUPER_SECRET') {
    Write-Host "  ❌ Using default JWT secret (INSECURE!)" -ForegroundColor Red
    $issues += "Insecure JWT secret"
} else {
    Write-Host "  ✅ JWT secret appears to be customized" -ForegroundColor Green
    $passed += "JWT secret configured"
}
Write-Host ""

# Test 4: Check EAS configuration
Write-Host "📦 Test 4: Build Configuration" -ForegroundColor Yellow
$easFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\eas.json"
$easContent = Get-Content $easFile -Raw | ConvertFrom-Json
$buildType = $easContent.build.production.android.buildType
if ($buildType -eq "app-bundle") {
    Write-Host "  ✅ Production build configured for AAB" -ForegroundColor Green
    $passed += "AAB build configured"
} else {
    Write-Host "  ⚠️  Production build uses $buildType (should be app-bundle)" -ForegroundColor Yellow
    $warnings += "Production should use AAB, not APK"
}
Write-Host ""

# Test 5: Check if node_modules installed
Write-Host "📚 Test 5: Dependencies" -ForegroundColor Yellow
$nodeModules = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  ✅ Mobile dependencies installed" -ForegroundColor Green
    $passed += "Dependencies installed"
} else {
    Write-Host "  ❌ Mobile dependencies NOT installed" -ForegroundColor Red
    $issues += "Run 'npm install' in apps/mobile"
}
Write-Host ""

# Test 6: Check Python virtual environment
Write-Host "🐍 Test 6: Backend Environment" -ForegroundColor Yellow
$venv = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\.venv"
if (Test-Path $venv) {
    Write-Host "  ✅ Python virtual environment exists" -ForegroundColor Green
    $passed += "Python venv exists"
} else {
    Write-Host "  ⚠️  Python virtual environment not found" -ForegroundColor Yellow
    $warnings += "Python venv not found"
}
Write-Host ""

# Test 7: Check database
Write-Host "💾 Test 7: Database" -ForegroundColor Yellow
$dbFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\dev.db"
if (Test-Path $dbFile) {
    $dbSize = (Get-Item $dbFile).Length / 1KB
    Write-Host "  ✅ Database exists ($([math]::Round($dbSize, 2)) KB)" -ForegroundColor Green
    $passed += "Database exists"
    if ($dbSize -lt 10) {
        Write-Host "  ⚠️  Database is very small - may need seeding" -ForegroundColor Yellow
        $warnings += "Database may need seeding"
    }
} else {
    Write-Host "  ❌ Database file not found" -ForegroundColor Red
    $issues += "Database not initialized"
}
Write-Host ""

# Test 8: Check assets
Write-Host "🎨 Test 8: App Assets" -ForegroundColor Yellow
$assetsPath = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\assets"
$requiredAssets = @("icon.png", "adaptive-icon.png", "splash-icon.png", "notification-icon.png")
$missingAssets = @()
foreach ($asset in $requiredAssets) {
    if (-not (Test-Path (Join-Path $assetsPath $asset))) {
        $missingAssets += $asset
    }
}
if ($missingAssets.Count -eq 0) {
    Write-Host "  ✅ All required assets present" -ForegroundColor Green
    $passed += "Assets complete"
} else {
    Write-Host "  ⚠️  Missing assets: $($missingAssets -join ', ')" -ForegroundColor Yellow
    $warnings += "Some assets missing"
}
Write-Host ""

# Test 9: Check environment variables
Write-Host "🌍 Test 9: Environment Configuration" -ForegroundColor Yellow
$envFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match 'localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.|10\.') {
        Write-Host "  ⚠️  Using local/development API URL" -ForegroundColor Yellow
        $warnings += "API URL is not production"
    } else {
        Write-Host "  ✅ API URL appears to be production" -ForegroundColor Green
        $passed += "Production API URL"
    }
} else {
    Write-Host "  ❌ .env file not found" -ForegroundColor Red
    $issues += ".env file missing"
}
Write-Host ""

# Test 10: Check if EAS CLI is installed
Write-Host "🛠️  Test 10: Build Tools" -ForegroundColor Yellow
try {
    $easVersion = eas --version 2>&1
    Write-Host "  ✅ EAS CLI installed: $easVersion" -ForegroundColor Green
    $passed += "EAS CLI installed"
} catch {
    Write-Host "  ⚠️  EAS CLI not installed" -ForegroundColor Yellow
    $warnings += "Install EAS CLI: npm install -g eas-cli"
}
Write-Host ""

# Summary
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📊 ASSESSMENT SUMMARY" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Passed: $($passed.Count)" -ForegroundColor Green
foreach ($item in $passed) {
    Write-Host "   • $item" -ForegroundColor Green
}
Write-Host ""

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Warnings: $($warnings.Count)" -ForegroundColor Yellow
    foreach ($item in $warnings) {
        Write-Host "   • $item" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($issues.Count -gt 0) {
    Write-Host "❌ Critical Issues: $($issues.Count)" -ForegroundColor Red
    foreach ($item in $issues) {
        Write-Host "   • $item" -ForegroundColor Red
    }
    Write-Host ""
}

# Overall status
Write-Host "=============================================" -ForegroundColor Cyan
if ($issues.Count -eq 0 -and $warnings.Count -le 2) {
    Write-Host "🎉 STATUS: READY FOR TESTING" -ForegroundColor Green
    Write-Host "Next step: Run comprehensive feature tests" -ForegroundColor Green
} elseif ($issues.Count -eq 0) {
    Write-Host "⚠️  STATUS: NEEDS IMPROVEMENTS" -ForegroundColor Yellow
    Write-Host "Fix warnings before production deployment" -ForegroundColor Yellow
} else {
    Write-Host "❌ STATUS: NOT READY" -ForegroundColor Red
    Write-Host "Fix critical issues before proceeding" -ForegroundColor Red
}
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review PRODUCTION_READINESS_CHECKLIST.md" -ForegroundColor White
Write-Host "2. Fix critical issues listed above" -ForegroundColor White
Write-Host "3. Run .\TEST_LOGIN_FLOW.ps1 to test authentication" -ForegroundColor White
Write-Host "4. Run .\COMPREHENSIVE_TEST.ps1 for full feature testing" -ForegroundColor White
Write-Host ""