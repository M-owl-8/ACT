# ACT Gen-1 Testing Script
# This script helps with testing the mobile app

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   ACT Gen-1 Testing Helper    " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Function to display menu
function Show-Menu {
    Write-Host "Select Testing Option:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Start App (Android)" -ForegroundColor Green
    Write-Host "2. Start App (iOS)" -ForegroundColor Green
    Write-Host "3. Start App (Web)" -ForegroundColor Green
    Write-Host "4. View Android Logs" -ForegroundColor Cyan
    Write-Host "5. View iOS Logs" -ForegroundColor Cyan
    Write-Host "6. Clear Cache & Restart" -ForegroundColor Magenta
    Write-Host "7. Run Type Check" -ForegroundColor Yellow
    Write-Host "8. Check Dependencies" -ForegroundColor Yellow
    Write-Host "9. View Test Checklist" -ForegroundColor Blue
    Write-Host "0. Exit" -ForegroundColor Red
    Write-Host ""
}

# Function to start app on Android
function Start-Android {
    Write-Host "Starting app on Android..." -ForegroundColor Green
    Set-Location "apps\mobile"
    npm run android
    Set-Location "..\..\"
}

# Function to start app on iOS
function Start-iOS {
    Write-Host "Starting app on iOS..." -ForegroundColor Green
    Set-Location "apps\mobile"
    npm run ios
    Set-Location "..\..\"
}

# Function to start app on Web
function Start-Web {
    Write-Host "Starting app on Web..." -ForegroundColor Green
    Set-Location "apps\mobile"
    npm run web
    Set-Location "..\..\"
}

# Function to view Android logs
function View-AndroidLogs {
    Write-Host "Viewing Android logs..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    adb logcat *:E
}

# Function to view iOS logs
function View-iOSLogs {
    Write-Host "Viewing iOS logs..." -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    xcrun simctl spawn booted log stream --level=error
}

# Function to clear cache
function Clear-Cache {
    Write-Host "Clearing cache..." -ForegroundColor Magenta
    Set-Location "apps\mobile"
    
    Write-Host "Removing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    
    Write-Host "Removing .expo cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
    
    Write-Host "Clearing npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    
    Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
    npm install
    
    Write-Host "Starting app..." -ForegroundColor Green
    npm start -- --clear
    
    Set-Location "..\..\"
}

# Function to run type check
function Run-TypeCheck {
    Write-Host "Running TypeScript type check..." -ForegroundColor Yellow
    Set-Location "apps\mobile"
    npx tsc --noEmit
    Set-Location "..\..\"
}

# Function to check dependencies
function Check-Dependencies {
    Write-Host "Checking dependencies..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check Node version
    Write-Host "Node.js version:" -ForegroundColor Cyan
    node --version
    Write-Host ""
    
    # Check npm version
    Write-Host "npm version:" -ForegroundColor Cyan
    npm --version
    Write-Host ""
    
    # Check Expo CLI
    Write-Host "Expo CLI:" -ForegroundColor Cyan
    npx expo --version
    Write-Host ""
    
    # Check if Android SDK is available
    Write-Host "Android SDK:" -ForegroundColor Cyan
    if (Get-Command adb -ErrorAction SilentlyContinue) {
        adb version
    } else {
        Write-Host "Not installed or not in PATH" -ForegroundColor Red
    }
    Write-Host ""
    
    # Check mobile dependencies
    Write-Host "Mobile app dependencies:" -ForegroundColor Cyan
    Set-Location "apps\mobile"
    npm list --depth=0
    Set-Location "..\..\"
}

# Function to view test checklist
function View-TestChecklist {
    Write-Host "Opening test checklist..." -ForegroundColor Blue
    $checklistPath = "MISSION_11_QA_TESTING.md"
    if (Test-Path $checklistPath) {
        Start-Process notepad $checklistPath
    } else {
        Write-Host "Test checklist not found!" -ForegroundColor Red
    }
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" { Start-Android }
        "2" { Start-iOS }
        "3" { Start-Web }
        "4" { View-AndroidLogs }
        "5" { View-iOSLogs }
        "6" { Clear-Cache }
        "7" { Run-TypeCheck }
        "8" { Check-Dependencies }
        "9" { View-TestChecklist }
        "0" { 
            Write-Host "Exiting..." -ForegroundColor Red
            break
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
    }
} while ($choice -ne "0")

Write-Host ""
Write-Host "Thank you for testing ACT Gen-1!" -ForegroundColor Green
Write-Host ""