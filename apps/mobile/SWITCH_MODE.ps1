# Switch between Backend API and Standalone modes

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("backend", "standalone", "status")]
    [string]$Mode = "status"
)

$indexFile = "c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\index.ts"

function Show-Status {
    Write-Host ""
    Write-Host "📱 ACT Gen-1 Mode Switcher" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Cyan
    Write-Host ""
    
    $content = Get-Content $indexFile -Raw
    
    if ($content -match "import App from './AppStandalone'") {
        Write-Host "Current Mode: " -NoNewline
        Write-Host "STANDALONE (Offline)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Features:" -ForegroundColor White
        Write-Host "  ✅ Works offline" -ForegroundColor Green
        Write-Host "  ✅ Local SQLite database" -ForegroundColor Green
        Write-Host "  ✅ No backend required" -ForegroundColor Green
        Write-Host "  ❌ No cloud sync" -ForegroundColor Red
        Write-Host "  ❌ Data only on device" -ForegroundColor Red
    } elseif ($content -match "import App from './App'") {
        Write-Host "Current Mode: " -NoNewline
        Write-Host "BACKEND API" -ForegroundColor Green
        Write-Host ""
        Write-Host "Features:" -ForegroundColor White
        Write-Host "  ✅ Cloud sync" -ForegroundColor Green
        Write-Host "  ✅ Multi-device support" -ForegroundColor Green
        Write-Host "  ✅ Centralized data" -ForegroundColor Green
        Write-Host "  ⚠️  Requires backend server" -ForegroundColor Yellow
        Write-Host "  ⚠️  Requires internet" -ForegroundColor Yellow
    } else {
        Write-Host "Current Mode: " -NoNewline
        Write-Host "UNKNOWN" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\SWITCH_MODE.ps1 backend    - Switch to Backend API mode" -ForegroundColor Gray
    Write-Host "  .\SWITCH_MODE.ps1 standalone - Switch to Standalone mode" -ForegroundColor Gray
    Write-Host "  .\SWITCH_MODE.ps1 status     - Show current mode" -ForegroundColor Gray
    Write-Host ""
}

function Switch-ToBackend {
    Write-Host ""
    Write-Host "🔄 Switching to Backend API mode..." -ForegroundColor Yellow
    
    $content = @"
import { registerRootComponent } from 'expo';

// BACKEND API VERSION - Requires backend server
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
"@
    
    Set-Content -Path $indexFile -Value $content
    
    Write-Host "✅ Switched to Backend API mode!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start backend server:" -ForegroundColor White
    Write-Host "     cd ..\api" -ForegroundColor Gray
    Write-Host "     .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
    Write-Host "     uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Restart mobile app:" -ForegroundColor White
    Write-Host "     npx expo start --clear" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Test backend health:" -ForegroundColor White
    Write-Host "     Invoke-RestMethod -Uri 'http://10.21.69.205:8000/health'" -ForegroundColor Gray
    Write-Host ""
}

function Switch-ToStandalone {
    Write-Host ""
    Write-Host "🔄 Switching to Standalone mode..." -ForegroundColor Yellow
    
    $content = @"
import { registerRootComponent } from 'expo';

// STANDALONE VERSION - Works offline without backend!
import App from './AppStandalone';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
"@
    
    Set-Content -Path $indexFile -Value $content
    
    Write-Host "✅ Switched to Standalone mode!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart mobile app:" -ForegroundColor White
    Write-Host "     npx expo start --clear" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Test the app:" -ForegroundColor White
    Write-Host "     - Register a new user" -ForegroundColor Gray
    Write-Host "     - Login with credentials" -ForegroundColor Gray
    Write-Host "     - All data stored locally" -ForegroundColor Gray
    Write-Host ""
}

# Main logic
switch ($Mode) {
    "backend" {
        Switch-ToBackend
    }
    "standalone" {
        Switch-ToStandalone
    }
    "status" {
        Show-Status
    }
}