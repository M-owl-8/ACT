#!/usr/bin/env pwsh
# ACT App - Release Keystore Generator
# This script generates a release keystore for Play Store signing

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACT App - Keystore Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keytool is available
try {
    $keytoolVersion = keytool -help 2>&1 | Out-Null
    Write-Host "✅ keytool found" -ForegroundColor Green
} catch {
    Write-Host "❌ keytool not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java JDK 17:" -ForegroundColor Yellow
    Write-Host "  https://adoptium.net/temurin/releases/" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Set paths
$projectRoot = $PSScriptRoot
$androidAppDir = Join-Path $projectRoot "android\app"
$keystorePath = Join-Path $androidAppDir "act-release.keystore"
$backupDir = Join-Path $projectRoot "keystore-backup"

# Check if keystore already exists
if (Test-Path $keystorePath) {
    Write-Host "⚠️  WARNING: Keystore already exists!" -ForegroundColor Yellow
    Write-Host "   Location: $keystorePath" -ForegroundColor Yellow
    Write-Host ""
    $overwrite = Read-Host "Do you want to overwrite it? (yes/no)"
    
    if ($overwrite -ne "yes") {
        Write-Host ""
        Write-Host "❌ Cancelled. Existing keystore preserved." -ForegroundColor Red
        Write-Host ""
        exit 0
    }
    
    # Backup existing keystore
    Write-Host ""
    Write-Host "📦 Backing up existing keystore..." -ForegroundColor Cyan
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path $backupDir "act-release.keystore.backup.$timestamp"
    
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    Copy-Item $keystorePath $backupFile
    Write-Host "✅ Backup saved: $backupFile" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔐 IMPORTANT: Keystore Security" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host "The keystore is the ONLY way to update your app on Play Store!" -ForegroundColor Yellow
Write-Host "• LOSE IT = You can NEVER update your app" -ForegroundColor Red
Write-Host "• FORGET PASSWORD = You can NEVER update your app" -ForegroundColor Red
Write-Host "• BACKUP IT = Save to USB drive and cloud storage" -ForegroundColor Green
Write-Host ""

$continue = Read-Host "Do you understand and want to continue? (yes/no)"
if ($continue -ne "yes") {
    Write-Host ""
    Write-Host "❌ Cancelled." -ForegroundColor Red
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "📝 Keystore Information" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Get keystore details
Write-Host "Enter keystore password (min 6 characters):" -ForegroundColor Yellow
$password1 = Read-Host -AsSecureString
$password1Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password1))

if ($password1Plain.Length -lt 6) {
    Write-Host ""
    Write-Host "❌ Password must be at least 6 characters!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "Confirm keystore password:" -ForegroundColor Yellow
$password2 = Read-Host -AsSecureString
$password2Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password2))

