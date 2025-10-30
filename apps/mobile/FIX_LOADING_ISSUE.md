# QUICK FIX: PDF Reader Loading Forever

## The Problem
App shows loading spinner when opening a book and never displays the PDF.

---

## ⚡ Quick Fixes (Try in Order)

### Fix #1: Clear Cache and Rebuild (MOST COMMON)
```powershell
cd c:\work\act-gen1\apps\mobile

# Clear everything
npx expo prebuild --clean

# If that doesn't work, do this:
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json
npm install
npx expo start --clear
```

**Result:** App fully reloads, PDFs should load now.

---

### Fix #2: Restart Expo Development Server
```powershell
# In the Expo terminal, press:
# c - to clear cache
# q - to quit

# Then restart:
npm start
```

**Result:** Forces a rebuild and reload.

---

### Fix #3: Check PDF Files Exist
```powershell
Get-ChildItem "c:\work\act-gen1\apps\mobile\assets\books\*.pdf" | Select-Object Name, Length
```

**You should see:**
- Book_1.pdf (~1.5 MB)
- Book_2.pdf (~5 MB)
- Book_3.pdf (~10 MB)

**If files are missing or 0 bytes:**
```powershell
# Copy from backend
$src = "c:\work\act-gen1\apps\api\uploads\books\en"
$dst = "c:\work\act-gen1\apps\mobile\assets\books"
Copy-Item "$src\*.pdf" $dst -Force
```

**Result:** PDFs now available to load.

---

### Fix #4: Check Console Logs for Errors

**In Expo terminal, look for:**

✅ **GOOD** - You see this:
```
Opening book: {"id":"library_1","pdfFile":"Book_1.pdf",...}
PDF loaded with pages: 384
```

❌ **BAD** - You see this:
```
PDF Error Code: 1
```
→ Corrupted PDF, recopy from backend (Fix #3)

❌ **BAD** - You see this:
```
PDF file not found: Book_1.pdf
```
→ File mapping issue, try Fix #1

❌ **BAD** - Nothing after "Opening book":
→ PDFView component crash, try Fix #1

---

### Fix #5: Verify Setup Completeness
```powershell
cd c:\work\act-gen1\apps\mobile
.\VERIFY_PDF_SETUP.ps1
```

All should show `[OK]`. If not, follow the script recommendations.

---

## 🧪 Quick Test

After trying a fix:

1. Restart app with `r` in Expo terminal
2. Go to Books tab
3. Tap on "The Richest Man in Babylon"
4. **Within 3 seconds**, should show PDF with "Page 1 of 384"

✅ Works → You're done!
❌ Still loading → Try next fix

---

## When to Use Each Fix

| Symptom | Try First |
|---------|-----------|
| Just updated code | Fix #1 |
| Tried multiple books | Fix #2 |
| Files not there | Fix #3 |
| Error message shown | Check logs first |
| No error, just loading | Fix #1 or #2 |

---

## Nuclear Option (When Nothing Works)

```powershell
cd c:\work\act-gen1\apps\mobile

# Completely reset
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json -Force
Remove-Item -Path ".expo" -Recurse -Force
Remove-Item -Path "dist" -Recurse -Force
Remove-Item -Path ".expo-shared" -Recurse -Force

# Reinstall
npm install

# Start clean
npx expo prebuild --clean
npm start
```

---

## Verify PDFs Copied Correctly

```powershell
# Check file sizes (should match):
$files = Get-ChildItem "c:\work\act-gen1\apps\mobile\assets\books\*.pdf"
$total = ($files | Measure-Object -Property Length -Sum).Sum
$totalMB = [math]::Round($total / 1MB, 2)

Write-Host "Total PDF size: $totalMB MB"
$files | ForEach-Object { 
  $mb = [math]::Round($_.Length / 1MB, 2)
  Write-Host "  $($_.Name): $mb MB"
}
```

Expected output:
```
Total PDF size: 16.81 MB
  Book_1.pdf: 1.5 MB
  Book_2.pdf: 4.87 MB
  Book_3.pdf: 10.44 MB
```

---

## Still Not Working?

### Step 1: Check if it's device-specific
- Try on Android emulator
- Try on iOS simulator (if Mac)
- Try web version: `npm run web`

### Step 2: Check for React Navigation issues
- Other modals work? (Check AddExpense, Settings)
- If yes, issue is specific to PDFReader
- If no, issue is with navigation setup

### Step 3: Check for PDFView library issues
- Run: `npm list react-native-pdf`
- Should show: `react-native-pdf@6.7.3`
- If missing or different version, reinstall:
  ```powershell
  npm install react-native-pdf@6.7.3
  ```

---

## Success Criteria

Once working, you should see:

✅ Book opens in modal (not full screen)
✅ PDF displays within 3-10 seconds
✅ "Page X of Y" footer visible
✅ Can swipe left/right to change pages
✅ Back button closes modal
✅ No red errors in console

---

**Try Fix #1 first. If that doesn't work, come back to these steps. 🚀**