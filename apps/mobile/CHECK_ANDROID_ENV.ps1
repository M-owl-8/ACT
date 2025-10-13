# Android Environment Check Script
# Run this to verify your Android development environment is set up correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Android Environment Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Java
Write-Host "Checking Java JDK..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    if ($javaVersion -match '"(\d+)\.') {
        $majorVersion = $matches[1]
        if ($majorVersion -eq "17" -or $majorVersion -eq "11") {
            Write-Host "✅ Java $majorVersion detected: $javaVersion" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Java $majorVersion detected, but Java 17 is recommended" -ForegroundColor Yellow
            Write-Host "   Download from: https://adoptium.net/temurin/releases/" -ForegroundColor Gray
            $allGood = $false
        }
    }
} catch {
    Write-Host "❌ Java not found!" -ForegroundColor Red
    Write-Host "   Install Java 17 from: https://adoptium.net/temurin/releases/" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check ANDROID_HOME
Write-Host "Checking ANDROID_HOME..." -ForegroundColor Yellow
$androidHome = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
if (-not $androidHome) {
    $androidHome = [System.Environment]::GetEnvironmentVariable("ANDROID_HOME", "Machine")
}

if ($androidHome -and (Test-Path $androidHome)) {
    Write-Host "✅ ANDROID_HOME set: $androidHome" -ForegroundColor Green
} else {
    Write-Host "❌ ANDROID_HOME not set or path doesn't exist!" -ForegroundColor Red
    Write-Host "   Set it to: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check ADB
Write-Host "Checking Android Debug Bridge (adb)..." -ForegroundColor Yellow
try {
    $adbVersion = adb version 2>&1 | Select-String "Android Debug Bridge" | Select-Object -First 1
    Write-Host "✅ ADB found: $adbVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB not found in PATH!" -ForegroundColor Red
    Write-Host "   Add to PATH: %ANDROID_HOME%\platform-tools" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check Android SDK
Write-Host "Checking Android SDK..." -ForegroundColor Yellow
if ($androidHome -and (Test-Path $androidHome)) {
    $platformsPath = Join-Path $androidHome "platforms"
    if (Test-Path $platformsPath) {
        $platforms = Get-ChildItem $platformsPath -Directory | Select-Object -ExpandProperty Name
        if ($platforms.Count -gt 0) {
            Write-Host "✅ Android SDK platforms found:" -ForegroundColor Green
            foreach ($platform in $platforms) {
                Write-Host "   - $platform" -ForegroundColor Gray
            }
            
            # Check for API 34 (Android 14)
            if ($platforms -contains "android-34") {
                Write-Host "✅ Android 14 (API 34) installed - matches your app!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Android 14 (API 34) not found - install it in Android Studio" -ForegroundColor Yellow
                $allGood = $false
            }
        } else {
            Write-Host "❌ No Android platforms installed!" -ForegroundColor Red
            Write-Host "   Install via Android Studio SDK Manager" -ForegroundColor Gray
            $allGood = $false
        }
    } else {
        Write-Host "❌ Android SDK platforms folder not found!" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "⏭️  Skipped (ANDROID_HOME not set)" -ForegroundColor Gray
}
Write-Host ""

# Check Gradle
Write-Host "Checking Gradle..." -ForegroundColor Yellow
$gradlewPath = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\android\gradlew.bat"
if (Test-Path $gradlewPath) {
    Write-Host "✅ Gradle wrapper found in android/" -ForegroundColor Green
} else {
    Write-Host "❌ Gradle wrapper not found!" -ForegroundColor Red
    Write-Host "   Run 'npx expo prebuild' to generate it" -ForegroundColor Gray
    $allGood = $false
}
Write-Host ""

# Check Android Studio
Write-Host "Checking Android Studio..." -ForegroundColor Yellow
$androidStudioPaths = @(
    "C:\Program Files\Android\Android Studio\bin\studio64.exe",
    "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe"
)
$studioFound = $false
foreach ($path in $androidStudioPaths) {
    if (Test-Path $path) {
        Write-Host "✅ Android Studio found: $path" -ForegroundColor Green
        $studioFound = $true
        break
    }
}
if (-not $studioFound) {
    Write-Host "⚠️  Android Studio not found in default locations" -ForegroundColor Yellow
    Write-Host "   Download from: https://developer.android.com/studio" -ForegroundColor Gray
}
Write-Host ""

# Check for running emulators
Write-Host "Checking for running emulators..." -ForegroundColor Yellow
try {
    $devices = adb devices 2>&1 | Select-String "device$" | Where-Object { $_ -notmatch "List of devices" }
    if ($devices.Count -gt 0) {
        Write-Host "✅ Found $($devices.Count) connected device(s):" -ForegroundColor Green
        foreach ($device in $devices) {
            Write-Host "   - $device" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  No devices/emulators connected" -ForegroundColor Yellow
        Write-Host "   Start an emulator in Android Studio before running the app" -ForegroundColor Gray
    }
} catch {
    Write-Host "⏭️  Skipped (ADB not available)" -ForegroundColor Gray
}
Write-Host ""

# Final summary
Write-Host "========================================" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✅ Environment looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Start an Android emulator in Android Studio" -ForegroundColor White
    Write-Host "2. Run: npm run android" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues found - fix them before building" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Setup guide:" -ForegroundColor Cyan
    Write-Host "See BARE_RN_MIGRATION_GUIDE.md for detailed instructions" -ForegroundColor White
}
Write-Host "========================================" -ForegroundColor Cyan