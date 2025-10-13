# Authentication Testing Guide

## Quick Start Testing

### 1. Start the Backend

```powershell
# Navigate to API directory
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API should be running at: `http://localhost:8000`
API docs available at: `http://localhost:8000/docs`

---

### 2. Test Backend with PowerShell

#### Test 1: Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get
```

Expected output:
```json
{
  "status": "ok",
  "app": "ACT Gen1 API"
}
```

#### Test 2: Register a New User
```powershell
$registerBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8000/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $registerBody

# Save tokens for later use
$accessToken = $response.access_token
$refreshToken = $response.refresh_token

Write-Host "Access Token: $accessToken"
Write-Host "Refresh Token: $refreshToken"
```

Expected output:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Test 3: Get User Profile
```powershell
$headers = @{
    "Authorization" = "Bearer $accessToken"
}

$user = Invoke-RestMethod -Uri "http://localhost:8000/users/me" `
    -Method Get `
    -Headers $headers

Write-Host "User Email: $($user.email)"
Write-Host "Is Admin: $($user.is_admin)"
```

Expected output:
```json
{
  "id": 1,
  "email": "test@example.com",
  "is_admin": true,
  "name": null,
  "language": "en",
  "theme": "light",
  "currency": "USD",
  "created_at": "2024-01-10T12:00:00"
}
```

#### Test 4: Update User Profile
```powershell
$updateBody = @{
    name = "Test User"
    language = "ru"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $accessToken"
}

$updatedUser = Invoke-RestMethod -Uri "http://localhost:8000/users/me" `
    -Method Patch `
    -ContentType "application/json" `
    -Headers $headers `
    -Body $updateBody

Write-Host "Updated Name: $($updatedUser.name)"
Write-Host "Updated Language: $($updatedUser.language)"
```

#### Test 5: Login with Existing User
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

Write-Host "Login successful!"
Write-Host "New Access Token: $($loginResponse.access_token)"
```

#### Test 6: Refresh Token
```powershell
$refreshBody = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

$refreshResponse = Invoke-RestMethod -Uri "http://localhost:8000/auth/refresh" `
    -Method Post `
    -ContentType "application/json" `
    -Body $refreshBody

$accessToken = $refreshResponse.access_token
$refreshToken = $refreshResponse.refresh_token

Write-Host "Token refreshed successfully!"
```

#### Test 7: Logout
```powershell
$logoutBody = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/auth/logout" `
    -Method Post `
    -ContentType "application/json" `
    -Body $logoutBody

Write-Host "Logged out successfully!"
```

#### Test 8: Try to Use Revoked Token (Should Fail)
```powershell
try {
    $refreshBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:8000/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshBody
} catch {
    Write-Host "✅ Expected error: Token is revoked" -ForegroundColor Green
    Write-Host $_.Exception.Message
}
```

---

### 3. Test Mobile App

#### Step 1: Get Your Local IP Address
```powershell
# Get your local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Select-Object -First 1).IPAddress
Write-Host "Your IP Address: $ip"
```

#### Step 2: Update Mobile .env File
Edit `apps/mobile/.env`:
```env
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_IP>:8000
```

Replace `<YOUR_IP>` with the IP from Step 1.

#### Step 3: Start Mobile App
```powershell
# Navigate to mobile directory
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Install dependencies (if not done)
npm install

# Start Expo
npm start
```

#### Step 4: Test on Device/Simulator
1. Scan QR code with Expo Go app (iOS/Android)
2. Or press `w` to open in web browser
3. Or press `a` for Android emulator
4. Or press `i` for iOS simulator

#### Step 5: Test Flow
1. **Register**: Create a new account
   - Enter email and password
   - Should automatically log in and show profile

2. **Logout**: Click logout button
   - Should return to login screen

3. **Login**: Login with same credentials
   - Should show profile again

4. **Edit Name**: Add your name in profile
   - Should save and display

5. **Close App**: Force close the app
   - Reopen app
   - Should automatically log in (persistence test)

---

## Complete Test Script

Save this as `test_auth.ps1`:

```powershell
# ACT Gen-1 Authentication Test Script

