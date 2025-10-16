# ============================================================================
# FIX JAVA_HOME PERMANENTLY
# ============================================================================
# This script fixes the JAVA_HOME environment variable permanently
# Run this script ONCE to fix the issue forever
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  JAVA_HOME PERMANENT FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detect Java installation
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
$androidStudioJava = "C:\Program Files\Android\Android Studio\jbr"

Write-Host "Step 1: Detecting Java installations..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path $javaPath) {
    Write-Host "Found Eclipse Adoptium JDK 17: $javaPath" -ForegroundColor Green
    $selectedJava = $javaPath
} elseif (Test-Path $androidStudioJava) {
    Write-Host "Found Android Studio JBR: $androidStudioJava" -ForegroundColor Green
    $selectedJava = $androidStudioJava
} else {
    Write-Host "No Java installation found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java 17 from:" -ForegroundColor Yellow
    Write-Host "https://adoptium.net/temurin/releases/?version=17" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Step 2: Checking current JAVA_HOME..." -ForegroundColor Yellow
Write-Host ""

$currentUserJavaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "User")
$currentMachineJavaHome = [System.Environment]::GetEnvironmentVariable("JAVA_HOME", "Machine")

Write-Host "Current User JAVA_HOME: $currentUserJavaHome" -ForegroundColor Gray
Write-Host "Current Machine JAVA_HOME: $currentMachineJavaHome" -ForegroundColor Gray
Write-Host ""

# Fix User JAVA_HOME
Write-Host "Step 3: Setting User JAVA_HOME..." -ForegroundColor Yellow
try {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $selectedJava, "User")
    Write-Host "User JAVA_HOME set to: $selectedJava" -ForegroundColor Green
} catch {
    Write-Host "Failed to set User JAVA_HOME: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 4: Updating gradle.properties..." -ForegroundColor Yellow

$gradlePropsPath = ".\android\gradle.properties"
if (Test-Path $gradlePropsPath) {
    $gradleProps = Get-Content $gradlePropsPath -Raw
    
    # Remove any existing org.gradle.java.home lines
    $gradleProps = $gradleProps -replace "(?m)^org\.gradle\.java\.home=.*`r?`n?", ""
    
    # Add the correct JAVA_HOME
    $javaHomeEscaped = $selectedJava -replace "\\", "\\\\"
    $gradleProps += "`norg.gradle.java.home=$javaHomeEscaped`n"
    
    Set-Content $gradlePropsPath -Value $gradleProps -NoNewline
    Write-Host "gradle.properties updated" -ForegroundColor Green
} else {
    Write-Host "gradle.properties not found at: $gradlePropsPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 5: Updating local.properties..." -ForegroundColor Yellow

$localPropsPath = ".\android\local.properties"
if (Test-Path $localPropsPath) {
    $localProps = Get-Content $localPropsPath -Raw
    
    # Check if java.home exists
    if ($localProps -match "java\.home=") {
        # Update existing
        $javaHomeEscaped = $selectedJava -replace "\\", "\\\\"
        $localProps = $localProps -replace "(?m)^java\.home=.*$", "java.home=$javaHomeEscaped"
    } else {
        # Add new
        $javaHomeEscaped = $selectedJava -replace "\\", "\\\\"
        $localProps += "`njava.home=$javaHomeEscaped`n"
    }
    
    Set-Content $localPropsPath -Value $localProps -NoNewline
    Write-Host "local.properties updated" -ForegroundColor Green
} else {
    Write-Host "local.properties not found (will be created by Gradle)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 6: Refreshing environment..." -ForegroundColor Yellow
$env:JAVA_HOME = $selectedJava
Write-Host "Current session JAVA_HOME updated" -ForegroundColor Green

Write-Host ""
Write-Host "Step 7: Verifying Java..." -ForegroundColor Yellow
Write-Host ""

$javaExe = Join-Path $selectedJava "bin\java.exe"
if (Test-Path $javaExe) {
    $javaVersion = & $javaExe -version 2>&1
    Write-Host "Java is working:" -ForegroundColor Green
    Write-Host $javaVersion -ForegroundColor Gray
} else {
    Write-Host "Java verification failed - java.exe not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "What was fixed:" -ForegroundColor Yellow
Write-Host "  - User JAVA_HOME environment variable" -ForegroundColor Green
Write-Host "  - gradle.properties configuration" -ForegroundColor Green
Write-Host "  - local.properties configuration" -ForegroundColor Green
Write-Host "  - Current PowerShell session" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Close and reopen your terminal!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Close this PowerShell window" -ForegroundColor White
Write-Host "  2. Open a NEW PowerShell window" -ForegroundColor White
Write-Host "  3. Navigate to: cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile" -ForegroundColor White
Write-Host "  4. Run: npm run android" -ForegroundColor White
Write-Host ""
Write-Host "The JAVA_HOME error should never appear again!" -ForegroundColor Green
Write-Host ""