# Complete Railway Deployment Setup Script
# This script configures Firebase, environment variables, and verifies deployment

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 ACT Gen-1 Backend: Complete Railway Deployment Setup" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Configuration
$firebaseCredentialsFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\act-gen1-f9812-firebase-adminsdk-fbsvc-83acc8b162.json"
$jwtSecret = "VE5pLXN0OFEzLU1wQTg2dGZrMmhYN2pMVVBfOGZzTm5QcmJpNTUyVGhyMQ=="
$appDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"

Write-Host "Step 1️⃣ : Verify Firebase Credentials File" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
if (Test-Path $firebaseCredentialsFile) {
    $size = (Get-Item $firebaseCredentialsFile).Length / 1KB
    Write-Host "✅ Firebase credentials found" -ForegroundColor Green
    Write-Host "   Path: $firebaseCredentialsFile" -ForegroundColor Gray
    Write-Host "   Size: $([math]::Round($size, 2)) KB" -ForegroundColor Gray
} else {
    Write-Host "❌ Firebase credentials NOT found" -ForegroundColor Red
    Write-Host "   Expected at: $firebaseCredentialsFile" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 2️⃣ : Encode Firebase Credentials to Base64" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
try {
    $content = Get-Content $firebaseCredentialsFile -Raw
    $base64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
    Write-Host "✅ Firebase JSON encoded successfully" -ForegroundColor Green
    Write-Host "   Length: $($base64.Length) characters" -ForegroundColor Gray
    
    # Copy to clipboard
    $base64 | Set-Clipboard
    Write-Host "   📋 Base64 string copied to clipboard" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Failed to encode Firebase credentials" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "Step 3️⃣ : Check Railway CLI Installation" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
$railwayCLI = railway --version 2>&1
if ($railwayCLI -match "railway") {
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
    Write-Host "   Version: $railwayCLI" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Railway CLI not found" -ForegroundColor Yellow
    Write-Host "   Installing Railway CLI..." -ForegroundColor Gray
    npm install -g @railway/cli
    Write-Host "   Installation complete" -ForegroundColor Green
}
Write-Host ""

Write-Host "Step 4️⃣ : Get Railway Project Information" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
try {
    $railwayStatus = railway status 2>&1
    Write-Host "✅ Railway project linked" -ForegroundColor Green
    Write-Host $railwayStatus -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Not connected to Railway project" -ForegroundColor Yellow
    Write-Host "   Please run: railway login" -ForegroundColor Gray
    Write-Host "   Then: railway link" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Step 5️⃣ : Review Required Environment Variables" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Add these to Railway Dashboard → Variables:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. JWT_SECRET" -ForegroundColor White
Write-Host "     Value: $jwtSecret" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. FIREBASE_CREDENTIALS_JSON" -ForegroundColor White
Write-Host "     Value: [PASTE THE COPIED BASE64 STRING]" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. (Railway provides automatically)" -ForegroundColor White
Write-Host "     DATABASE_URL: [PostgreSQL connection string]" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 6️⃣ : Ready to Deploy" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Firebase credentials encoded and ready (in clipboard)" -ForegroundColor Green
Write-Host "✅ JWT_SECRET generated and ready" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to continue to deployment instructions..." -ForegroundColor Gray
Read-Host
Write-Host ""

Write-Host "Step 7️⃣ : Add Variables to Railway Dashboard" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "1. Open: https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Select your ACT Gen-1 API project" -ForegroundColor White
Write-Host "3. Click the API service" -ForegroundColor White
Write-Host "4. Go to Settings → Variables" -ForegroundColor White
Write-Host ""
Write-Host "Add these variables:" -ForegroundColor Cyan
Write-Host "  • JWT_SECRET = $jwtSecret" -ForegroundColor Gray
Write-Host "  • FIREBASE_CREDENTIALS_JSON = [PASTE FROM CLIPBOARD]" -ForegroundColor Cyan
Write-Host "  • DATABASE_URL = [Auto-provided by Railway PostgreSQL]" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Click Save - Railway will auto-deploy!" -ForegroundColor White
Write-Host ""

Write-Host "Step 8️⃣ : Monitor Deployment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "Watch deployment logs:" -ForegroundColor Yellow
Write-Host "  railway logs -f" -ForegroundColor Cyan
Write-Host ""
Write-Host "Success indicators in logs:" -ForegroundColor Yellow
Write-Host "  ✓ [DB] Converting postgresql:// to postgresql+asyncpg://" -ForegroundColor Green
Write-Host "  ✓ [Firebase] ✓ Credentials loaded from Base64 environment variable" -ForegroundColor Green
Write-Host "  ✓ Firebase Admin SDK initialized successfully" -ForegroundColor Green
Write-Host "  ✓ Database tables ready" -ForegroundColor Green
Write-Host "  ✓ Default data seeded" -ForegroundColor Green
Write-Host "  ✓ Daily backup task started" -ForegroundColor Green
Write-Host "  ✅ ACT Gen-1 API is ready!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 9️⃣ : Verify Production Deployment" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "After deployment completes, run:" -ForegroundColor Yellow
Write-Host "  .\VERIFY_PRODUCTION_DEPLOYMENT.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will check:" -ForegroundColor Yellow
Write-Host "  • Health endpoint" -ForegroundColor Gray
Write-Host "  • Firebase initialization" -ForegroundColor Gray
Write-Host "  • Database initialization" -ForegroundColor Gray
Write-Host "  • API documentation" -ForegroundColor Gray
Write-Host "  • Authentication endpoints" -ForegroundColor Gray
Write-Host ""

Write-Host "🔟 Update Mobile App Configuration" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""
Write-Host "Once API is running, find your Railway domain:" -ForegroundColor Yellow
Write-Host "  1. Railway Dashboard → ACT Gen-1 API service" -ForegroundColor White
Write-Host "  2. Settings → Domains → Copy the Railway URL" -ForegroundColor White
Write-Host "  3. Format: https://[service]-prod-xxxx.railway.app" -ForegroundColor White
Write-Host ""
Write-Host "Then update mobile app in:" -ForegroundColor Yellow
Write-Host "  File: apps/mobile/src/api/axios-instance.ts" -ForegroundColor Cyan
Write-Host "  Set API_URL to your Railway domain" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📌 Remember:" -ForegroundColor Cyan
Write-Host "  • Base64 string is in your clipboard - paste to FIREBASE_CREDENTIALS_JSON" -ForegroundColor White
Write-Host "  • Add JWT_SECRET variable" -ForegroundColor White
Write-Host "  • DATABASE_URL is automatically provided by Railway PostgreSQL" -ForegroundColor White
Write-Host "  • Check logs after adding variables for success" -ForegroundColor White
Write-Host ""