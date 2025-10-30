# PDF Reader Troubleshooting Guide

## Issue: PDF Reader Shows Loading Forever

### Symptoms
- Click on a book in the Books tab
- App shows loading spinner but never displays the PDF
- No error message appears

---

## Quick Fixes (Try in Order)

### 1️⃣ **Clear Cache and Reinstall**

```powershell
# Navigate to mobile app
cd c:\work\act-gen1\apps\mobile

# Clear Node modules and reinstall
Remove-Item -Path node_modules -Recurse -Force
Remove-Item -Path package-lock.json
npm install

# Clear Expo cache
npx expo prebuild --clean
npx expo start --clear
```

### 2️⃣ **Verify PDF Files Exist**

Check that all three PDF files are in the correct location:
```
c:\work\act-gen1\apps\mobile\assets\books\
├── Book_1.pdf
├── Book_2.pdf
└── Book_3.pdf
```

If files are missing, copy them from the backend:
```powershell
# From API uploads directory
$srcDir = "c:\work\act-gen1\apps\api\uploads\books\en"
$destDir = "c:\work\act-gen1\apps\mobile\assets\books"

# Create destination if it doesn't exist
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
}

# Copy files
Copy-Item -Path "$srcDir\*" -Destination $destDir -Force
```

### 3️⃣ **Check Console Logs**

When the app is running, check the Expo console output for errors:

1. Open your Expo terminal where the app is running
2. Look for:
   - ✅ `"Opening book:"` message (navigation triggered)
   - ✅ `"PDF loaded with pages:"` message (PDF loaded successfully)
   - ❌ `"PDF Error Code:"` message (PDF rendering failed)
   - ❌ `"PDF file not found:"` message (file mapping issue)

**Example Success Log:**
```
Opening book: {"id":"library_1","pdfFile":"Book_1.pdf","title":"The Richest Man in Babylon"}
PDF loaded with pages: 384
Page changed to: 1
```

### 4️⃣ **Force App Restart**

Sometimes the development server needs a full restart:

```powershell
# In the Expo terminal, press:
# r - to reload the app
# c - to clear the cache
# q - to quit
```

Then start fresh:
```powershell
cd c:\work\act-gen1\apps\mobile
npx expo start
```

### 5️⃣ **Check Navigation Path**

Verify the navigation is working:

1. In `BooksScreen.tsx`, you should see console log when clicking book:
   - Check in Expo console for: `"Opening book:"`

2. If no log appears:
   - The button press isn't being triggered
   - Check if book cards are rendering correctly

3. If log appears but PDF doesn't load:
   - The navigation worked but PDFReader has an issue
   - Check Expo console for `"PDF Error Code:"` or `"PDF file not found:"`

---

## Common Errors & Solutions

### Error: "PDF file not found"
**Cause:** The filename doesn't match what's in the pdfMap

**Fix:**
1. Check `PDFReaderScreen.tsx` line 26-29:
   ```typescript
   const pdfMap: { [key: string]: any } = {
     'Book_1.pdf': require('../../assets/books/Book_1.pdf'),
     'Book_2.pdf': require('../../assets/books/Book_2.pdf'),
     'Book_3.pdf': require('../../assets/books/Book_3.pdf'),
   };
   ```

2. Check `booksData.ts` line 9, 17, 25:
   ```typescript
   pdfFile: 'Book_1.pdf',  // Must match pdfMap key exactly
   ```

### Error: "Failed to load PDF (Error: X)"
**Cause:** React-native-pdf couldn't render the file

**Solutions:**
1. The PDF file might be corrupted
2. Try re-copying the PDFs from the backend

3. Or regenerate sample PDFs (if you have a PDF library available)

### App keeps loading with no error
**Cause:** PDFView component is stuck

**Fix:**
1. Add timeout handling (we'll add this)
2. For now, force reload the app with `r` in Expo console

---

## Advanced Debugging

### Enable Detailed Logging

Edit `PDFReaderScreen.tsx` and add logging:

```typescript
useEffect(() => {
  console.log('PDFReaderScreen mounted');
  console.log('Params:', params);
  console.log('PDF File:', pdfFile);
  console.log('PDF Source:', pdfSource);
  console.log('Error:', error);
}, [params, pdfFile, pdfSource, error]);
```

### Manual PDF File Check

Add this to test PDF availability:

```typescript
// In PDFReaderScreen, add to component
const checkPDFAvailability = async () => {
  for (const [name, pdf] of Object.entries(pdfMap)) {
    console.log(`PDF ${name}:`, pdf);
  }
};

useEffect(() => {
  checkPDFAvailability();
}, []);
```

---

## Platform-Specific Issues

### Android
- React-native-pdf has good support
- PDFs should work once dependencies are installed
- Try: `npm run android` for a clean build

### iOS
- Ensure CocoaPods dependencies are installed
- Try: `npm run ios` for a clean build

### Web (Expo Web)
- React-native-pdf has limited web support
- Books feature may not work on web
- This is expected; focus on Android/iOS

---

## Verification Checklist

✅ **Before reporting an issue, verify:**

- [ ] PDF files exist in `assets/books/` folder (3 files)
- [ ] `react-native-pdf` is installed in package.json (v6.7.3)
- [ ] `expo-file-system` is installed (for FileSystem utilities)
- [ ] Ran `npm install` recently
- [ ] Ran Expo prebuild (if building for Android/iOS)
- [ ] Cleared cache with `npx expo start --clear`
- [ ] Restarted Expo development server
- [ ] Checked console logs in Expo terminal
- [ ] Tried on a different platform (Android, iOS, Web)
- [ ] Reloaded app with `r` in Expo console

---

## Still Not Working?

If you've tried all the above:

1. **Check the App.tsx and routing setup** - Verify PDFReader screen is properly registered

2. **Check React Navigation version** - Ensure it's compatible with modal presentation

3. **Check Device/Emulator** - Try:
   - Different device/emulator
   - Clear app cache
   - Reinstall the app

4. **Check PDF file integrity** - Verify PDFs aren't corrupted:
   ```powershell
   Get-Item "c:\work\act-gen1\apps\mobile\assets\books\*.pdf" | Select-Object Name, Length
   ```

All three files should show file sizes:
- Book_1.pdf: ~1.5 MB
- Book_2.pdf: ~5 MB  
- Book_3.pdf: ~10 MB

If any file is 0 bytes or very small, the copy failed and needs to be redone.

---

## Next Steps

Once PDFs load successfully:

1. Test reading a book (swipe pages)
2. Test going back with back button
3. Test switching between different books
4. Test after changing language in Settings
5. Test on your target platform (Android, iOS, or Web)

Good luck! 🚀