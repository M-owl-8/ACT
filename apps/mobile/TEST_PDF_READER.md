# PDF Reader - Testing & Troubleshooting Guide

## Status Check

Before you start, run this verification:

```powershell
cd c:\work\act-gen1\apps\mobile
.\VERIFY_PDF_SETUP.ps1
```

If all checks show `[OK]`, proceed to testing.

---

## Step 1: Clear Everything and Start Fresh

```powershell
cd c:\work\act-gen1\apps\mobile

# Clear Expo cache and rebuild
npx expo prebuild --clean

# If that fails, try:
# npx expo start --clear

# OR manually clear:
Remove-Item -Path node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Path ".expo" -Recurse -Force -ErrorAction SilentlyContinue
npm install
```

---

## Step 2: Start the App

```powershell
cd c:\work\act-gen1\apps\mobile
npm start
```

**What you should see:**
```
› Expo Go app or a simulator
› Metro bundler starting
› "Expo ready" message
```

**Keep this terminal open** - you'll need to watch the logs.

---

## Step 3: Testing the PDF Reader

### Test on Your Device/Emulator:

1. **Navigate to Books tab** 
   - Tap the 📚 Books icon at the bottom
   - You should see the Books screen with:
     - A "Library" section with 3 books
     - A "Recommended" section with more books

2. **Tap on a Library book** (e.g., "The Richest Man in Babylon")
   - Should open a modal with the PDF viewer

3. **Watch the Expo console** for logs (most important!):

```
Opening book: {"id":"library_1","pdfFile":"Book_1.pdf","title":"The Richest Man in Babylon"}
```

This means the navigation worked!

4. **After 2-3 seconds, you should see:**

```
PDF loaded with pages: 384
Page changed to: 1
```

This means the PDF loaded successfully! ✅

---

## Expected Log Outputs

### ✅ Success Logs

When everything works:
```
Opening book: {"id":"library_1","pdfFile":"Book_1.pdf","title":"The Richest Man in Babylon"}
PDFReaderScreen mounted {"pdfFile":"Book_1.pdf","bookTitle":"The Richest Man in Babylon","pdfSourceExists":true}
PDF loaded with pages: 384
Page changed to: 1
```

### ❌ Failure Logs

**If you see this:**
```
Opening book: {"id":"library_1","pdfFile":"Book_1.pdf","title":"..."}
```
But nothing else after that = **Problem: Navigation works but PDF screen crashes**

**If you see:**
```
PDF Error Code: 1
```
Error opening PDF = **Problem: PDF rendering failed**

**If you see:**
```
PDF loading timeout - took longer than 10 seconds
```
= **Problem: PDF taking too long to load**

**If you don't see "Opening book" at all:**
= **Problem: Book button not responding**

---

## Troubleshooting by Symptom

### Symptom: App loads forever (spinning wheel)

**Check:**
1. Look for "PDF Error Code" in console
   - If yes: PDF file is corrupted, try copying from backend again
   - If no: Continue to next step

2. Look for "PDF loading timeout" in console
   - If yes: Device is too slow or PDF too large
   - Solution: Try on a different device/emulator

3. No console logs at all?
   - Expo terminal crashed - restart with `npm start`
   - Clear cache with `npx expo start --clear`

### Symptom: "No PDF file specified" error shown

**Cause:** Navigation params aren't being passed

**Fix:**
1. Check that BooksScreen.tsx has correct navigation code:
   ```typescript
   navigation.navigate('PDFReader', { 
     pdfFile: book.pdfFile, 
     bookTitle: t(book.titleKey) 
   })
   ```

2. Verify book.pdfFile is 'Book_1.pdf', 'Book_2.pdf', or 'Book_3.pdf'
   - Check `src/constants/booksData.ts`

### Symptom: "PDF file not found" error shown

**Cause:** File doesn't exist in pdfMap

**Fix:**
1. Check `PDFReaderScreen.tsx` line 26-29 has all three books:
   ```typescript
   const pdfMap = {
     'Book_1.pdf': require('../../assets/books/Book_1.pdf'),
     'Book_2.pdf': require('../../assets/books/Book_2.pdf'),
     'Book_3.pdf': require('../../assets/books/Book_3.pdf'),
   };
   ```

