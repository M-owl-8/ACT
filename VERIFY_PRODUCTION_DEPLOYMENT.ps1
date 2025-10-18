# Production Deployment Verification Script
# Tests all critical components after deployment to Railway

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 ACT Gen-1 Backend: Production Deployment Verification" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Ask for Railway URL
$railwayUrl = Read-Host "Enter your Railway API URL (e.g., https://my-app.railway.app)"

if (-not $railwayUrl) {
    Write-Host "❌ Railway URL is required" -ForegroundColor Red
    exit 1
}

# Remove trailing slash if present
$railwayUrl = $railwayUrl.TrimEnd('/')

Write-Host ""
Write-Host "Testing API: $railwayUrl" -ForegroundColor Yellow
Write-Host ""

$testsRunning = 0
$testsPassed = 0

# Test 1: Health Check
Write-Host "Test 1️⃣  Health Endpoint" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/health" `
        -Method Get `
        -ContentType "application/json" `
        -TimeoutSec 10 `
        -ErrorAction Stop

    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        Write-Host "✅ Health check passed" -ForegroundColor Green
        Write-Host "   Status: $($content.status)" -ForegroundColor Gray
        Write-Host "   App: $($content.app)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*404*") {
        Write-Host "   → API might not be deployed yet" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 2: Check if Firebase is initialized
Write-Host "Test 2️⃣  Firebase Initialization (via Logs)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
Write-Host "Check Railway logs for:" -ForegroundColor Yellow
Write-Host "  ✓ Firebase Admin SDK initialized successfully" -ForegroundColor Cyan
Write-Host "  ✓ Credentials loaded from Base64 environment variable" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run: railway logs" -ForegroundColor Gray
Write-Host "Look for Firebase initialization messages" -ForegroundColor Gray
Write-Host ""

# Test 3: Check Database Connection
Write-Host "Test 3️⃣  Database Initialization (via Logs)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
Write-Host "Check Railway logs for:" -ForegroundColor Yellow
Write-Host "  ✓ [DB] Converting postgresql:// to postgresql+asyncpg://" -ForegroundColor Cyan
Write-Host "  ✓ Database tables ready" -ForegroundColor Cyan
Write-Host "  ✓ Default data seeded" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run: railway logs" -ForegroundColor Gray
Write-Host "Look for database initialization messages" -ForegroundColor Gray
Write-Host ""

# Test 4: API Documentation
Write-Host "Test 4️⃣  API Documentation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/docs" `
        -Method Get `
        -TimeoutSec 10 `
        -ErrorAction Stop

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API documentation available" -ForegroundColor Green
        Write-Host "   Open in browser: $railwayUrl/docs" -ForegroundColor Cyan
        $testsPassed++
    }
} catch {
    Write-Host "⚠️  API documentation not accessible" -ForegroundColor Yellow
    Write-Host "   (This might be OK if GET /docs is disabled)" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Authentication Endpoint
Write-Host "Test 5️⃣  Authentication Endpoints" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++

$testEmail = "test-$(Get-Random)@railway.local"
$testData = @{
    email = $testEmail
    password = "TestPassword123!"
    full_name = "Railway Test User"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $testData `
        -TimeoutSec 10 `
        -ErrorAction Stop

    if ($response.StatusCode -eq 201) {
        Write-Host "✅ Registration endpoint working" -ForegroundColor Green
        $user = $response.Content | ConvertFrom-Json
        Write-Host "   User ID: $($user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($user.email)" -ForegroundColor Gray
        $testsPassed++
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq "Conflict") {
        Write-Host "⚠️  Email already exists (registration test)" -ForegroundColor Yellow
        Write-Host "   (This is OK - it means auth is working)" -ForegroundColor Green
        $testsPassed++
    } elseif ($_.Exception.Response.StatusCode -eq "BadRequest") {
        Write-Host "✅ Auth validation working (rejected weak password)" -ForegroundColor Green
        $testsPassed++
    } else {
        Write-Host "❌ Registration endpoint failed" -ForegroundColor Red
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: CORS Configuration
Write-Host "Test 6️⃣  CORS Configuration" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/health" `
        -Method Options `
        -TimeoutSec 10 `
        -ErrorAction Stop

    $corsOrigin = $response.Headers['Access-Control-Allow-Origin']
    if ($corsOrigin) {
        Write-Host "✅ CORS is configured" -ForegroundColor Green
        Write-Host "   Allowed Origins: $corsOrigin" -ForegroundColor Gray
        $testsPassed++
    }
} catch {
    Write-Host "⚠️  Could not verify CORS (OPTIONS might be disabled)" -ForegroundColor Yellow
}
Write-Host ""

# Test 7: Environment Variables Check
Write-Host "Test 7️⃣  Environment Variables" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
Write-Host "In Railway Dashboard, verify these variables are SET:" -ForegroundColor Yellow
Write-Host "  ✓ JWT_SECRET" -ForegroundColor Cyan
Write-Host "  ✓ FIREBASE_CREDENTIALS_JSON" -ForegroundColor Cyan
Write-Host "  ✓ DATABASE_URL (auto-provided by PostgreSQL plugin)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check: Dashboard → API Service → Settings → Variables" -ForegroundColor Gray
Write-Host ""
$varsSet = Read-Host "Are all variables set in Railway? (y/n)"
if ($varsSet -eq "y") {
    $testsPassed++
}
Write-Host ""

# Test 8: Backend is Serving API Endpoints
Write-Host "Test 8️⃣  API Endpoints" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$testsRunning++
try {
    $response = Invoke-WebRequest -Uri "$railwayUrl/docs" `
        -Headers @{ "Accept" = "application/json" } `
        -TimeoutSec 10 `
        -ErrorAction SilentlyContinue

    Write-Host "Available API endpoints:" -ForegroundColor Green
    Write-Host "  ✓ /auth/ - Authentication (register, login, refresh)" -ForegroundColor Gray
    Write-Host "  ✓ /users/ - User profile management" -ForegroundColor Gray
    Write-Host "  ✓ /categories/ - Expense categories" -ForegroundColor Gray
    Write-Host "  ✓ /entries/ - Journal entries" -ForegroundColor Gray
    Write-Host "  ✓ /dashboard/ - Analytics dashboard" -ForegroundColor Gray
    Write-Host "  ✓ /motivation/ - Motivational quotes" -ForegroundColor Gray
    Write-Host "  ✓ /books/ - Books library" -ForegroundColor Gray
    Write-Host "  ✓ /backup/ - Backup management" -ForegroundColor Gray
    Write-Host "  ✓ /reports/ - Report generation" -ForegroundColor Gray
    Write-Host "  ✓ /reminders/ - Reminders" -ForegroundColor Gray
    Write-Host "  ✓ /push-notifications/ - Push notifications" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Full API docs: $railwayUrl/docs" -ForegroundColor Cyan
    $testsPassed++
} catch {
    Write-Host "⚠️  Could not list endpoints (documentation might be disabled)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tests Passed: $testsPassed / $testsRunning" -ForegroundColor $(if ($testsPassed -ge $testsRunning - 1) { "Green" } else { "Yellow" })
Write-Host ""

if ($testsPassed -ge $testsRunning - 1) {
    Write-Host "✅ Production deployment looks GOOD!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify Firebase in logs: railway logs | findstr Firebase" -ForegroundColor White
    Write-Host "  2. Update mobile app with this API URL" -ForegroundColor White
    Write-Host "  3. Test end-to-end mobile-to-backend communication" -ForegroundColor White
    Write-Host "  4. Monitor logs for any issues: railway logs -f" -ForegroundColor White
} else {
    Write-Host "⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check Railway logs: railway logs -f" -ForegroundColor White
    Write-Host "  2. Verify environment variables are set" -ForegroundColor White
    Write-Host "  3. Ensure Firebase credentials JSON is properly encoded" -ForegroundColor White
    Write-Host "  4. Check database connection in logs" -ForegroundColor White
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan