# 🧪 Mission 5: Reports - Testing Guide

## Quick Start Testing

### Prerequisites
✅ Backend server running on port 8000  
✅ Mobile app connected to backend  
✅ User account with some expense/income data  

---

## 🎯 Test Scenarios

### Scenario 1: Basic Reports Viewing

**Objective**: Verify all time ranges work correctly

**Steps**:
1. Open mobile app
2. Tap **Reports** tab (📊 icon in bottom navigation)
3. Verify default "Monthly" tab is selected
4. Check that summary cards show:
   - Income total
   - Expense total
   - Net balance (green if positive, red if negative)
5. Tap each tab: Daily → Weekly → 15 Days → Monthly → Last 3m
6. Verify data updates for each range
7. Check date range display updates correctly

**Expected Results**:
- ✅ All tabs load without errors
- ✅ Data changes when switching tabs
- ✅ Loading indicator appears briefly
- ✅ Date range matches selected tab
- ✅ Numbers are formatted correctly ($X.XX)

---

### Scenario 2: Excess Alert Testing

**Objective**: Trigger and verify the excess spending alert

**Setup Data**:
You need to create expenses where: **Excess > 50% of Mandatory**

**Example Setup**:
1. Add mandatory expenses totaling $1,000:
   - Rent: $800 (mandatory)
   - Utilities: $200 (mandatory)
2. Add excess expenses totaling $600:
   - Entertainment: $300 (excess)
   - Dining Out: $300 (excess)

**Steps**:
1. Create the expenses above (use AddExpense screen)
2. Go to Reports tab
3. Select "Monthly" range
4. Look for yellow alert banner at top

**Expected Results**:
- ✅ Yellow alert banner appears
- ✅ Banner shows warning icon
- ✅ Message reads: "⚠️ Excess Spending Alert"
- ✅ Details show: "Your excess spending ($600.00) exceeds 50% of mandatory expenses ($1,000.00)"

**No Alert Test**:
- If excess is ≤ $500 (50% of $1,000), no alert should appear
- ✅ No yellow banner visible

---

### Scenario 3: Expense Breakdown Visualization

**Objective**: Verify the bar chart displays correctly

**Setup Data**:
Create a mix of expense types:
- Mandatory: $1,000
- Neutral: $500
- Excess: $300

**Steps**:
1. Go to Reports tab
2. Scroll to "Expense Breakdown" section
3. Observe the horizontal bar chart

**Expected Results**:
- ✅ Bar chart shows 3 colored segments:
  - Blue segment (Mandatory) - largest
  - Yellow segment (Neutral) - medium
  - Red segment (Excess) - smallest
- ✅ Segments are proportional to amounts
- ✅ Legend below shows:
  - Blue dot + "Mandatory" + "$1,000.00"
  - Yellow dot + "Neutral" + "$500.00"
  - Red dot + "Excess" + "$300.00"

**Edge Case - No Expenses**:
- If no expenses exist, bar should be empty or show message
- ✅ Graceful handling of empty data

---

### Scenario 4: Top Categories

**Objective**: Verify top spending categories are ranked correctly

**Setup Data**:
Create expenses in multiple categories:
- Rent: $800 (1 transaction)
- Groceries: $400 (5 transactions)
- Entertainment: $300 (3 transactions)
- Transport: $200 (4 transactions)
- Utilities: $150 (2 transactions)
- Dining: $100 (2 transactions)

**Steps**:
1. Go to Reports tab
2. Scroll to "Top Spending Categories" section
3. Check the ranking

**Expected Results**:
- ✅ Categories ranked by total amount (not transaction count)
- ✅ Top 5 displayed:
  1. Rent - $800.00
  2. Groceries - $400.00
  3. Entertainment - $300.00
  4. Transport - $200.00
  5. Utilities - $150.00
- ✅ Each item shows:
  - Rank badge (1-5)
  - Category icon
  - Category name
  - Transaction count
  - Total amount
- ✅ Dining ($100) not shown (only top 5)

