# JapaneseNightBackdrop Quick Test Script
# This script helps you quickly test the backdrop component

Write-Host "🎨 JapaneseNightBackdrop Quick Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$mobileDir = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile"

# Check if we're in the right directory
if (-not (Test-Path $mobileDir)) {
    Write-Host "❌ Error: Mobile app directory not found!" -ForegroundColor Red
    Write-Host "   Expected: $mobileDir" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Mobile app directory found" -ForegroundColor Green
Write-Host ""

# Check if component exists
$componentPath = "$mobileDir\src\components\JapaneseNightBackdrop.tsx"
if (Test-Path $componentPath) {
    Write-Host "✅ JapaneseNightBackdrop component exists" -ForegroundColor Green
} else {
    Write-Host "❌ Component not found at: $componentPath" -ForegroundColor Red
    exit 1
}

# Check if demo screen exists
$demoPath = "$mobileDir\src\screens\BackdropDemoScreen.tsx"
if (Test-Path $demoPath) {
    Write-Host "✅ Demo screen exists" -ForegroundColor Green
} else {
    Write-Host "❌ Demo screen not found at: $demoPath" -ForegroundColor Red
    exit 1
}

# Check package.json for dependencies
$packageJsonPath = "$mobileDir\package.json"
$packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json

$hasLinearGradient = $packageJson.dependencies.PSObject.Properties.Name -contains "expo-linear-gradient"
$hasSvg = $packageJson.dependencies.PSObject.Properties.Name -contains "react-native-svg"

if ($hasLinearGradient) {
    Write-Host "✅ expo-linear-gradient in package.json" -ForegroundColor Green
} else {
    Write-Host "⚠️  expo-linear-gradient not in package.json" -ForegroundColor Yellow
}

if ($hasSvg) {
    Write-Host "✅ react-native-svg in package.json" -ForegroundColor Green
} else {
    Write-Host "⚠️  react-native-svg not in package.json" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Checking node_modules..." -ForegroundColor Cyan

# Check if dependencies are installed
$linearGradientInstalled = Test-Path "$mobileDir\node_modules\expo-linear-gradient"
$svgInstalled = Test-Path "$mobileDir\node_modules\react-native-svg"

if ($linearGradientInstalled) {
    Write-Host "✅ expo-linear-gradient installed" -ForegroundColor Green
} else {
    Write-Host "❌ expo-linear-gradient NOT installed" -ForegroundColor Red
    $needsInstall = $true
}

if ($svgInstalled) {
    Write-Host "✅ react-native-svg installed" -ForegroundColor Green
} else {
    Write-Host "❌ react-native-svg NOT installed" -ForegroundColor Red
    $needsInstall = $true
}

Write-Host ""

if ($needsInstall) {
    Write-Host "⚠️  Some dependencies are missing!" -ForegroundColor Yellow
    Write-Host ""
    $response = Read-Host "Would you like to install them now? (y/n)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
        Set-Location $mobileDir
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Installation failed. Please run 'npm install' manually." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "⚠️  Please install dependencies manually:" -ForegroundColor Yellow
        Write-Host "   cd $mobileDir" -ForegroundColor White
        Write-Host "   npm install" -ForegroundColor White
        exit 0
    }
}

Write-Host ""
Write-Host "🎉 All checks passed!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start the mobile app:" -ForegroundColor White
Write-Host "      cd $mobileDir" -ForegroundColor Gray
Write-Host "      npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Add BackdropDemoScreen to your navigation in App.tsx:" -ForegroundColor White
Write-Host "      import BackdropDemoScreen from './src/screens/BackdropDemoScreen';" -ForegroundColor Gray
Write-Host "      Add screen to Stack.Navigator" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Navigate to the demo screen to see the backdrop in action!" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Component README: apps\mobile\src\components\README.md" -ForegroundColor Gray
Write-Host "   - Integration Guide: BACKDROP_INTEGRATION_GUIDE.md" -ForegroundColor Gray
Write-Host "   - Summary: BACKDROP_SUMMARY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Happy coding!" -ForegroundColor Green