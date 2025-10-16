# Test Script for BlurView Fix
# This script helps verify the fix is working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BlurView Fix Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if expo-blur is removed from package.json
Write-Host "1. Checking package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.dependencies.'expo-blur') {
    Write-Host "   ❌ expo-blur still in dependencies" -ForegroundColor Red
} else {
    Write-Host "   ✅ expo-blur removed from dependencies" -ForegroundColor Green
}

# Check if expo-blur plugin is removed from app.json
Write-Host "2. Checking app.json..." -ForegroundColor Yellow
$appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
if ($appJson.expo.plugins -contains "expo-blur") {
    Write-Host "   ❌ expo-blur still in plugins" -ForegroundColor Red
} else {
    Write-Host "   ✅ expo-blur removed from plugins" -ForegroundColor Green
}

# Check if JapaneseLockScreen.tsx has the fallback
Write-Host "3. Checking JapaneseLockScreen.tsx..." -ForegroundColor Yellow
$lockScreen = Get-Content "src\screens\JapaneseLockScreen.tsx" -Raw
if ($lockScreen -match "require\('expo-blur'\)") {
    Write-Host "   ❌ Still using require('expo-blur')" -ForegroundColor Red
} else {
    Write-Host "   ✅ Using fallback BlurView component" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The app is being rebuilt. Once complete:" -ForegroundColor White
Write-Host "1. Open the app on your phone" -ForegroundColor White
Write-Host "2. Check if the login screen loads without errors" -ForegroundColor White
Write-Host "3. Verify the glass card effect looks acceptable" -ForegroundColor White
Write-Host ""
Write-Host "If you see any errors, check:" -ForegroundColor Yellow
Write-Host "- Metro bundler terminal for JavaScript errors" -ForegroundColor Yellow
Write-Host "- Android logcat for native errors" -ForegroundColor Yellow
Write-Host ""