**Edge Case - No Expenses**:
- ✅ Shows "No spending data available" message

---

### Scenario 5: Date Range Accuracy

**Objective**: Verify date calculations are correct

**Test Each Range**:

#### Daily
- **Expected**: Today from midnight to now
- **Test**: Add expense today, should appear in Daily report
- **Test**: Add expense yesterday, should NOT appear in Daily report

#### Weekly
- **Expected**: Last 7 days
- **Test**: Add expense 6 days ago, should appear
- **Test**: Add expense 8 days ago, should NOT appear

#### 15 Days
- **Expected**: Last 15 days
- **Test**: Add expense 14 days ago, should appear
- **Test**: Add expense 16 days ago, should NOT appear

#### Monthly
- **Expected**: Last 30 days
- **Test**: Add expense 29 days ago, should appear
- **Test**: Add expense 31 days ago, should NOT appear

#### Last 3 Months
- **Expected**: Last 90 days
- **Test**: Add expense 89 days ago, should appear
- **Test**: Add expense 91 days ago, should NOT appear

**Verification**:
- ✅ Date range display shows correct dates
- ✅ Only expenses within range are counted
- ✅ Totals match filtered data

---

### Scenario 6: Refresh Functionality

**Objective**: Verify data refreshes correctly

**Steps**:
1. Open Reports tab
2. Note current totals
3. Tap refresh icon (↻) in header
4. Verify loading indicator appears
5. Check if data reloads

**Alternative**:
1. View Reports tab
2. Switch to Expenses tab
3. Add a new expense
4. Return to Reports tab
5. Tap refresh
6. Verify new expense is included in totals

**Expected Results**:
- ✅ Refresh icon triggers data reload
- ✅ Loading indicator appears during fetch
- ✅ New data appears after refresh
- ✅ No errors during refresh

---

### Scenario 7: Empty State Handling

**Objective**: Verify app handles no data gracefully

**Setup**:
- New user account with no expenses/income

**Steps**:
1. Login with new account
2. Go to Reports tab
3. Check each time range

**Expected Results**:
- ✅ Summary cards show $0.00
- ✅ Net balance shows $0.00
- ✅ Expense breakdown shows empty bar or message
- ✅ Top categories shows "No spending data available"
- ✅ No alert banner (no excess spending)
- ✅ No crashes or errors

---

### Scenario 8: Large Numbers

**Objective**: Test with large amounts

**Setup Data**:
- Income: $50,000
- Expenses: $35,000

**Steps**:
1. Add large transactions
2. Go to Reports tab
3. Check display

**Expected Results**:
- ✅ Numbers formatted correctly: $50,000.00
- ✅ No overflow or truncation
- ✅ Cards remain readable
- ✅ Bar chart proportions correct

---

### Scenario 9: Multiple Currencies (Future)

**Note**: Currently all amounts in USD

**Current Behavior**:
- ✅ All amounts show $ symbol
- ✅ Consistent currency throughout

**Future Enhancement**:
- Support user's preferred currency
- Currency conversion for mixed currencies

---

### Scenario 10: Performance Testing

**Objective**: Verify app performs well with lots of data

**Setup**:
- 100+ transactions
- Multiple categories
- Various date ranges

**Steps**:
1. Create many transactions (or use seed data)
2. Open Reports tab
3. Switch between tabs rapidly
4. Scroll through top categories

**Expected Results**:
- ✅ Loads within 2 seconds
- ✅ Smooth tab switching
- ✅ No lag when scrolling
- ✅ No memory issues

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to load report data"

**Possible Causes**:
- Backend not running
- Network connection issue
- Invalid token

**Solutions**:
1. Check backend is running: `http://localhost:8000/health`
2. Verify .env has correct API URL
3. Try logging out and back in
4. Check console for detailed error

### Issue 2: Alert not showing when it should

**Check**:
- Are there mandatory expenses?
- Are there excess expenses?
- Is excess > 50% of mandatory?

