# Quick JAVA_HOME Fix - No interaction required
# Run this if you get JAVA_HOME errors

$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"

Write-Host "Applying JAVA_HOME fix..." -ForegroundColor Cyan

# Set for current session
$env:JAVA_HOME = $javaPath
Write-Host "✓ Current session updated" -ForegroundColor Green

# Set for user (permanent)
try {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath, "User")
    Write-Host "✓ User environment variable updated" -ForegroundColor Green
} catch {
    Write-Host "! Could not update user environment (may need admin)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Fix applied! Close and reopen terminal, then run:" -ForegroundColor Green
Write-Host "  npm run android" -ForegroundColor White
Write-Host ""