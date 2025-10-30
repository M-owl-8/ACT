# ============================================
# ACT Gen-1 - BUILD AND DEPLOY HELPER SCRIPT
# ============================================

Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ACT Gen-1 - BUILD & DEPLOY HELPER               ║" -ForegroundColor Cyan
Write-Host "║   Complete Roadmap to 100% Ready                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Color functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error-Custom { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

# ============================================
# MENU
# ============================================

function Show-Menu {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║              WHAT DO YOU WANT TO DO?              ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "📱 DEVELOPMENT:"
    Write-Host "  1) Start Backend Server (Local)"
    Write-Host "  2) Start Mobile App (Local)"
    Write-Host "  3) Start Both Backend & Mobile"
    Write-Host ""
    Write-Host "🔨 BUILD & TEST:"
    Write-Host "  4) Build Release APK"
    Write-Host "  5) Test API Endpoints"
    Write-Host "  6) Run QA Tests"
    Write-Host ""
    Write-Host "🚀 PRODUCTION:"
    Write-Host "  7) Setup Production Database"
    Write-Host "  8) Deploy Backend to Railway"
    Write-Host "  9) Update App URL to Production"
    Write-Host ""
    Write-Host "📊 STORE SUBMISSION:"
    Write-Host "  10) Create Screenshots Template"
    Write-Host "  11) Create Store Descriptions"
    Write-Host "  12) Create Google Play Listing"
    Write-Host ""
    Write-Host "📋 DOCUMENTATION:"
    Write-Host "  13) Show Full Roadmap"
    Write-Host "  14) Show Week 1 Checklist"
    Write-Host "  15) Show Progress Tracker"
    Write-Host ""
    Write-Host "  0) Exit"
    Write-Host ""
}

function Start-Backend {
    Write-Info "🚀 Starting Backend Server..."
    Write-Host ""
    
    $apiPath = "$PSScriptRoot\apps\api"
    Set-Location $apiPath
    
    if (-not (Test-Path ".\venv\Scripts\activate.bat")) {
        Write-Warning "⚠️  Virtual environment not found. Creating..."
        python -m venv venv
        Write-Success "✅ Virtual environment created"
    }
    
    Write-Info "📦 Activating virtual environment..."
    & .\venv\Scripts\activate.bat
    
    Write-Info "📦 Installing dependencies..."
    pip install -q -r requirements.txt
    Write-Success "✅ Dependencies installed"
    
    Write-Host ""
    Write-Host "🚀 Starting FastAPI Server..." -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📍 API URL: http://localhost:8000" -ForegroundColor Yellow
    Write-Host "📚 Docs:    http://localhost:8000/docs" -ForegroundColor Yellow
    Write-Host "❤️  Health:  http://localhost:8000/health" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
}

function Start-Mobile {
    Write-Info "🚀 Starting Mobile App..."
    Write-Host ""
    
    $mobilePath = "$PSScriptRoot\apps\mobile"
    Set-Location $mobilePath
    
    Write-Info "📦 Checking dependencies..."
    if (-not (Test-Path "node_modules")) {
        Write-Warning "⚠️  Dependencies not found. Installing..."
        npm install
    }
    
    Write-Host ""
    Write-Host "🚀 Starting Expo Server..." -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📱 Metro Bundler: http://localhost:8081" -ForegroundColor Yellow
    Write-Host "📲 Scan QR code with Expo Go app" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    npm start
}

function Test-API-Endpoints {
    Write-Info "🧪 Testing API Endpoints..."
    Write-Host ""
    
    $endpoints = @(
        @{ Name = "Health Check"; Method = "GET"; URL = "http://localhost:8000/health" },
        @{ Name = "API Docs"; Method = "GET"; URL = "http://localhost:8000/docs" },
        @{ Name = "Register User"; Method = "POST"; URL = "http://localhost:8000/api/v1/auth/register" }
    )
    
    Write-Info "Testing endpoints..."
    Write-Host ""
    
    foreach ($endpoint in $endpoints) {
        Write-Host "Testing: $($endpoint.Name)" -ForegroundColor Yellow
        
        try {
            if ($endpoint.Method -eq "GET") {
                $response = Invoke-WebRequest -Uri $endpoint.URL -Method GET -ErrorAction Stop
                Write-Success "✅ $($endpoint.Name) - Status: $($response.StatusCode)"
            }
            else {
                Write-Warning "⚠️  Manual test required for $($endpoint.Name)"
            }
        }
        catch {
            Write-Error-Custom "❌ $($endpoint.Name) failed"
            Write-Error-Custom "  Error: $($_.Exception.Message)"
        }
        
        Write-Host ""
    }
    
    Write-Host "📚 Visit http://localhost:8000/docs for interactive API testing" -ForegroundColor Cyan
    Write-Host ""
}

