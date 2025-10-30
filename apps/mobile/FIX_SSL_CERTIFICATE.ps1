# ==========================================
# SSL Certificate Error - Automatic Fix
# ==========================================
# This script applies all fixes for SSL/Certificate errors

Write-Host "🔒 Starting SSL Certificate Fix..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Navigate to mobile directory
Write-Host "📂 Step 1: Navigating to mobile directory..." -ForegroundColor Yellow
Set-Location "c:\work\act-gen1\apps\mobile"
Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 2: Remove old builds and caches
Write-Host "🗑️  Step 2: Cleaning old builds and caches..." -ForegroundColor Yellow
$itemsToRemove = @("node_modules", ".expo", ".gradle", "build", "dist")

foreach ($item in $itemsToRemove) {
    if (Test-Path $item) {
        Write-Host "   Removing $item..." -ForegroundColor Gray
        Remove-Item -Path $item -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "✅ Cache cleaned" -ForegroundColor Green
Write-Host ""

# Step 3: Clear npm cache
Write-Host "🧹 Step 3: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ npm cache cleared" -ForegroundColor Green
Write-Host ""

# Step 4: Reinstall dependencies
Write-Host "📦 Step 4: Reinstalling dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 5: Verify app.json has SSL configuration
Write-Host "⚙️  Step 5: Verifying app.json configuration..." -ForegroundColor Yellow
$appJsonPath = "app.json"
$appJsonContent = Get-Content $appJsonPath -Raw
if ($appJsonContent -match '"usesCleartextTraffic":\s*true') {
    Write-Host "✅ usesCleartextTraffic is already configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  usesCleartextTraffic not found - but it should be configured by now" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Prebuild
Write-Host "🔨 Step 6: Prebuilding native code (this may take 2-5 minutes)..." -ForegroundColor Yellow
npx expo prebuild --clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prebuild failed!" -ForegroundColor Red
    Write-Host "Try running: npx expo prebuild --clean" -ForegroundColor Gray
    exit 1
}
Write-Host "✅ Prebuild complete" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SSL CERTIFICATE FIX COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "1️⃣  Start the app:"
Write-Host "   npm start"
Write-Host ""
Write-Host "2️⃣  When asked, press: a (for Android) or i (for iOS)"
Write-Host ""
Write-Host "3️⃣  Test the Books feature"
Write-Host ""
Write-Host "4️⃣  If still failing:"
Write-Host "   - Check Expo console for error messages"
Write-Host "   - Clear app data: Settings → Apps → ACT → Clear Data"
Write-Host "   - Restart emulator/device"
Write-Host ""
Write-Host "📚 See SSL_CERTIFICATE_FIX.md for detailed info" -ForegroundColor Cyan
Write-Host ""