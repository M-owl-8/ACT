# ========================================
#  ACT Gen-1 - Release Keystore Generator
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACT Gen-1 Keystore Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keystore already exists
$keystorePath = "android\app\act-release.keystore"
if (Test-Path $keystorePath) {
    Write-Host "⚠️  WARNING: Keystore already exists!" -ForegroundColor Yellow
    Write-Host "   Location: $keystorePath" -ForegroundColor Yellow
    Write-Host ""
    $overwrite = Read-Host "Do you want to create a new keystore? This will backup the old one. (yes/no)"
    
    if ($overwrite -ne "yes") {
        Write-Host "❌ Cancelled. Existing keystore preserved." -ForegroundColor Red
        exit 0
    }
    
    # Backup existing keystore
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupPath = "android\app\act-release-backup-$timestamp.keystore"
    Copy-Item $keystorePath $backupPath
    Write-Host "✅ Existing keystore backed up to: $backupPath" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📋 This script will generate a release keystore for signing your Android app." -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT WARNINGS:" -ForegroundColor Yellow
Write-Host "   1. The keystore and password are CRITICAL for app updates" -ForegroundColor Yellow
Write-Host "   2. If you lose them, you can NEVER update your app on Play Store" -ForegroundColor Yellow
Write-Host "   3. You'll have to publish a completely new app" -ForegroundColor Yellow
Write-Host "   4. BACKUP the keystore to multiple secure locations" -ForegroundColor Yellow
Write-Host ""

# Confirm user understands
$confirm = Read-Host "Do you understand these warnings? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "❌ Cancelled. Please read the warnings carefully." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 1: Keystore Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get keystore password
Write-Host "Enter a STRONG password for the keystore:" -ForegroundColor White
Write-Host "(Minimum 6 characters, use letters, numbers, and symbols)" -ForegroundColor Gray
$password1 = Read-Host "Password" -AsSecureString
$password2 = Read-Host "Confirm password" -AsSecureString

# Convert to plain text for comparison
$pwd1Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password1))
$pwd2Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password2))

if ($pwd1Plain -ne $pwd2Plain) {
    Write-Host "❌ Passwords don't match. Please try again." -ForegroundColor Red
    exit 1
}