if ($password1Plain -ne $password2Plain) {
    Write-Host ""
    Write-Host "❌ Passwords do not match!" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Enter your details (for certificate):" -ForegroundColor Cyan
Write-Host ""

$name = Read-Host "Your name or company name (e.g., ACT Development Team)"
$orgUnit = Read-Host "Organizational unit (e.g., Mobile Development)"
$org = Read-Host "Organization (e.g., ACT)"
$city = Read-Host "City (e.g., Tokyo)"
$state = Read-Host "State/Province (e.g., Tokyo)"
$country = Read-Host "Country code (2 letters, e.g., JP)"

# Validate country code
if ($country.Length -ne 2) {
    Write-Host ""
    Write-Host "❌ Country code must be 2 letters (e.g., JP, US, UK)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "🔨 Generating keystore..." -ForegroundColor Cyan
Write-Host ""

# Build DN string
$dn = "CN=$name, OU=$orgUnit, O=$org, L=$city, ST=$state, C=$country"

# Generate keystore
$keytoolArgs = @(
    "-genkeypair",
    "-v",
    "-storetype", "PKCS12",
    "-keystore", $keystorePath,
    "-alias", "act-key",
    "-keyalg", "RSA",
    "-keysize", "2048",
    "-validity", "10000",
    "-dname", $dn,
    "-storepass", $password1Plain,
    "-keypass", $password1Plain
)

try {
    $output = & keytool $keytoolArgs 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Keystore generated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📍 Location: $keystorePath" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "❌ Failed to generate keystore!" -ForegroundColor Red
        Write-Host $output
        exit 1
    }
} catch {
    Write-Host "❌ Error generating keystore: $_" -ForegroundColor Red
    exit 1
}

# Create backup directory
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# Copy to backup
$backupFile = Join-Path $backupDir "act-release.keystore"
Copy-Item $keystorePath $backupFile -Force
Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green
Write-Host ""

# Create info file
$infoFile = Join-Path $backupDir "KEYSTORE_INFO.txt"
$infoContent = @"
ACT App Keystore Information
============================
Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Keystore Details:
-----------------
File: act-release.keystore
Alias: act-key
Algorithm: RSA
Key Size: 2048
Validity: 10000 days (~27 years)

Certificate Details:
-------------------
Name: $name
Organizational Unit: $orgUnit
Organization: $org
City: $city
State: $state
Country: $country

Passwords:
----------
Keystore Password: $password1Plain
Key Password: $password1Plain

File Locations:
--------------
Primary: android/app/act-release.keystore
Backup: keystore-backup/act-release.keystore

⚠️  CRITICAL SECURITY NOTES:
============================
1. BACKUP this keystore to multiple locations:
   - USB drive
   - Cloud storage (Google Drive, OneDrive, Dropbox)
   - Secure password manager

2. NEVER commit this file to Git!

3. NEVER share this file publicly!

4. WITHOUT this keystore, you CANNOT update your app on Play Store!

5. Store this information file securely (password manager recommended)

Next Steps:
-----------
1. Backup keystore to USB drive and cloud
2. Save this info file to password manager
3. Update gradle.properties with keystore details
4. Build release: cd android && .\gradlew bundleRelease
5. Upload to Play Console

For detailed instructions, see: PLAY_STORE_SETUP.md
"@

Set-Content -Path $infoFile -Value $infoContent
Write-Host "✅ Info file created: $infoFile" -ForegroundColor Green
Write-Host ""

# Update gradle.properties
$gradlePropsPath = Join-Path $projectRoot "android\gradle.properties"
$gradlePropsBackup = Join-Path $projectRoot "android\gradle.properties.backup"

Write-Host "📝 Updating gradle.properties..." -ForegroundColor Cyan

# Backup gradle.properties
if (Test-Path $gradlePropsPath) {
    Copy-Item $gradlePropsPath $gradlePropsBackup -Force
    Write-Host "✅ Backed up gradle.properties" -ForegroundColor Green
}

# Read existing content
$gradleContent = Get-Content $gradlePropsPath -Raw

# Check if signing config already exists
if ($gradleContent -match "ACT_RELEASE_STORE_FILE") {
    Write-Host "⚠️  Signing config already exists in gradle.properties" -ForegroundColor Yellow
    Write-Host "   Skipping update. Please update manually if needed." -ForegroundColor Yellow
} else {
    # Add signing config
    $signingConfig = @"

# ============================================
# Release Signing Configuration
# ============================================
# ⚠️  WARNING: These contain sensitive passwords!
# For production, use environment variables instead:
#   ACT_RELEASE_STORE_PASSWORD=`$env:ACT_KEYSTORE_PASSWORD
#   ACT_RELEASE_KEY_PASSWORD=`$env:ACT_KEY_PASSWORD
# ============================================
ACT_RELEASE_STORE_FILE=act-release.keystore
ACT_RELEASE_KEY_ALIAS=act-key
ACT_RELEASE_STORE_PASSWORD=$password1Plain
ACT_RELEASE_KEY_PASSWORD=$password1Plain
"@

    Add-Content -Path $gradlePropsPath -Value $signingConfig
    Write-Host "✅ Added signing config to gradle.properties" -ForegroundColor Green
}

Write-Host ""

# Update build.gradle
$buildGradlePath = Join-Path $projectRoot "android\app\build.gradle"
$buildGradleContent = Get-Content $buildGradlePath -Raw

if ($buildGradleContent -match "signingConfigs\.release") {
    Write-Host "✅ build.gradle already has release signing config" -ForegroundColor Green
} else {
    Write-Host "⚠️  build.gradle needs manual update for release signing" -ForegroundColor Yellow
    Write-Host "   See: PLAY_STORE_SETUP.md Step 2" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Keystore Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 CRITICAL NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. BACKUP THE KEYSTORE (DO THIS NOW!):" -ForegroundColor Red
Write-Host "   • Copy to USB drive:" -ForegroundColor White
Write-Host "     Copy-Item '$backupFile' -Destination 'D:\ACT_Keystore_Backup\'" -ForegroundColor Cyan
Write-Host "   • Upload to cloud storage (Google Drive, OneDrive, etc.)" -ForegroundColor White
Write-Host "   • Save password to password manager" -ForegroundColor White
Write-Host ""

Write-Host "2. VERIFY SIGNING CONFIG:" -ForegroundColor Yellow
Write-Host "   • Check: android\gradle.properties" -ForegroundColor White
Write-Host "   • Check: android\app\build.gradle" -ForegroundColor White
Write-Host "   • See: PLAY_STORE_SETUP.md Step 2" -ForegroundColor White
Write-Host ""

Write-Host "3. BUILD RELEASE:" -ForegroundColor Yellow
Write-Host "   cd android" -ForegroundColor Cyan
Write-Host "   .\gradlew clean" -ForegroundColor Cyan
Write-Host "   .\gradlew bundleRelease" -ForegroundColor Cyan
Write-Host ""

Write-Host "4. FIND YOUR AAB:" -ForegroundColor Yellow
Write-Host "   android\app\build\outputs\bundle\release\app-release.aab" -ForegroundColor Cyan
Write-Host ""

Write-Host "5. UPLOAD TO PLAY CONSOLE:" -ForegroundColor Yellow
Write-Host "   https://play.google.com/console" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Full Guide: PLAY_STORE_SETUP.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  REMEMBER: Without this keystore, you CANNOT update your app!" -ForegroundColor Red
Write-Host ""

# Ask to open info file
$openInfo = Read-Host "Open keystore info file now? (yes/no)"
if ($openInfo -eq "yes") {
    Start-Process notepad.exe $infoFile
}

Write-Host ""
Write-Host "🎉 Good luck with your Play Store submission!" -ForegroundColor Green
Write-Host ""