**Debug**:
1. Go to Expenses tab
2. Filter by "Excess" type
3. Check total
4. Filter by "Mandatory" type
5. Check total
6. Calculate: excess > (mandatory × 0.5)?

### Issue 3: Wrong data in reports

**Possible Causes**:
- Date range miscalculation
- Timezone issues
- Cached data

**Solutions**:
1. Tap refresh icon
2. Switch tabs and back
3. Check expense dates in Expenses tab
4. Verify backend returns correct data (check API docs)

### Issue 4: Bar chart not displaying

**Check**:
- Are there any expenses?
- Do expenses have categories?
- Do categories have expense_type set?

**Debug**:
1. Check "Expense Breakdown" section
2. Look at legend values
3. If all zeros, no expenses exist
4. Add expenses with different types

### Issue 5: Top categories empty

**Check**:
- Are there any expenses?
- Do expenses have categories assigned?

**Solutions**:
1. Add expenses with categories
2. Refresh reports
3. Check if expenses are within selected date range

---

## ✅ Testing Checklist

### Backend API
- [ ] `/reports/summary?range=day` returns data
- [ ] `/reports/summary?range=week` returns data
- [ ] `/reports/summary?range=15d` returns data
- [ ] `/reports/summary?range=month` returns data
- [ ] `/reports/summary?range=last3m` returns data
- [ ] Excess alert calculation is correct
- [ ] Top categories are ranked by amount
- [ ] Date ranges are accurate
- [ ] Returns 401 without auth token

### Mobile UI
- [ ] Reports tab appears in navigation
- [ ] Tab icon displays correctly
- [ ] All 5 tabs are visible
- [ ] Active tab is highlighted
- [ ] Date range displays correctly
- [ ] Summary cards show correct data
- [ ] Income card is green
- [ ] Expense card is red
- [ ] Net balance color matches sign
- [ ] Bar chart displays proportionally
- [ ] Legend shows correct amounts
- [ ] Top categories ranked correctly
- [ ] Category icons display
- [ ] Transaction counts are correct
- [ ] Refresh button works
- [ ] Loading indicator appears
- [ ] Empty states handled gracefully

### Alert Banner
- [ ] Appears when excess > 50% mandatory
- [ ] Does NOT appear when excess ≤ 50% mandatory
- [ ] Shows correct amounts in message
- [ ] Yellow background with red border
- [ ] Warning icon displays
- [ ] Message is readable

### Edge Cases
- [ ] Works with no data
- [ ] Works with large numbers
- [ ] Works with many transactions
- [ ] Handles network errors
- [ ] Handles missing categories
- [ ] Handles zero amounts

---

## 🎯 Acceptance Criteria

### Must Have ✅
- [x] All 5 time ranges functional
- [x] Income/expense totals accurate
- [x] Net balance calculated correctly
- [x] Expense breakdown by type
- [x] Top 5 categories displayed
- [x] Excess alert rule working
- [x] Alert banner appears when needed
- [x] Refresh functionality
- [x] Loading states
- [x] Error handling

### Nice to Have 🎁
- [ ] Pull-to-refresh gesture
- [ ] Animated transitions
- [ ] Export report feature
- [ ] Share functionality
- [ ] Custom date ranges
- [ ] Comparison charts

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________
Device: ___________
OS Version: ___________

Scenario 1: Basic Reports Viewing
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 2: Excess Alert Testing
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 3: Expense Breakdown
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 4: Top Categories
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 5: Date Range Accuracy
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 6: Refresh Functionality
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 7: Empty State Handling
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 8: Large Numbers
Status: [ ] Pass [ ] Fail
Notes: _______________________

Scenario 10: Performance Testing
Status: [ ] Pass [ ] Fail
Notes: _______________________

Overall Status: [ ] All Pass [ ] Some Failures
```

---

## 🚀 Ready to Test!

Follow the scenarios above to thoroughly test the Reports feature. If you encounter any issues, refer to the "Common Issues & Solutions" section.

**Happy Testing! 🎉**