function Build-Release-APK {
    Write-Info "📦 Building Release APK..."
    Write-Host ""
    
    $mobilePath = "$PSScriptRoot\apps\mobile"
    Set-Location $mobilePath
    
    Write-Warning "⚠️  This requires EAS CLI to be installed"
    Write-Warning "⚠️  Make sure you have an Expo account"
    Write-Host ""
    
    Write-Info "Building APK (this will take 10-15 minutes)..."
    Write-Host ""
    
    eas build --platform android --build-type apk
    
    Write-Host ""
    Write-Success "✅ APK build submitted!"
    Write-Info "📥 Download from: https://dashboard.eas.dev"
    Write-Host ""
}

function Create-Screenshots-Template {
    Write-Info "📸 Creating Screenshots Template..."
    Write-Host ""
    
    $screenshotsDir = "$PSScriptRoot\store-assets\screenshots"
    
    if (-not (Test-Path $screenshotsDir)) {
        New-Item -ItemType Directory -Path $screenshotsDir -Force | Out-Null
        Write-Success "✅ Created screenshots directory: $screenshotsDir"
    }
    
    $template = @"
# Screenshots Template

## How to Create Screenshots:

### Step 1: Run the app in emulator or real device
### Step 2: Navigate to each screen:
  1. Login screen
  2. Dashboard
  3. Add transaction form
  4. Transactions list
  5. Reports/Analytics
  6. Settings
  7. Dark theme version

### Step 3: Take screenshots at 1080x1920 resolution

### Step 4: Save as:
  - screenshot_1.png
  - screenshot_2.png
  - ... etc

### Tools to enhance:
- Figma
- Photoshop
- GIMP
- Online tools like Canva

### Upload to Google Play Console
- Maximum 8 screenshots
- Minimum 2 screenshots required
- Should showcase key features
"@
    
    Set-Content -Path "$screenshotsDir\README.md" -Value $template
    Write-Success "✅ Created template in: $screenshotsDir"
    
    Write-Host ""
    Write-Info "📸 Next steps:"
    Write-Host "  1. Run the app in Android emulator"
    Write-Host "  2. Take screenshots of each screen"
    Write-Host "  3. Save to: $screenshotsDir"
    Write-Host ""
}

function Show-Roadmap {
    Write-Info "📋 OPENING COMPLETE ROADMAP..."
    Write-Host ""
    
    $roadmapFile = "$PSScriptRoot\STEP_BY_STEP_TO_100_PERCENT.md"
    
    if (Test-Path $roadmapFile) {
        Write-Success "✅ Opening: $roadmapFile"
        Start-Process "notepad.exe" -ArgumentList $roadmapFile
    }
    else {
        Write-Error-Custom "❌ File not found: $roadmapFile"
    }
    
    Write-Host ""
}

function Show-Week1-Checklist {
    Write-Info "📋 WEEK 1 ACTION ITEMS..."
    Write-Host ""
    
    $checklistFile = "$PSScriptRoot\IMMEDIATE_ACTION_ITEMS.md"
    
    if (Test-Path $checklistFile) {
        Write-Success "✅ Opening: $checklistFile"
        Start-Process "notepad.exe" -ArgumentList $checklistFile
    }
    else {
        Write-Error-Custom "❌ File not found: $checklistFile"
    }
    
    Write-Host ""
}

function Show-Progress-Tracker {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║          📊 PROGRESS TO 100% READY                ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    $stages = @(
        @{ Week = "Week 1"; Task = "Testing & QA"; Progress = "62% → 70%"; Status = "⏳ TODO" },
        @{ Week = "Week 2"; Task = "Build & Assets"; Progress = "70% → 80%"; Status = "⏳ TODO" },
        @{ Week = "Week 3"; Task = "Production Deploy"; Progress = "80% → 85%"; Status = "⏳ TODO" },
        @{ Week = "Week 4"; Task = "Store Setup"; Progress = "85% → 90%"; Status = "⏳ TODO" },
        @{ Week = "Week 5"; Task = "Compliance"; Progress = "90% → 93%"; Status = "⏳ TODO" },
        @{ Week = "Week 6+"; Task = "Launch"; Progress = "93% → 100%"; Status = "⏳ TODO" }
    )
    
    foreach ($stage in $stages) {
        Write-Host "$($stage.Week): $($stage.Task)" -ForegroundColor Cyan
        Write-Host "  Progress: $($stage.Progress)"
        Write-Host "  Status:   $($stage.Status)"
        Write-Host ""
    }
    
    Write-Info "✨ You're starting at 62% (MVP complete + backend ready)"
    Write-Info "🎯 Goal: Reach 100% (ready to publish on Play Store)"
    Write-Info "⏱️  Timeline: 6-8 weeks"
    Write-Host ""
}

