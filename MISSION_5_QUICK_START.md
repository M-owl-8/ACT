# 🚀 Mission 5: Reports - Quick Start Guide

## ⚡ Get Started in 3 Steps

### Step 1: Start Backend (if not running)
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\api
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Expected Output**:
```
✅ ACT Gen-1 API is ready!
INFO: Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start Mobile App (if not running)
```powershell
cd c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile
npx expo start
```

### Step 3: Open Reports Tab
1. Open app on your device
2. Tap **Reports** tab (📊 icon)
3. Explore the features!

---

## 🎯 What You'll See

### 1. **Tab Navigation**
Five tabs at the top:
- **Daily** - Today's summary
- **Weekly** - Last 7 days
- **15 Days** - Last 15 days
- **Monthly** - Last 30 days (default)
- **Last 3m** - Last 3 months

### 2. **Summary Cards**
Three big cards showing:
- 💚 **Income** - Total money in
- ❤️ **Expenses** - Total money out
- 💙 **Net Balance** - Income minus expenses

### 3. **Expense Breakdown**
Colorful bar chart showing:
- 🔵 **Mandatory** - Essential expenses (rent, utilities)
- 🟡 **Neutral** - Regular expenses (groceries, transport)
- 🔴 **Excess** - Non-essential spending (entertainment, luxury)

### 4. **Top Categories**
Your top 5 spending categories ranked by amount

### 5. **Excess Alert** (if triggered)
⚠️ Yellow banner warning you if excess spending is too high

---

## 🧪 Quick Test

### Test the Excess Alert

**Goal**: See the alert banner in action

**Steps**:
1. Add mandatory expenses totaling $1,000:
   - Go to Expenses tab
   - Tap + button
   - Add "Rent" - $800 (Mandatory)
   - Add "Utilities" - $200 (Mandatory)

2. Add excess expenses totaling $600:
   - Add "Entertainment" - $300 (Excess)
   - Add "Dining Out" - $300 (Excess)

3. Go to Reports tab
4. Select "Monthly"
5. **Look for yellow alert banner at top!**

**Why it appears**:
- Excess ($600) > 50% of Mandatory ($1,000 × 0.5 = $500)
- Alert rule triggered! ⚠️

---

## 📊 Understanding the Data

### Time Ranges Explained

| Tab | Shows | Example |
|-----|-------|---------|
| Daily | Today from midnight | Jan 15, 12:00 AM - Now |
| Weekly | Last 7 days | Jan 8 - Jan 15 |
| 15 Days | Last 15 days | Jan 1 - Jan 15 |
| Monthly | Last 30 days | Dec 16 - Jan 15 |
| Last 3m | Last 90 days | Oct 17 - Jan 15 |

### Expense Types

**Mandatory** 🔵
- Essential for living
- Examples: Rent, utilities, insurance, groceries
- Cannot be avoided

**Neutral** 🟡
- Regular but not critical
- Examples: Transport, phone bill, basic clothing
- Can be optimized

**Excess** 🔴
- Non-essential spending
- Examples: Entertainment, dining out, luxury items
- Can be reduced

### The Alert Rule

**Formula**: `excess > 0.5 × mandatory`

**Examples**:

✅ **No Alert**:
- Mandatory: $2,000
- Excess: $800
- Threshold: $1,000 (50% of $2,000)
- $800 < $1,000 → No alert

⚠️ **Alert Triggered**:
- Mandatory: $2,000
- Excess: $1,200
- Threshold: $1,000
- $1,200 > $1,000 → Alert!

---

## 🎨 Features Highlights

### 1. **Visual Bar Chart**
- Instantly see spending distribution
- Proportional segments
- Color-coded by type

### 2. **Smart Ranking**
- Top categories by total amount
- Not by transaction count
- Shows what costs you most

### 3. **Date Range Display**
- Always know what period you're viewing
- Format: "Jan 1 - Jan 15"

### 4. **Refresh Button**
- Tap ↻ icon in header
- Reload latest data
- Useful after adding new transactions

### 5. **Responsive Design**
- Works on all screen sizes
- Smooth scrolling
- Touch-friendly

---

## 🔍 API Endpoints

### Test in Browser

**Health Check**:
```
http://localhost:8000/health
```

**API Documentation**:
```
http://localhost:8000/docs
```
- Navigate to "Reports" section
- Try out endpoints interactively

### Test with cURL

**Monthly Report**:
```powershell
curl http://localhost:8000/reports/summary?range=month -H "Authorization: Bearer YOUR_TOKEN"
```

**Weekly Report**:
```powershell
curl http://localhost:8000/reports/summary?range=week -H "Authorization: Bearer YOUR_TOKEN"
```

**Period Comparison**:
```powershell
curl http://localhost:8000/reports/comparison -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 💡 Tips & Tricks

### Tip 1: Add Sample Data
To see meaningful reports, add various transactions:
- Mix of income and expenses
- Different categories
- Different expense types
- Spread across dates

### Tip 2: Compare Time Ranges
- Check Daily for today's activity
- Check Weekly for recent trends
- Check Monthly for overall picture
- Check Last 3m for long-term patterns

### Tip 3: Monitor the Alert
- Keep excess spending under control
- Aim for excess < 50% of mandatory
- Adjust spending when alert appears

### Tip 4: Use Top Categories
- Identify biggest expenses
- Focus on reducing top spenders
- Track changes over time

### Tip 5: Regular Check-ins
- Daily: Quick morning check
- Weekly: Sunday review
- Monthly: End-of-month analysis
- Quarterly: Last 3m overview

---

## 🐛 Troubleshooting

### Problem: Reports tab not showing
**Solution**: 
- Restart Expo app
- Clear cache: `npx expo start --clear`

### Problem: No data in reports
**Solution**:
- Add some expenses/income first
- Check date range (might be outside range)
- Tap refresh button

### Problem: Alert not appearing
**Solution**:
- Check if you have mandatory expenses
- Check if you have excess expenses
- Verify excess > 50% of mandatory

### Problem: "Failed to load report data"
**Solution**:
- Check backend is running
- Verify network connection
- Try logging out and back in

---

## 📚 Learn More

**Full Documentation**:
- `MISSION_5_REPORTS_COMPLETE.md` - Complete implementation details
- `MISSION_5_TESTING_GUIDE.md` - Comprehensive testing scenarios

**API Reference**:
- Visit `http://localhost:8000/docs`
- Explore Reports endpoints
- Test with interactive UI

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Mobile app connected
- [ ] Reports tab visible in navigation
- [ ] Can switch between all 5 tabs
- [ ] Summary cards show data
- [ ] Bar chart displays
- [ ] Top categories listed
- [ ] Refresh button works
- [ ] Alert appears when triggered

---

## 🎉 You're Ready!

Mission 5 is complete and ready to use. Start exploring your financial reports and gain insights into your spending patterns!

**Need Help?**
- Check `MISSION_5_TESTING_GUIDE.md` for detailed test scenarios
- Review `MISSION_5_REPORTS_COMPLETE.md` for technical details
- Visit API docs at `http://localhost:8000/docs`

**Happy Reporting! 📊**