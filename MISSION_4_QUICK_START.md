# Mission 4: Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- ✅ Backend running on http://localhost:8000
- ✅ Mobile app running on port 8085
- ✅ iOS Simulator or Android Emulator installed
- ✅ Expo Go app (for physical device testing)

---

## 📱 Step-by-Step Testing

### Step 1: Open the Mobile App

**Option A: iOS Simulator**
```bash
# Press 'i' in the Expo terminal
# Or scan QR code with Camera app
```

**Option B: Android Emulator**
```bash
# Press 'a' in the Expo terminal
# Or scan QR code with Expo Go app
```

**Option C: Physical Device**
```bash
# Install Expo Go from App Store/Play Store
# Scan QR code from Expo terminal
```

---

### Step 2: Login or Register

**Test Account (if exists):**
- Email: `test@example.com`
- Password: `password123`

**Or Create New Account:**
1. Tap "Register"
2. Enter email and password
3. Tap "Sign Up"

---

### Step 3: Navigate to Expenses

1. Look at bottom navigation bar
2. Tap the **Wallet icon** (middle tab)
3. You should see the ExpensesScreen

**Expected View:**
```
┌─────────────────────────────┐
│  Expenses                   │
├─────────────────────────────┤
│  Stats Header               │
│  Mandatory | Neutral | ...  │
├─────────────────────────────┤
│  [All|Mand|Neut|Excess]     │
├─────────────────────────────┤
│  (Empty or existing list)   │
│                             │
│                    [+]      │
└─────────────────────────────┘
```

---

### Step 4: Add Your First Expense

1. **Tap the FAB button** (+ icon in bottom-right)
2. **Enter amount**: Type `1500`
3. **Select category**: 
   - Scroll to "Mandatory" section (red)
   - Tap "Rent/Mortgage" (🏠 icon)
4. **Set date**: 
   - Tap "Today" button
5. **Add note** (optional): Type "Monthly rent"
6. **Tap "Save"** button

**Expected Result:**
- Modal closes
- You're back on ExpensesScreen
- New expense appears in the list
- Stats header updates with new amount

---

### Step 5: Test Filtering

1. **Tap "All"** segment - See all expenses
2. **Tap "Mandatory"** segment - See only mandatory expenses (red badges)
3. **Tap "Neutral"** segment - See only neutral expenses (orange badges)
4. **Tap "Excess"** segment - See only excess expenses (purple badges)

**Expected Result:**
- List filters immediately
- Only expenses of selected type are shown
- Stats header remains unchanged (shows all types)

---

### Step 6: Add More Expenses

**Add a Neutral Expense:**
1. Tap FAB (+)
2. Amount: `85.50`
3. Category: Groceries (🛒) from Neutral section (orange)
4. Date: Today
5. Note: "Weekly groceries"
6. Save

**Add an Excess Expense:**
1. Tap FAB (+)
2. Amount: `45.00`
3. Category: Entertainment (🎬) from Excess section (purple)
4. Date: Yesterday
5. Note: "Movie tickets"
6. Save

**Expected Result:**
- 3 expenses total
- Stats show breakdown by type
- Each expense has colored badge

---

### Step 7: Test Edit

1. **Find an expense** in the list
2. **Tap the pencil icon** (✏️)
3. **Change amount**: Update to a different value
4. **Change category**: Select a different category
5. **Tap "Update"**

**Expected Result:**
- Modal closes
- Expense updates in the list
- Stats recalculate
- Last-used category is updated

---

### Step 8: Test Delete

1. **Find an expense** in the list
2. **Tap the trash icon** (🗑️)
3. **Confirm deletion** in the alert

**Expected Result:**
- Expense removed from list
- Stats recalculate
- If last expense, empty state shows

---

### Step 9: Test Infinite Scroll

**Only if you have 10+ expenses:**
1. Scroll down to bottom of list
2. Watch for loading indicator
3. More expenses load automatically

**Expected Result:**
- Smooth loading
- No duplicates
- Pagination works correctly

---

### Step 10: Test Pull-to-Refresh

1. **Pull down** from top of list
2. **Release** when spinner appears
3. **Wait** for refresh to complete

**Expected Result:**
- Spinner shows
- Data reloads
- Stats update
- List refreshes

---

## ✅ Success Criteria

After completing all steps, verify:

- [ ] Can add expenses with all three types
- [ ] Segmented control filters work correctly
- [ ] Stats header shows accurate totals
- [ ] Edit updates expenses correctly
- [ ] Delete removes expenses correctly
- [ ] Last-used category is remembered
- [ ] Date shortcuts (Today/Yesterday) work
- [ ] Category picker groups by expense type
- [ ] Colored badges match expense types
- [ ] Infinite scroll loads more items
- [ ] Pull-to-refresh reloads data
- [ ] Navigation flows smoothly
- [ ] No crashes or errors

