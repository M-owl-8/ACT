# Railway Deployment Setup Script
# This script helps configure and deploy to Railway

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 Railway Deployment Setup for ACT Gen-1" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
$railwayInstalled = railway --version 2>$null
if (-not $railwayInstalled) {
    Write-Host "❌ Railway CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Cyan
    npm install -g railway
    Write-Host "✅ Railway CLI installed" -ForegroundColor Green
} else {
    Write-Host "✅ Railway CLI found: $railwayInstalled" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 Step 1: Generate JWT Secret" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host ""
Write-Host "Generating secure JWT secret..." -ForegroundColor Yellow
$jwtSecret = python -c "import secrets; print(secrets.token_urlsafe(32))"
Write-Host "✅ JWT Secret generated:" -ForegroundColor Green
Write-Host "   $jwtSecret" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 Save this! You'll need it for Railway dashboard" -ForegroundColor Yellow
Write-Host ""

# Ask if Railway CLI login needed
$loginNeeded = Read-Host "Need to login to Railway? (y/n)"
if ($loginNeeded -eq "y" -or $loginNeeded -eq "Y") {
    Write-Host ""
    Write-Host "🔑 Logging into Railway..." -ForegroundColor Cyan
    railway login
    Write-Host ""
    Write-Host "✅ Railway login successful" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Step 2: Configure Environment Variables" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "You need to set these in Railway dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  JWT_SECRET=$jwtSecret" -ForegroundColor Gray
Write-Host "  FIREBASE_CREDENTIALS_PATH=firebase-service-account.json" -ForegroundColor Gray
Write-Host "  CORS_ORIGINS=https://your-railway-domain.railway.app" -ForegroundColor Gray
Write-Host "  ENVIRONMENT=production" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 DATABASE_URL will be provided by PostgreSQL service in Railway" -ForegroundColor Yellow
Write-Host ""

# Ask if user is ready to proceed
$readyToProceed = Read-Host "Ready to deploy? (y/n)"

if ($readyToProceed -ne "y" -and $readyToProceed -ne "Y") {
    Write-Host ""
    Write-Host "ℹ️  Deployment cancelled" -ForegroundColor Yellow
    Write-Host "   Complete these steps manually in Railway dashboard:" -ForegroundColor Gray
    Write-Host "   1. Create new project" -ForegroundColor Gray
    Write-Host "   2. Add PostgreSQL database" -ForegroundColor Gray
    Write-Host "   3. Set environment variables above" -ForegroundColor Gray
    Write-Host "   4. Deploy from GitHub or using 'railway up'" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "📡 Step 3: Deploying to Railway..." -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Change to API directory
Push-Location "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api"

Write-Host "🚀 Starting deployment..." -ForegroundColor Green
Write-Host ""

# Deploy
railway up

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Get your Railway app URL from dashboard" -ForegroundColor Gray
Write-Host "  2. Update mobile app EXPO_PUBLIC_API_BASE_URL" -ForegroundColor Gray
Write-Host "  3. Rebuild and test mobile app with production URL" -ForegroundColor Gray
Write-Host ""

Write-Host "🔗 View your app:" -ForegroundColor Cyan
Write-Host "   railway open" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   railway logs" -ForegroundColor Gray
Write-Host ""

Pop-Location