2. Verify PDF files exist:
   ```powershell
   Get-ChildItem "c:\work\act-gen1\apps\mobile\assets\books\*.pdf"
   ```

3. If missing, copy from backend:
   ```powershell
   $src = "c:\work\act-gen1\apps\api\uploads\books\en"
   $dst = "c:\work\act-gen1\apps\mobile\assets\books"
   Copy-Item "$src\*.pdf" $dst -Force
   ```

### Symptom: Book click doesn't do anything (no error, no navigation)

**Cause:** Button might not be triggering

**Fix:**
1. Check BooksScreen book cards render correctly
   - See if 3 books display in Library section

2. Try tapping different books
   - All should work or none work

3. Check for JavaScript errors in Expo console
   - Scroll up in terminal for red error messages

4. Try reloading with `r` in Expo terminal

### Symptom: PDF shows but won't let me scroll/swipe pages

**Cause:** PDFView component issue

**Fix:**
1. Try zooming in/out with pinch gesture
2. Try tilting device to landscape
3. This might be a device-specific issue - try another device
4. Check react-native-pdf version is 6.7.3

---

## Advanced Testing

### Test Each Book Individually

```
1. Tap: The Richest Man in Babylon (Book_1.pdf)
   - Should load without errors
   
2. Tap: Atomic Habits (Book_2.pdf)
   - Should load without errors
   
3. Tap: Rich Dad Poor Dad (Book_3.pdf)
   - Should load without errors
```

### Test Multiple Languages

1. Go to Settings
2. Change language to Russian or Uzbek
3. Go back to Books
4. Tap a book - should show Russian/Uzbek title

### Test Going Back

1. Open a book (PDF should load)
2. Tap back arrow
3. Should return to Books screen
4. Tap another book - should open new PDF

### Test Error Recovery

1. Open a book successfully
2. Go back to Books
3. Force close app (don't use Expo's `r` reload)
4. Reopen app
5. Go to Books
6. Tap same book - should work again

---

## Performance Metrics

### Expected Loading Times

- **Book_1.pdf** (1.5 MB): ~2-3 seconds
- **Book_2.pdf** (5 MB): ~3-5 seconds
- **Book_3.pdf** (10 MB): ~5-8 seconds

If taking longer than 10 seconds = issue (timeout will trigger)

### Expected File Sizes

```
Book_1.pdf: 1.5 MB
Book_2.pdf: 4.87 MB
Book_3.pdf: 10.44 MB
Total: 16.81 MB
```

If sizes are 0 bytes = files didn't copy correctly

---

## Final Verification Checklist

After testing, verify:

- [ ] BooksScreen opens without errors
- [ ] Can see 3 library books
- [ ] Can see 18 recommended books
- [ ] Clicking a library book opens PDF modal
- [ ] PDF loads within 10 seconds
- [ ] Can see page indicator (Page X of Y)
- [ ] Can swipe/scroll through pages
- [ ] Back button closes modal
- [ ] Language switching works
- [ ] No red errors in Expo console

---

## If Still Not Working

### Collect Logs

1. Open Expo in terminal running the app
2. Look for all console.log messages
3. Copy everything from "Opening book" onwards
4. Include in a bug report

### Platform-Specific Steps

**For Android Emulator:**
```powershell
# Restart emulator
npx expo run:android --clear

# Or rebuild from scratch
Remove-Item -Path node_modules -Recurse -Force
npm install
npx expo run:android
```

**For iOS Simulator:**
```bash
npx expo run:ios --clear
```

**For Web:**
```bash
npm run web
# Note: PDF reader might not work on web - this is expected
```

---

## Success Indicators

You'll know it's working when:

1. ✅ Tap book → modal appears with PDF
2. ✅ PDF loads (page indicator shows)
3. ✅ Can swipe between pages
4. ✅ Back button closes modal
5. ✅ No red errors in console
6. ✅ Works in all supported languages

---

**Ready to test? Start with Step 1 above! 🚀**