
# 🔍 DIAGNOSTIC SCRIPT - ACT Gen-1 502 Signup Issue
# This script checks your Railway backend and identifies the signup issue

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🔍 ACT GEN-1 SIGNUP 502 DIAGNOSTIC                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$apiUrl = "https://act-production-8080.up.railway.app"
$results = @()

# Test 1: Basic Health Check
Write-Host "`n[1/5] Testing basic health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$apiUrl/health" -TimeoutSec 10
    Write-Host "✅ Backend is responding" -ForegroundColor Green
    Write-Host "    Response: $($health | ConvertTo-Json)" -ForegroundColor Green
    $results += "✅ Health Check: PASS"
} catch {
    Write-Host "❌ Backend not responding or crashed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Health Check: FAIL - Backend may be down"
}

# Test 2: Database Connection Health
Write-Host "`n[2/5] Testing database connection..." -ForegroundColor Yellow
try {
    $dbHealth = Invoke-RestMethod -Uri "$apiUrl/health/db" -TimeoutSec 10
    if ($dbHealth.status -eq "ok") {
        Write-Host "✅ Database connected" -ForegroundColor Green
        Write-Host "    Type: $($dbHealth.database_type)" -ForegroundColor Green
        Write-Host "    Tables: $($dbHealth.tables.Count) found" -ForegroundColor Green
        $results += "✅ Database: CONNECTED (PostgreSQL)"
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        Write-Host "    Error: $($dbHealth.error)" -ForegroundColor Red
        $results += "❌ Database: NOT CONNECTED"
    }
} catch {
    Write-Host "❌ Could not check database health" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Database Check: FAILED"
}

# Test 3: Try a test signup request
Write-Host "`n[3/5] Testing signup endpoint..." -ForegroundColor Yellow
try {
    $testUser = @{
        email = "test_$(Get-Random)@example.com"
        password = "TestPassword123"
        recovery_keyword = "TestKeyword123"
        currency = "USD"
    } | ConvertTo-Json
    
    Write-Host "    Attempting to register test account..." -ForegroundColor Gray
    $signupResponse = Invoke-RestMethod -Uri "$apiUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testUser `
        -TimeoutSec 10
    
    Write-Host "✅ Signup endpoint working!" -ForegroundColor Green
    Write-Host "    Tokens received successfully" -ForegroundColor Green
    $results += "✅ Signup: WORKING"
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "❌ Signup endpoint failed" -ForegroundColor Red
    Write-Host "    Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "    Error: $errorMsg" -ForegroundColor Red
    
    # Try to extract more details
    try {
        $errorResponse = $_ | ConvertFrom-Json
        Write-Host "    Details: $($errorResponse.detail)" -ForegroundColor Red
    } catch {}
    
    $results += "❌ Signup: FAILED - $errorMsg"
}

# Test 4: Check Railway logs
Write-Host "`n[4/5] Getting recent Railway logs..." -ForegroundColor Yellow
try {
    Write-Host "    ⚠️  Run this command to see detailed logs:" -ForegroundColor Gray
    Write-Host "    railway logs -f" -ForegroundColor Cyan
    Write-Host "`n    Look for:" -ForegroundColor Gray
    Write-Host "    • ERROR messages (red text)" -ForegroundColor Gray
    Write-Host "    • Database connection errors" -ForegroundColor Gray
    Write-Host "    • Traceback exceptions" -ForegroundColor Gray
    $results += "ℹ️  Railway Logs: Check via 'railway logs -f'"
} catch {}

# Test 5: Environment Variables Check
Write-Host "`n[5/5] Environment variables status..." -ForegroundColor Yellow
Write-Host "    ⚠️  Run this to check Railway variables:" -ForegroundColor Gray
Write-Host "    railway vars" -ForegroundColor Cyan
Write-Host "`n    Required variables:" -ForegroundColor Gray
Write-Host "    ✓ DATABASE_URL (should be set automatically by PostgreSQL plugin)" -ForegroundColor Gray
Write-Host "    ✓ JWT_SECRET (required)" -ForegroundColor Gray
$results += "ℹ️  Check Railway vars with: railway vars"

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                       📊 SUMMARY                               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

foreach ($result in $results) {
    Write-Host $result -ForegroundColor $(if ($result.Contains("✅")) { "Green" } elseif ($result.Contains("❌")) { "Red" } else { "Yellow" })
}

# Recommendations
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   💡 NEXT STEPS                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if ($results -contains "✅ Signup: WORKING") {
    Write-Host "✅ Everything looks good! Your app should work now." -ForegroundColor Green
    Write-Host "   Try signing up in your app again." -ForegroundColor Green
} else {
    Write-Host "❌ There's an issue with your backend." -ForegroundColor Red
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check Railway logs:  railway logs -f" -ForegroundColor Cyan
    Write-Host "2. Look for ERROR or exception messages" -ForegroundColor Cyan
    Write-Host "3. Verify DATABASE_URL variable:  railway vars" -ForegroundColor Cyan
    Write-Host "4. If needed, redeploy:  railway up" -ForegroundColor Cyan
    Write-Host "5. Check again:  .\DIAGNOSE_502_SIGNUP.ps1" -ForegroundColor Cyan
}

Write-Host "`n"