function Create-Store-Descriptions {
    Write-Info "📝 Creating Store Descriptions..."
    Write-Host ""
    
    $descriptions = @"
# Store Descriptions

## SHORT DESCRIPTION (80 characters):
Track income & expenses with beautiful Japanese-inspired design

## LONG DESCRIPTION (4000 characters):

ACT - Your Personal Finance Manager

✨ FEATURES:
• Track income and expenses in real-time
• Automatic categorization
• Beautiful, intuitive interface
• Dark and light themes
• Multi-language support (English, Russian, Uzbek)
• Detailed financial reports
• Monthly expense breakdown
• Data export to CSV/JSON
• Secure authentication
• Push notifications
• Offline mode support

💰 MANAGE YOUR MONEY:
- Set spending goals
- Track spending streaks
- Monitor budget progress
- View expense trends

🌍 MULTILINGUAL:
- English
- Russian
- Uzbek

🎨 BEAUTIFUL DESIGN:
- Japanese-inspired minimal interface
- Smooth animations
- Responsive layout
- Dark and light themes

🔒 SECURE:
- Encrypted storage
- No ads, no tracking
- Your data is yours

FREE • NO ADS • NO IN-APP PURCHASES

Start tracking your finances today!

## RELEASE NOTES (v1.0.0):
Initial release with full feature set
"@
    
    $descFile = "$PSScriptRoot\store-assets\descriptions.txt"
    
    if (-not (Test-Path "$PSScriptRoot\store-assets")) {
        New-Item -ItemType Directory -Path "$PSScriptRoot\store-assets" -Force | Out-Null
    }
    
    Set-Content -Path $descFile -Value $descriptions
    Write-Success "✅ Created: $descFile"
    Start-Process "notepad.exe" -ArgumentList $descFile
    
    Write-Host ""
}

# ============================================
# MAIN LOOP
# ============================================

do {
    Show-Menu
    $choice = Read-Host "Enter your choice (0-15)"
    Write-Host ""
    
    switch ($choice) {
        "1" { Start-Backend }
        "2" { Start-Mobile }
        "3" {
            Write-Info "This will start two servers. You need two terminal windows."
            Write-Host ""
            Write-Info "Option 1: Start in background"
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($PSScriptRoot)'; .\BUILD_AND_DEPLOY_STEPS.ps1"
            
            Write-Info "Option 2: Or run manually in another terminal:"
            Write-Host "  Terminal 1: cd c:\work\act-gen1\apps\api && python -m uvicorn main:app --reload"
            Write-Host "  Terminal 2: cd c:\work\act-gen1\apps\mobile && npm start"
            Write-Host ""
        }
        "4" { Build-Release-APK }
        "5" { Test-API-Endpoints }
        "6" {
            Write-Warning "🧪 Running comprehensive QA tests..."
            Write-Host ""
            Write-Info "Open:"
            Write-Host "  1. Android emulator or connect device"
            Write-Host "  2. Run the app"
            Write-Host "  3. Test features following: c:\work\act-gen1\QA_TESTING_CHECKLIST.md"
            Write-Host ""
        }
        "7" {
            Write-Info "🚀 Setting up production database..."
            Write-Host ""
            Write-Host "Follow these steps:"
            Write-Host "  1. Go to https://railway.app"
            Write-Host "  2. Create account"
            Write-Host "  3. Create new PostgreSQL database"
            Write-Host "  4. Copy connection string"
            Write-Host "  5. Add to .env file"
            Write-Host ""
        }
        "8" {
            Write-Info "🚀 Deploying backend to Railway..."
            Write-Host ""
            Write-Host "Steps:"
            Write-Host "  1. Create Procfile in apps/api/"
            Write-Host "  2. Commit to GitHub"
            Write-Host "  3. Go to railway.app"
            Write-Host "  4. Connect GitHub repo"
            Write-Host "  5. Deploy"
            Write-Host ""
        }
        "9" {
            Write-Info "📱 Updating app URL to production..."
            Write-Host ""
            Write-Host "Edit: apps/mobile/src/api/config.ts"
            Write-Host "Change: API_BASE_URL to your production URL"
            Write-Host ""
            Start-Process "code.exe" -ArgumentList "c:\work\act-gen1\apps\mobile\src\api\config.ts"
        }
        "10" { Create-Screenshots-Template }
        "11" { Create-Store-Descriptions }
        "12" {
            Write-Warning "🏪 Creating Google Play Listing..."
            Write-Host ""
            Write-Host "Steps:"
            Write-Host "  1. Go to https://play.google.com/console"
            Write-Host "  2. Create new app"
            Write-Host "  3. Fill in all required fields"
            Write-Host "  4. Upload screenshots & graphics"
            Write-Host "  5. Write descriptions"
            Write-Host "  6. Submit"
            Write-Host ""
        }
        "13" { Show-Roadmap }
        "14" { Show-Week1-Checklist }
        "15" { Show-Progress-Tracker }
        "0" {
            Write-Success "✅ Goodbye! Good luck with your launch! 🚀"
            exit
        }
        default {
            Write-Error-Custom "❌ Invalid choice. Please try again."
        }
    }
    
    if ($choice -ne "0") {
        Write-Host ""
        Read-Host "Press Enter to continue"
    }
    
    Clear-Host
}
while ($true)