---

## 🐛 Common Issues & Solutions

### Issue: "Not authenticated" error
**Solution:** 
- Logout and login again
- Check if backend is running
- Verify token is saved in SecureStore

### Issue: Categories not loading
**Solution:**
- Check backend logs for errors
- Verify `/categories` endpoint is working
- Check network connection

### Issue: Stats showing $0.00
**Solution:**
- Add at least one expense
- Pull-to-refresh to reload data
- Check if expenses have valid amounts

### Issue: Segmented control not filtering
**Solution:**
- Verify expenses have expense_type set
- Check category has expense_type defined
- Pull-to-refresh to reload data

### Issue: Last-used category not working
**Solution:**
- Check AsyncStorage permissions
- Verify category ID is being saved
- Try clearing app data and re-adding

### Issue: Date shortcuts not working
**Solution:**
- Check date format is correct
- Verify timezone handling
- Try manual date selection

---

## 🎯 Quick Test Scenarios

### Scenario 1: Monthly Budget Tracking
```
1. Add Rent: $1,500 (Mandatory)
2. Add Utilities: $150 (Mandatory)
3. Add Groceries: $400 (Neutral)
4. Add Gas: $100 (Neutral)
5. Add Movies: $50 (Excess)
6. Add Dining: $200 (Excess)

Expected Stats:
- Mandatory: $1,650
- Neutral: $500
- Excess: $250
- Total: $2,400
```

### Scenario 2: Filter Testing
```
1. Add 3 mandatory expenses
2. Add 3 neutral expenses
3. Add 3 excess expenses
4. Filter by Mandatory → See 3 items
5. Filter by Neutral → See 3 items
6. Filter by Excess → See 3 items
7. Filter by All → See 9 items
```

### Scenario 3: Edit Flow
```
1. Add expense: $100, Groceries (Neutral)
2. Edit to: $150, Dining Out (Excess)
3. Verify badge changes from orange to purple
4. Verify stats update correctly
5. Verify filtering works with new type
```

### Scenario 4: Bulk Operations
```
1. Add 15 expenses (mix of types)
2. Scroll to bottom → Load more
3. Delete 5 expenses
4. Pull-to-refresh
5. Verify count is correct (10 remaining)
6. Verify stats are accurate
```

---

## 📊 Expected Data

### Default Categories (18 total)

**Mandatory (5):**
- 🏠 Rent/Mortgage
- ⚡ Utilities
- 🏥 Healthcare
- 🛡️ Insurance
- 💳 Debt Payments

**Neutral (5):**
- 🛒 Groceries
- 🚗 Transportation
- 📱 Phone/Internet
- 👕 Clothing
- 📚 Education

**Excess (8):**
- 🎬 Entertainment
- 🍽️ Dining Out
- 🛍️ Shopping
- ✈️ Travel
- 🎨 Hobbies
- 📺 Subscriptions
- 🎁 Gifts
- 📦 Other

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
# Backend terminal should show:
INFO:     POST /entries 201 Created
INFO:     GET /entries?type=expense 200 OK
INFO:     GET /entries/stats/by-expense-type 200 OK
```

### Check Mobile Logs
```bash
# Expo terminal should show:
LOG  Fetching expenses...
LOG  Loaded 10 expenses
LOG  Stats: {mandatory: 1500, neutral: 500, excess: 250}
```

### Check Network Requests
```bash
# Use React Native Debugger or Flipper
# Verify API calls are being made
# Check request/response payloads
```

### Check AsyncStorage
```bash
# In React Native Debugger console:
AsyncStorage.getItem('lastUsedExpenseCategory')
  .then(console.log)
```

---

## 📞 Support

### Backend Issues
- Check: `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api\`
- Logs: Terminal where uvicorn is running
- Health: http://localhost:8000/health

### Mobile Issues
- Check: `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\`
- Logs: Expo terminal
- Debugger: React Native Debugger or Flipper

### Documentation
- Implementation: `MISSION_4_IMPLEMENTATION_SUMMARY.md`
- Testing: `MISSION_4_TESTING_CHECKLIST.md`
- Visual Guide: `MISSION_4_VISUAL_GUIDE.md`

---

## ✅ Mission Complete!

Once all tests pass, Mission 4 is complete! 🎉

**Next Steps:**
- Review code for improvements
- Add unit tests (optional)
- Prepare for Mission 5
- Celebrate! 🎊

---

**Quick Start Version**: 1.0  
**Last Updated**: January 11, 2025  
**Estimated Time**: 15-20 minutes