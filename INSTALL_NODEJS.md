# 🟢 Node.js Installation Guide

## 🚨 Critical Issue Detected

**Node.js is not installed on your system!** This is required for React Native development.

---

## ✅ Quick Installation (Recommended)

### Option 1: Using Chocolatey (Fastest - 5 minutes)

You already have Chocolatey installed, so this is the easiest method:

```powershell
# Run PowerShell as Administrator
choco install nodejs-lts -y

# After installation, close and reopen PowerShell
node --version
npm --version
```

**Expected Output:**
```
v20.x.x  (or v18.x.x)
10.x.x   (or 9.x.x)
```

---

### Option 2: Manual Download (10 minutes)

1. **Download Node.js LTS:**
   - Go to: https://nodejs.org/
   - Click "Download LTS" (Long Term Support)
   - Choose Windows Installer (.msi) - 64-bit

2. **Install:**
   - Run the downloaded .msi file
   - Click "Next" through all prompts
   - ✅ **IMPORTANT:** Check "Automatically install necessary tools"
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   - Close ALL PowerShell windows
   - Open NEW PowerShell window
   - Run:
   ```powershell
   node --version
   npm --version
   ```

---

## 🔧 After Installation

### Step 1: Verify Installation

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PATH
$env:PATH -split ';' | Select-String "nodejs"
```

**Expected:** You should see Node.js version and npm version displayed.

---

### Step 2: Install Global Packages

```powershell
# Install React Native CLI globally
npm install -g react-native-cli

# Verify installation
react-native --version
```

---

### Step 3: Install Project Dependencies

```powershell
# Navigate to mobile app
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile

# Install dependencies
npm install

# This will take 5-10 minutes
```

---

### Step 4: Test Build

```powershell
# Make sure Android emulator is running
# Then run:
npm run android
```

---

## 🆘 Troubleshooting

### Issue: "node is not recognized" after installation

**Solution:**
```powershell
# Close ALL PowerShell windows
# Open NEW PowerShell window
# Try again
node --version
```

If still not working:
```powershell
# Check if Node.js is installed
Test-Path "C:\Program Files\nodejs\node.exe"

# If True, add to PATH manually:
$env:PATH += ";C:\Program Files\nodejs"

# Test again
node --version
```

---

### Issue: npm install fails with permission errors

**Solution:**
```powershell
# Run PowerShell as Administrator
# Then run npm install again
```

---

### Issue: npm install is very slow

**Solution:**
```powershell
# Use faster registry (optional)
npm config set registry https://registry.npmjs.org/

# Clear cache
npm cache clean --force

# Try again
npm install
```

---

## 📋 Recommended Node.js Version

For React Native development:
- **Node.js 18.x LTS** (Recommended)
- **Node.js 20.x LTS** (Also works)
- **Minimum:** Node.js 16.x

**Check your version after installation:**
```powershell
node --version
```

---

## 🎯 Next Steps After Installation

1. ✅ Install Node.js (this guide)
2. ✅ Install project dependencies (`npm install`)
3. ✅ Test build (`npm run android`)
4. ✅ Continue with `START_HERE_NOW.md`

---

## 💡 Why Node.js is Required

Node.js is essential for:
- **npm:** Package manager for JavaScript
- **Metro Bundler:** React Native's JavaScript bundler
- **React Native CLI:** Command-line tools
- **Build Tools:** Various build and development tools

Without Node.js, you cannot:
- Install dependencies
- Run the development server
- Build the app
- Use any npm commands

---

## ✅ Verification Checklist

After installation, verify everything works:

```powershell
# 1. Check Node.js
node --version
# Expected: v18.x.x or v20.x.x

# 2. Check npm
npm --version
# Expected: 9.x.x or 10.x.x

# 3. Check PATH
$env:PATH -split ';' | Select-String "nodejs"
# Expected: C:\Program Files\nodejs (or similar)

# 4. Install dependencies
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npm install
# Expected: No errors, dependencies installed

# 5. Test build
npm run android
# Expected: App builds and launches
```

---

## 🚀 Quick Start Script

Save this as `INSTALL_NODEJS.ps1` and run it:

```powershell
# Check if Node.js is installed
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue

if ($nodeInstalled) {
    Write-Host "✅ Node.js is already installed!" -ForegroundColor Green
    Write-Host "Version: $(node --version)" -ForegroundColor Cyan
    Write-Host "npm Version: $(npm --version)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Node.js is NOT installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing Node.js using Chocolatey..." -ForegroundColor Yellow
    
    # Install Node.js LTS
    choco install nodejs-lts -y
    
    Write-Host ""
    Write-Host "✅ Installation complete!" -ForegroundColor Green
    Write-Host "⚠️  Please close this terminal and open a NEW one!" -ForegroundColor Yellow
    Write-Host "Then run: node --version" -ForegroundColor Cyan
}
```

---

## 📞 Need Help?

### Common Issues:
1. **"node is not recognized"** → Close terminal, open new one
2. **"npm install fails"** → Run as Administrator
3. **"Installation is slow"** → Be patient, it can take 10-15 minutes

### Check Installation:
```powershell
# Run this diagnostic
Write-Host "Node.js: $(if (Get-Command node -ErrorAction SilentlyContinue) { node --version } else { 'NOT INSTALLED' })"
Write-Host "npm: $(if (Get-Command npm -ErrorAction SilentlyContinue) { npm --version } else { 'NOT INSTALLED' })"
Write-Host "PATH: $($env:PATH -split ';' | Select-String 'nodejs')"
```

---

## 🎊 You're Almost There!

Once Node.js is installed:
1. Close this terminal
2. Open NEW terminal
3. Run: `npm install` in the mobile app directory
4. Continue with `START_HERE_NOW.md`

**Good luck! 🚀**