Write-Host "🧪 Starting Authentication Tests..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"
$testEmail = "test_$(Get-Random)@example.com"
$testPassword = "password123"

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✅ Health check passed: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Register
Write-Host "Test 2: Register New User" -ForegroundColor Yellow
try {
    $registerBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody

    $accessToken = $registerResponse.access_token
    $refreshToken = $registerResponse.refresh_token

    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "   Email: $testEmail"
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Get Profile
Write-Host "Test 3: Get User Profile" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }

    $user = Invoke-RestMethod -Uri "$baseUrl/users/me" `
        -Method Get `
        -Headers $headers

    Write-Host "✅ Profile retrieved successfully" -ForegroundColor Green
    Write-Host "   User ID: $($user.id)"
    Write-Host "   Email: $($user.email)"
    Write-Host "   Is Admin: $($user.is_admin)"
} catch {
    Write-Host "❌ Profile retrieval failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Update Profile
Write-Host "Test 4: Update User Profile" -ForegroundColor Yellow
try {
    $updateBody = @{
        name = "Test User"
        language = "ru"
    } | ConvertTo-Json

    $headers = @{
        "Authorization" = "Bearer $accessToken"
    }

    $updatedUser = Invoke-RestMethod -Uri "$baseUrl/users/me" `
        -Method Patch `
        -ContentType "application/json" `
        -Headers $headers `
        -Body $updateBody

    Write-Host "✅ Profile updated successfully" -ForegroundColor Green
    Write-Host "   Name: $($updatedUser.name)"
    Write-Host "   Language: $($updatedUser.language)"
} catch {
    Write-Host "❌ Profile update failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Login
Write-Host "Test 5: Login with Credentials" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $testEmail
        password = $testPassword
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "✅ Login successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 6: Refresh Token
Write-Host "Test 6: Refresh Access Token" -ForegroundColor Yellow
try {
    $refreshBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshBody

    $newAccessToken = $refreshResponse.access_token
    $newRefreshToken = $refreshResponse.refresh_token

    Write-Host "✅ Token refresh successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Token refresh failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 7: Logout
Write-Host "Test 7: Logout" -ForegroundColor Yellow
try {
    $logoutBody = @{
        refresh_token = $newRefreshToken
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/auth/logout" `
        -Method Post `
        -ContentType "application/json" `
        -Body $logoutBody

    Write-Host "✅ Logout successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Logout failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 8: Try to Use Revoked Token
Write-Host "Test 8: Verify Token Revocation" -ForegroundColor Yellow
try {
    $refreshBody = @{
        refresh_token = $newRefreshToken
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body $refreshBody

    Write-Host "❌ Token should have been revoked!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "✅ Token correctly revoked" -ForegroundColor Green
}
Write-Host ""

# Test 9: Invalid Login
Write-Host "Test 9: Invalid Login Credentials" -ForegroundColor Yellow
try {
    $invalidLoginBody = @{
        email = $testEmail
        password = "wrongpassword"
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $invalidLoginBody

    Write-Host "❌ Should have rejected invalid credentials!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host "✅ Invalid credentials correctly rejected" -ForegroundColor Green
}
Write-Host ""

Write-Host "🎉 All tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Health check"
Write-Host "  ✅ User registration"
Write-Host "  ✅ Profile retrieval"
Write-Host "  ✅ Profile update"
Write-Host "  ✅ User login"
Write-Host "  ✅ Token refresh"
Write-Host "  ✅ User logout"
Write-Host "  ✅ Token revocation"
Write-Host "  ✅ Invalid credentials rejection"
```

Run the test script:
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1
.\test_auth.ps1
```

---

## Expected Results

All tests should pass with green checkmarks (✅). If any test fails with a red X (❌), check:

1. Backend is running on port 8000
2. Database is accessible
3. No firewall blocking connections
4. Virtual environment is activated
5. All dependencies are installed

---

## Troubleshooting

### Backend won't start
```powershell
# Check if port 8000 is in use
Get-NetTCPConnection -LocalPort 8000

# Kill process if needed
Stop-Process -Id <PID>
```

### Mobile can't connect
```powershell
# Check firewall
New-NetFirewallRule -DisplayName "Python Dev Server" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Verify IP address
ipconfig
```

### Database errors
```powershell
# Delete and recreate database
cd apps\api
Remove-Item dev.db
python -c "from db import engine, Base; import asyncio; asyncio.run(engine.begin())"
```

---

## Next Steps

After all tests pass:

1. ✅ Test mobile app on real device
2. ✅ Test with ngrok for external access
3. ✅ Test all three languages (EN/RU/UZ)
4. ✅ Test offline behavior
5. ✅ Test token expiry scenarios
6. ✅ Prepare for production deployment

---

## Support

If you encounter any issues:

1. Check the logs in the terminal
2. Review the error messages
3. Verify all environment variables
4. Check the AUTHENTICATION_IMPLEMENTATION.md for details
5. Ensure all dependencies are installed