if ($pwd1Plain.Length -lt 6) {
    Write-Host "❌ Password too short. Minimum 6 characters required." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Password set" -ForegroundColor Green
Write-Host ""

# Get organization information
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 2: Organization Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This information will be embedded in the keystore." -ForegroundColor Gray
Write-Host "You can press Enter to skip optional fields." -ForegroundColor Gray
Write-Host ""

$name = Read-Host "Your name or company name"
$unit = Read-Host "Organizational unit (optional, press Enter to skip)"
$org = Read-Host "Organization name (optional, press Enter to skip)"
$city = Read-Host "City (optional, press Enter to skip)"
$state = Read-Host "State/Province (optional, press Enter to skip)"
$country = Read-Host "Country code (e.g., US, UK, UZ)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Step 3: Generating Keystore" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Build keytool command
$keytoolCmd = "keytool -genkeypair -v -storetype PKCS12 -keystore `"$keystorePath`" -alias act-key -keyalg RSA -keysize 2048 -validity 10000"

# Build distinguished name
$dn = "CN=$name"
if ($unit) { $dn += ", OU=$unit" }
if ($org) { $dn += ", O=$org" }
if ($city) { $dn += ", L=$city" }
if ($state) { $dn += ", ST=$state" }
if ($country) { $dn += ", C=$country" }

$keytoolCmd += " -dname `"$dn`""
$keytoolCmd += " -storepass `"$pwd1Plain`" -keypass `"$pwd1Plain`""

Write-Host "Generating keystore..." -ForegroundColor Yellow

try {
    # Execute keytool
    Invoke-Expression $keytoolCmd 2>&1 | Out-Null
    
    if (Test-Path $keystorePath) {
        Write-Host "✅ Keystore generated successfully!" -ForegroundColor Green
        Write-Host ""
        
        # Show keystore info
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Keystore Information" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "Location: $keystorePath" -ForegroundColor White
        Write-Host "Alias: act-key" -ForegroundColor White
        Write-Host "Algorithm: RSA 2048-bit" -ForegroundColor White
        Write-Host "Validity: 10,000 days (~27 years)" -ForegroundColor White
        Write-Host ""
        
        # Backup instructions
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  ⚠️  CRITICAL: BACKUP YOUR KEYSTORE" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Creating automatic backups..." -ForegroundColor Yellow
        
        # Create backups
        $desktopBackup = "$env:USERPROFILE\Desktop\act-release-BACKUP.keystore"
        $documentsBackup = "$env:USERPROFILE\Documents\act-release-BACKUP.keystore"
        
        Copy-Item $keystorePath $desktopBackup -Force
        Copy-Item $keystorePath $documentsBackup -Force
        
        Write-Host "✅ Backup 1: $desktopBackup" -ForegroundColor Green
        Write-Host "✅ Backup 2: $documentsBackup" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "⚠️  ADDITIONAL BACKUPS REQUIRED:" -ForegroundColor Yellow
        Write-Host "   1. Upload to cloud storage (Google Drive, OneDrive, Dropbox)" -ForegroundColor White
        Write-Host "   2. Copy to USB drive and store in safe place" -ForegroundColor White
        Write-Host "   3. Save password in password manager (1Password, LastPass, etc.)" -ForegroundColor White
        Write-Host "   4. Write password on paper and store securely" -ForegroundColor White
        Write-Host ""
        
        # Save password to file (encrypted)
        Write-Host "Do you want to save the password to an encrypted file? (yes/no)" -ForegroundColor White
        $savePassword = Read-Host
        
        if ($savePassword -eq "yes") {
            $passwordFile = "$env:USERPROFILE\Desktop\act-keystore-password.txt"
            $pwd1Plain | Out-File $passwordFile
            Write-Host "✅ Password saved to: $passwordFile" -ForegroundColor Green
            Write-Host "   ⚠️  Keep this file secure and delete after backing up!" -ForegroundColor Yellow
            Write-Host ""
        }
        
        # Configure gradle.properties
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Step 4: Configure Gradle Properties" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        $gradlePropsPath = "android\gradle.properties"
        $gradleProps = Get-Content $gradlePropsPath -Raw
        
        # Check if already configured
        if ($gradleProps -match "ACT_RELEASE_STORE_FILE") {
            Write-Host "⚠️  Gradle properties already configured" -ForegroundColor Yellow
            Write-Host "   Updating with new password..." -ForegroundColor Yellow
            
            # Update existing configuration
            $gradleProps = $gradleProps -replace "ACT_RELEASE_STORE_PASSWORD=.*", "ACT_RELEASE_STORE_PASSWORD=$pwd1Plain"
            $gradleProps = $gradleProps -replace "ACT_RELEASE_KEY_PASSWORD=.*", "ACT_RELEASE_KEY_PASSWORD=$pwd1Plain"
            
            $gradleProps | Out-File $gradlePropsPath -Encoding UTF8
        } else {
            Write-Host "Adding keystore configuration to gradle.properties..." -ForegroundColor Yellow
            
            # Add new configuration
            $keystoreConfig = @"

# Release keystore configuration
ACT_RELEASE_STORE_FILE=act-release.keystore
ACT_RELEASE_KEY_ALIAS=act-key
ACT_RELEASE_STORE_PASSWORD=$pwd1Plain
ACT_RELEASE_KEY_PASSWORD=$pwd1Plain
"@
            
            Add-Content $gradlePropsPath $keystoreConfig
        }
        
        Write-Host "✅ Gradle properties configured" -ForegroundColor Green
        Write-Host ""
        
        # Final instructions
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor White
        Write-Host "1. BACKUP the keystore to cloud storage and USB" -ForegroundColor White
        Write-Host "2. SAVE the password securely" -ForegroundColor White
        Write-Host "3. Build release APK:" -ForegroundColor White
        Write-Host "   cd android" -ForegroundColor Gray
        Write-Host "   .\gradlew assembleRelease" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Release APK will be at:" -ForegroundColor White
        Write-Host "android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Gray
        Write-Host ""
        
    } else {
        Write-Host "❌ Failed to generate keystore" -ForegroundColor Red
        Write-Host "Please check the error messages above" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Error generating keystore: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")