# ACT Gen-1 Phase 1 Testing Script
# This script helps you test the new Password Reset and Books features

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ACT Gen-1 Phase 1 Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
if ($currentDir.Path -notlike "*act-gen1*") {
    Write-Host "⚠️  Warning: You might not be in the act-gen1 directory" -ForegroundColor Yellow
    Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📋 Phase 1 Testing Checklist" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Mission 3: Password Reset System" -ForegroundColor Green
Write-Host "✅ Mission 4: Books System UI" -ForegroundColor Green
Write-Host ""

# Function to test backend
function Test-Backend {
    Write-Host "🔍 Testing Backend..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is running!" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Backend is not running" -ForegroundColor Red
        return $false
    }
}

# Function to test password reset endpoint
function Test-PasswordResetEndpoint {
    Write-Host "🔍 Testing Password Reset Endpoint..." -ForegroundColor Cyan
    
    try {
        $body = @{
            email = "test@example.com"
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "http://localhost:8000/password-reset/request" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Password Reset endpoint is working!" -ForegroundColor Green
            $data = $response.Content | ConvertFrom-Json
            if ($data.token) {
                Write-Host "✅ Token generated: $($data.token.Substring(0, 10))..." -ForegroundColor Green
            }
            return $true
        }
    } catch {
        Write-Host "❌ Password Reset endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test books endpoint
function Test-BooksEndpoint {
    Write-Host "🔍 Testing Books Endpoint..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/books" -Method GET -TimeoutSec 5
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            $bookCount = $data.Count
            Write-Host "✅ Books endpoint is working!" -ForegroundColor Green
            Write-Host "✅ Found $bookCount books" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Books endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main menu
function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Test Backend Health" -ForegroundColor White
    Write-Host "2. Test Password Reset API" -ForegroundColor White
    Write-Host "3. Test Books API" -ForegroundColor White
    Write-Host "4. Run All Tests" -ForegroundColor White
    Write-Host "5. Start Backend" -ForegroundColor White
    Write-Host "6. Start Mobile App" -ForegroundColor White
    Write-Host "7. View Testing Guide" -ForegroundColor White
    Write-Host "8. View Your Tasks" -ForegroundColor White
    Write-Host "9. Exit" -ForegroundColor White
    Write-Host ""
}

# Start backend
function Start-Backend {
    Write-Host "🚀 Starting Backend..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening new PowerShell window for backend..." -ForegroundColor Yellow
    Write-Host "The backend will run at: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "API docs will be at: http://localhost:8000/docs" -ForegroundColor Yellow
    Write-Host ""
    
    $backendPath = Join-Path $PSScriptRoot "apps\api"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    if (Test-Backend) {
        Write-Host "✅ Backend started successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend might still be starting. Check the other window." -ForegroundColor Yellow
    }
}

# Start mobile app
function Start-MobileApp {
    Write-Host "📱 Starting Mobile App..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opening new PowerShell window for mobile app..." -ForegroundColor Yellow
    Write-Host "Expo will start in development mode" -ForegroundColor Yellow
    Write-Host ""
    
    $mobilePath = Join-Path $PSScriptRoot "apps\mobile"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$mobilePath'; npx expo start"
    
    Write-Host "✅ Mobile app starting in new window!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Wait for Expo to start" -ForegroundColor White
    Write-Host "2. Press 'a' for Android emulator" -ForegroundColor White
    Write-Host "3. Or scan QR code with Expo Go app" -ForegroundColor White
}

# View testing guide
function Show-TestingGuide {
    Write-Host ""
    Write-Host "📖 Testing Guide" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔐 Password Reset Testing:" -ForegroundColor Yellow
    Write-Host "1. Open app and go to login screen" -ForegroundColor White
    Write-Host "2. Click 'Forgot Password?' link" -ForegroundColor White
    Write-Host "3. Enter email: test@example.com" -ForegroundColor White
    Write-Host "4. Click 'Send Reset Link'" -ForegroundColor White
    Write-Host "5. Copy token from alert (DEV MODE)" -ForegroundColor White
    Write-Host "6. Enter token and new password" -ForegroundColor White
    Write-Host "7. Click 'Reset Password'" -ForegroundColor White
    Write-Host "8. Login with new password" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Books System Testing:" -ForegroundColor Yellow
    Write-Host "1. Login to the app" -ForegroundColor White
    Write-Host "2. Go to Books tab (book icon)" -ForegroundColor White
    Write-Host "3. Check statistics dashboard" -ForegroundColor White
    Write-Host "4. Tap any book to see details" -ForegroundColor White
    Write-Host "5. Click 'Start Reading'" -ForegroundColor White
    Write-Host "6. Click 'Update Progress' and enter %" -ForegroundColor White
    Write-Host "7. Click 'Mark Complete'" -ForegroundColor White
    Write-Host "8. Go back and verify stats updated" -ForegroundColor White
    Write-Host ""
    Write-Host "📄 For detailed guide, see: PHASE_1_QUICK_TEST.md" -ForegroundColor Cyan
    Write-Host ""
}

# View your tasks
function Show-YourTasks {
    Write-Host ""
    Write-Host "📋 Your Tasks" -ForegroundColor Cyan
    Write-Host "=============" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔴 Priority 1: Test What I Built (30-60 min)" -ForegroundColor Red
    Write-Host "   - Test Password Reset" -ForegroundColor White
    Write-Host "   - Test Books System" -ForegroundColor White
    Write-Host "   - Test Translations" -ForegroundColor White
    Write-Host "   - Test Dark Mode" -ForegroundColor White
    Write-Host ""
    Write-Host "🟡 Priority 2: Mission 1 - Expo Prebuild (1-2 hours)" -ForegroundColor Yellow
    Write-Host "   - Run: npx expo prebuild" -ForegroundColor White
    Write-Host "   - Test Android build" -ForegroundColor White
    Write-Host ""
    Write-Host "🟡 Priority 3: Mission 2 - Push Notifications (2-3 hours)" -ForegroundColor Yellow
    Write-Host "   - Set up Firebase project" -ForegroundColor White
    Write-Host "   - Configure FCM" -ForegroundColor White
    Write-Host ""
    Write-Host "🟢 Priority 4: Configure Email Service (30-60 min)" -ForegroundColor Green
    Write-Host "   - Set up Gmail SMTP" -ForegroundColor White
    Write-Host "   - Update backend config" -ForegroundColor White
    Write-Host ""
    Write-Host "🟢 Priority 5: Mission 5 - QA Testing (2-4 hours)" -ForegroundColor Green
    Write-Host "   - Test all 19 screens" -ForegroundColor White
    Write-Host "   - Document bugs" -ForegroundColor White
    Write-Host ""
    Write-Host "📄 For detailed tasks, see: YOUR_TASKS.md" -ForegroundColor Cyan
    Write-Host ""
}

# Run all tests
function Run-AllTests {
    Write-Host ""
    Write-Host "🧪 Running All Tests..." -ForegroundColor Cyan
    Write-Host ""
    
    $results = @{
        Backend = Test-Backend
        PasswordReset = $false
        Books = $false
    }
    
    if ($results.Backend) {
        Start-Sleep -Seconds 1
        $results.PasswordReset = Test-PasswordResetEndpoint
        Start-Sleep -Seconds 1
        $results.Books = Test-BooksEndpoint
    }
    
    Write-Host ""
    Write-Host "📊 Test Results:" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    
    foreach ($test in $results.Keys) {
        $status = if ($results[$test]) { "✅ PASS" } else { "❌ FAIL" }
        $color = if ($results[$test]) { "Green" } else { "Red" }
        Write-Host "$status - $test" -ForegroundColor $color
    }
    
    Write-Host ""
    
    $passCount = ($results.Values | Where-Object { $_ -eq $true }).Count
    $totalCount = $results.Count
    
    if ($passCount -eq $totalCount) {
        Write-Host "🎉 All tests passed! ($passCount/$totalCount)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some tests failed ($passCount/$totalCount passed)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "💡 Tip: Make sure the backend is running" -ForegroundColor Yellow
        Write-Host "   Run option 5 to start the backend" -ForegroundColor Yellow
    }
}

# Main loop
do {
    Show-Menu
    $choice = Read-Host "Enter your choice (1-9)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Test-Backend
        }
        "2" {
            Write-Host ""
            Test-PasswordResetEndpoint
        }
        "3" {
            Write-Host ""
            Test-BooksEndpoint
        }
        "4" {
            Run-AllTests
        }
        "5" {
            Start-Backend
        }
        "6" {
            Start-MobileApp
        }
        "7" {
            Show-TestingGuide
        }
        "8" {
            Show-YourTasks
        }
        "9" {
            Write-Host ""
            Write-Host "👋 Goodbye! Happy testing!" -ForegroundColor Cyan
            Write-Host ""
            break
        }
        default {
            Write-Host ""
            Write-Host "❌ Invalid choice. Please enter 1-9." -ForegroundColor Red
        }
    }
    
    if ($choice -ne "9") {
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        Clear-Host
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  ACT Gen-1 Phase 1 Testing" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
    }
} while ($choice -ne "9")