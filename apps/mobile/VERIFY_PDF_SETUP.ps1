# PDF Reader Setup Verification Script

Write-Host "Verifying PDF Reader Setup..." -ForegroundColor Cyan
Write-Host ""

# 1. Check PDF files
Write-Host "1. Checking PDF Files..." -ForegroundColor Yellow
$pdfDir = "c:\work\act-gen1\apps\mobile\assets\books"

if (Test-Path $pdfDir) {
    Write-Host "[OK] Books directory exists: $pdfDir" -ForegroundColor Green
    $pdfFiles = Get-ChildItem -Path $pdfDir -Filter "*.pdf" -ErrorAction SilentlyContinue
    
    if ($pdfFiles) {
        Write-Host "[OK] Found $($pdfFiles.Count) PDF files:" -ForegroundColor Green
        foreach ($file in $pdfFiles) {
            $sizeMB = [math]::Round($file.Length / 1MB, 2)
            Write-Host "   - $($file.Name) ($sizeMB MB)" -ForegroundColor Green
        }
    } else {
        Write-Host "[ERROR] No PDF files found in $pdfDir" -ForegroundColor Red
        Write-Host "   Please copy Book_1.pdf, Book_2.pdf, Book_3.pdf to this directory" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] Books directory does NOT exist: $pdfDir" -ForegroundColor Red
    Write-Host "   Creating directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $pdfDir -Force | Out-Null
    Write-Host "[OK] Directory created!" -ForegroundColor Green
}

Write-Host ""

# 2. Check if react-native-pdf is installed
Write-Host "2. Checking react-native-pdf..." -ForegroundColor Yellow
$packageJsonPath = "c:\work\act-gen1\apps\mobile\package.json"

if (Test-Path $packageJsonPath) {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    if ($packageJson.dependencies."react-native-pdf") {
        $version = $packageJson.dependencies."react-native-pdf"
        Write-Host "[OK] react-native-pdf is installed: $version" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] react-native-pdf NOT found in dependencies" -ForegroundColor Red
        Write-Host "   Run: npm install react-native-pdf" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] package.json not found" -ForegroundColor Red
}

Write-Host ""

# 3. Check if node_modules exists
Write-Host "3. Checking node_modules..." -ForegroundColor Yellow
$nodeModulesPath = "c:\work\act-gen1\apps\mobile\node_modules"

if (Test-Path $nodeModulesPath) {
    $pdfModulePath = "$nodeModulesPath\react-native-pdf"
    if (Test-Path $pdfModulePath) {
        Write-Host "[OK] react-native-pdf is installed in node_modules" -ForegroundColor Green
    } else {
        Write-Host "[WARN] react-native-pdf NOT in node_modules" -ForegroundColor Yellow
        Write-Host "   Run: npm install" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] node_modules NOT found" -ForegroundColor Red
    Write-Host "   Run: npm install" -ForegroundColor Yellow
}

Write-Host ""

# 4. Summary
Write-Host "Verification Summary:" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks are [OK], your setup is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Start the app with:" -ForegroundColor White
Write-Host "  cd c:\work\act-gen1\apps\mobile" -ForegroundColor Gray
Write-Host "  npm start" -ForegroundColor Gray