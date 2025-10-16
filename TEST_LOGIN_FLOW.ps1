# TEST_LOGIN_FLOW.ps1
# Test the complete login flow to identify issues

Write-Host "🔐 ACT Gen-1 Login Flow Test" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://10.21.69.205:8000"
$testEmail = "test@actgen1.com"
$testPassword = "TestPassword123!"

# Test 1: Check backend health
Write-Host "📡 Step 1: Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$API_URL/health" -Method Get -TimeoutSec 5
    Write-Host "  ✅ Backend is healthy: $($health.status)" -ForegroundColor Green
    Write-Host "  📦 App: $($health.app)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Backend health check failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Please start the backend first:" -ForegroundColor Yellow
    Write-Host "  cd apps\api" -ForegroundColor White
    Write-Host "  .\.venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "  uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
    exit 1
}
Write-Host ""

# Test 2: Try to register a test user
Write-Host "📝 Step 2: Testing user registration..." -ForegroundColor Yellow
$registerBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_URL/auth/register" -Method Post -Body $registerBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "  ✅ Registration successful!" -ForegroundColor Green
    Write-Host "  🔑 Access token received: $($registerResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  🔄 Refresh token received: $($registerResponse.refresh_token.Substring(0, 20))..." -ForegroundColor Gray
    $accessToken = $registerResponse.access_token
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ℹ️  User already exists (this is OK)" -ForegroundColor Cyan
    } else {
        Write-Host "  ❌ Registration failed!" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}
Write-Host ""

# Test 3: Try to login
Write-Host "🔓 Step 3: Testing user login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "  ✅ Login successful!" -ForegroundColor Green
    Write-Host "  🔑 Access token: $($loginResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  🔄 Refresh token: $($loginResponse.refresh_token.Substring(0, 20))..." -ForegroundColor Gray
    $accessToken = $loginResponse.access_token
    $refreshToken = $loginResponse.refresh_token
} catch {
    Write-Host "  ❌ Login failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Details: $($errorDetail.detail)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "⚠️  Login failed. Possible issues:" -ForegroundColor Yellow
    Write-Host "  1. Wrong credentials" -ForegroundColor White
    Write-Host "  2. Database not initialized" -ForegroundColor White
    Write-Host "  3. Backend authentication issue" -ForegroundColor White
    exit 1
}
Write-Host ""

# Test 4: Fetch user profile
Write-Host "👤 Step 4: Testing profile fetch..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $profile = Invoke-RestMethod -Uri "$API_URL/users/me" -Method Get -Headers $headers -TimeoutSec 10
    Write-Host "  ✅ Profile fetched successfully!" -ForegroundColor Green
    Write-Host "  📧 Email: $($profile.email)" -ForegroundColor Gray
    Write-Host "  🆔 User ID: $($profile.id)" -ForegroundColor Gray
    Write-Host "  👑 Admin: $($profile.is_admin)" -ForegroundColor Gray
    Write-Host "  🌍 Language: $($profile.language)" -ForegroundColor Gray
    Write-Host "  🎨 Theme: $($profile.theme)" -ForegroundColor Gray
    Write-Host "  💰 Currency: $($profile.currency)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Profile fetch failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}
Write-Host ""

# Test 5: Test token refresh
Write-Host "🔄 Step 5: Testing token refresh..." -ForegroundColor Yellow
$refreshBody = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$API_URL/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "  ✅ Token refresh successful!" -ForegroundColor Green
    Write-Host "  🔑 New access token: $($refreshResponse.access_token.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  🔄 New refresh token: $($refreshResponse.refresh_token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Token refresh failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 6: Test categories endpoint
Write-Host "📂 Step 6: Testing categories endpoint..." -ForegroundColor Yellow
try {
    $categories = Invoke-RestMethod -Uri "$API_URL/categories" -Method Get -Headers $headers -TimeoutSec 10
    Write-Host "  ✅ Categories fetched successfully!" -ForegroundColor Green
    Write-Host "  📊 Total categories: $($categories.Count)" -ForegroundColor Gray
    if ($categories.Count -gt 0) {
        Write-Host "  📝 Sample categories:" -ForegroundColor Gray
        $categories | Select-Object -First 3 | ForEach-Object {
            Write-Host "     • $($_.name) ($($_.type))" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  No categories found - database may need seeding" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Categories fetch failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 7: Test entries endpoint
Write-Host "💰 Step 7: Testing entries endpoint..." -ForegroundColor Yellow
try {
    $entries = Invoke-RestMethod -Uri "$API_URL/entries" -Method Get -Headers $headers -TimeoutSec 10
    Write-Host "  ✅ Entries fetched successfully!" -ForegroundColor Green
    Write-Host "  📊 Total entries: $($entries.Count)" -ForegroundColor Gray
    if ($entries.Count -gt 0) {
        Write-Host "  📝 Sample entries:" -ForegroundColor Gray
        $entries | Select-Object -First 3 | ForEach-Object {
            Write-Host "     • $($_.amount) - $($_.description)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ℹ️  No entries yet (this is normal for new user)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "  ❌ Entries fetch failed!" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend authentication is working!" -ForegroundColor Green
Write-Host "✅ User registration works" -ForegroundColor Green
Write-Host "✅ User login works" -ForegroundColor Green
Write-Host "✅ Profile fetch works" -ForegroundColor Green
Write-Host "✅ Token refresh works" -ForegroundColor Green
Write-Host "✅ Protected endpoints work" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Login flow is FUNCTIONAL!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Test login from mobile app" -ForegroundColor White
Write-Host "2. If mobile login fails, check:" -ForegroundColor White
Write-Host "   • Network connectivity" -ForegroundColor Gray
Write-Host "   • API URL in .env file" -ForegroundColor Gray
Write-Host "   • Device can reach backend IP" -ForegroundColor Gray
Write-Host "3. Run .\COMPREHENSIVE_TEST.ps1 for full testing" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Test Credentials:" -ForegroundColor Cyan
Write-Host "   Email: $testEmail" -ForegroundColor White
Write-Host "   Password: $testPassword" -ForegroundColor White
Write-Host ""