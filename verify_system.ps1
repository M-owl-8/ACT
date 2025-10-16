# ACT Gen-1 System Verification Script
# This script verifies all fixes and configurations are in place

Write-Host "System Verification" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "c:\Users\user\Desktop\Bitway\Programs\act-gen1"
$errorList = @()
$warningList = @()
$passed = 0
$total = 0

function Test-FileExists {
    param($path, $description)
    $script:total++
    if (Test-Path $path) {
        Write-Host "[PASS] $description" -ForegroundColor Green
        $script:passed++
        return $true
    } else {
        Write-Host "[FAIL] $description" -ForegroundColor Red
        $script:errorList += "Missing: $path"
        return $false
    }
}

function Test-FileContains {
    param($path, $pattern, $description)
    $script:total++
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -match $pattern) {
            Write-Host "[PASS] $description" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host "[FAIL] $description" -ForegroundColor Red
            $script:errorList += "Pattern not found in $path"
            return $false
        }
    } else {
        Write-Host "[FAIL] $description (file not found)" -ForegroundColor Red
        $script:errorList += "File not found: $path"
        return $false
    }
}

function Test-ApiServer {
    $script:total++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[PASS] API Server is running" -ForegroundColor Green
            $script:passed++
            return $true
        }
    } catch {
        Write-Host "[WARN] API Server is not running" -ForegroundColor Yellow
        $script:warningList += "API server not running. Start it with: .\start_server.bat"
        return $false
    }
}

Write-Host "Mobile App Configuration" -ForegroundColor Yellow
Write-Host "----------------------------" -ForegroundColor Yellow

# Check ThemedText fix
Test-FileContains `
    "$rootPath\apps\mobile\src\components\themed\ThemedText.tsx" `
    "textStyle\?\." `
    "ThemedText has optional chaining"

# Check LoginScreen fix
Test-FileContains `
    "$rootPath\apps\mobile\src\screens\LoginScreen.tsx" `
    'size="h1"' `
    "LoginScreen uses valid size prop"

Test-FileContains `
    "$rootPath\apps\mobile\src\screens\LoginScreen.tsx" `
    "ERR_NETWORK" `
    "LoginScreen has enhanced error handling"

# Check RegisterScreen
Test-FileContains `
    "$rootPath\apps\mobile\src\screens\RegisterScreen.tsx" `
    "ERR_NETWORK" `
    "RegisterScreen has enhanced error handling"

# Check .env configuration
Test-FileContains `
    "$rootPath\apps\mobile\.env" `
    "10\.0\.2\.2" `
    ".env has correct Android emulator IP"

# Check API client
Test-FileContains `
    "$rootPath\apps\mobile\src\api\client.ts" `
    "10\.0\.2\.2" `
    "API client configured for Android emulator"

Write-Host ""
Write-Host "Android Configuration" -ForegroundColor Yellow
Write-Host "-------------------------" -ForegroundColor Yellow

# Check network security config
Test-FileExists `
    "$rootPath\apps\mobile\android\app\src\main\res\xml\network_security_config.xml" `
    "Network security config exists"

Test-FileContains `
    "$rootPath\apps\mobile\android\app\src\main\res\xml\network_security_config.xml" `
    "cleartextTrafficPermitted" `
    "Network security config allows cleartext"

# Check AndroidManifest
Test-FileContains `
    "$rootPath\apps\mobile\android\app\src\main\AndroidManifest.xml" `
    "android:usesCleartextTraffic" `
    "AndroidManifest allows cleartext traffic"

Test-FileContains `
    "$rootPath\apps\mobile\android\app\src\main\AndroidManifest.xml" `
    "networkSecurityConfig" `
    "AndroidManifest references network security config"

Write-Host ""
Write-Host "Backend API" -ForegroundColor Yellow
Write-Host "---------------" -ForegroundColor Yellow

# Check backend files
Test-FileExists `
    "$rootPath\apps\api\main.py" `
    "Backend main.py exists"

Test-FileContains `
    "$rootPath\apps\api\main.py" `
    "CORSMiddleware" `
    "Backend has CORS configured"

# Check if API is running
Test-ApiServer

Write-Host ""
Write-Host "Documentation" -ForegroundColor Yellow
Write-Host "----------------" -ForegroundColor Yellow

# Check documentation files
Test-FileExists `
    "$rootPath\SETUP_GUIDE.md" `
    "Setup guide exists"

Test-FileExists `
    "$rootPath\TROUBLESHOOTING.md" `
    "Troubleshooting guide exists"

Test-FileExists `
    "$rootPath\FIXES_APPLIED.md" `
    "Fixes documentation exists"

Test-FileExists `
    "$rootPath\SYSTEM_STATUS.md" `
    "System status report exists"

Write-Host ""
Write-Host "Automation Scripts" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow

# Check automation scripts
Test-FileExists `
    "$rootPath\apps\api\start_server.bat" `
    "API startup script exists"

Test-FileExists `
    "$rootPath\START_ALL.bat" `
    "All-in-one startup script exists"

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Verification Results" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$percentage = [math]::Round(($passed / $total) * 100, 1)

Write-Host "Passed: $passed / $total tests" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 80) { "Yellow" } else { "Red" })
Write-Host "Success Rate: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { "Green" } elseif ($percentage -ge 80) { "Yellow" } else { "Red" })
Write-Host ""

if ($errorList.Count -gt 0) {
    Write-Host "ERRORS:" -ForegroundColor Red
    foreach ($err in $errorList) {
        Write-Host "   - $err" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warningList.Count -gt 0) {
    Write-Host "WARNINGS:" -ForegroundColor Yellow
    foreach ($warn in $warningList) {
        Write-Host "   - $warn" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($percentage -eq 100 -and $warningList.Count -eq 0) {
    Write-Host "ALL CHECKS PASSED! System is fully operational." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start the API server: .\start_server.bat" -ForegroundColor White
    Write-Host "2. Start the mobile app: cd apps\mobile; npx expo start" -ForegroundColor White
    Write-Host "3. Or use the all-in-one script: .\START_ALL.bat" -ForegroundColor White
} elseif ($percentage -ge 80) {
    Write-Host "MOSTLY OPERATIONAL - Some warnings detected." -ForegroundColor Yellow
    Write-Host "Review warnings above and take action if needed." -ForegroundColor Yellow
} else {
    Write-Host "SYSTEM NOT READY - Critical errors detected." -ForegroundColor Red
    Write-Host "Please fix the errors above before proceeding." -ForegroundColor Red
}

Write-Host ""
Write-Host "For detailed information, see:" -ForegroundColor Cyan
Write-Host "- SYSTEM_STATUS.md - Complete system status" -ForegroundColor White
Write-Host "- TROUBLESHOOTING.md - Common issues and solutions" -ForegroundColor White
Write-Host "- SETUP_GUIDE.md - Setup instructions" -ForegroundColor White
Write-Host ""