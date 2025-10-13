# Mission 6: Testing & Verification Guide

## 🎯 Mission 6 - Calendar with Planned Expenses & Local Reminders

### ✅ Implementation Status: **COMPLETE**

All features have been implemented and are ready for testing!

---

## 📋 Quick Start

### 1. Start the Project

```powershell
# From project root
.\START_PROJECT.ps1
```

This will start:
- ✅ FastAPI Backend (http://localhost:8000)
- ✅ ngrok tunnel (for mobile testing)
- ✅ Expo Development Server

### 2. Access the Application

**API Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Mobile App:**
- Expo Web: http://localhost:8081
- Expo Go App: Scan QR code from terminal

---

## 🧪 Testing Checklist

### Backend API Testing

#### ✅ Test 1: Create Reminder

**Endpoint:** `POST /reminders`

**Test Case 1.1: Valid Reminder**
```bash
curl -X POST "http://localhost:8000/reminders" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pay rent",
    "amount": 1500,
    "category_id": 1,
    "note": "Monthly rent payment",
    "reminder_date": "2025-02-01T09:00:00Z"
  }'
```

**Expected Result:**
- ✅ Status: 201 Created
- ✅ Returns reminder with ID
- ✅ Category details included
- ✅ `is_completed` is false
- ✅ `entry_id` is null

**Test Case 1.2: Date Validation (Past Date)**
```json
{
  "title": "Test",
  "reminder_date": "2020-01-01T09:00:00Z"
}
```

**Expected Result:**
- ❌ Status: 400 Bad Request
- ❌ Error: "Reminder date cannot be in the past"

**Test Case 1.3: Date Validation (Beyond 3 Months)**
```json
{
  "title": "Test",
  "reminder_date": "2025-12-01T09:00:00Z"
}
```

**Expected Result:**
- ❌ Status: 400 Bad Request
- ❌ Error: "Reminder date cannot be more than 3 months in the future"

---

#### ✅ Test 2: List Reminders

**Endpoint:** `GET /reminders`

**Test Case 2.1: Get All Reminders**
```bash
curl -X GET "http://localhost:8000/reminders" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:**
- ✅ Returns array of reminders
- ✅ Includes summary counts (total, upcoming, completed)
- ✅ Sorted by reminder_date ascending

**Test Case 2.2: Filter by Completion Status**
```bash
# Only pending reminders
curl -X GET "http://localhost:8000/reminders?include_completed=false" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:**
- ✅ Returns only reminders where `is_completed = false`

**Test Case 2.3: Filter by Date Range**
```bash
curl -X GET "http://localhost:8000/reminders?start_date=2025-01-01&end_date=2025-01-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:**
- ✅ Returns only reminders within specified date range

---

#### ✅ Test 3: Get Calendar View

**Endpoint:** `GET /reminders/calendar/{year}/{month}`

**Test Case 3.1: Get Current Month**
```bash
curl -X GET "http://localhost:8000/reminders/calendar/2025/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:**
```json
{
  "year": 2025,
  "month": 1,
  "reminders_by_date": {
    "2025-01-15": [
      {
        "id": 1,
        "title": "Pay rent",
        "amount": 1500,
        "time": "09:00",
        "category_name": "Housing",
        "category_icon": "🏠",
        "category_color": "#FF6B6B"
      }
    ]
  },
  "total_reminders": 5
}
```

---

#### ✅ Test 4: Mark Reminder Complete

**Endpoint:** `POST /reminders/{id}/complete`

**Test Case 4.1: Mark as Done**
```bash
curl -X POST "http://localhost:8000/reminders/1/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ `is_completed` = true
- ✅ `completed_at` has timestamp
- ✅ `entry_id` remains null

---

#### ✅ Test 5: Create Expense from Reminder

**Endpoint:** `POST /reminders/{id}/create-expense`

**Test Case 5.1: Quick Add Expense**
```bash
curl -X POST "http://localhost:8000/reminders/1/create-expense" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500,
    "note": "Rent paid",
    "booked_at": "2025-01-15T10:00:00Z"
  }'
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Creates new expense entry
- ✅ Marks reminder as completed
- ✅ Links reminder to entry (entry_id set)
- ✅ Returns both reminder_id and entry_id

**Test Case 5.2: Validation - No Category**
```bash
# Try with reminder that has no category
```

**Expected Result:**
- ❌ Status: 400 Bad Request
- ❌ Error: "Reminder must have a category to create expense"

---

#### ✅ Test 6: Update Reminder

**Endpoint:** `PUT /reminders/{id}`

**Test Case 6.1: Update Title and Amount**
```bash
curl -X PUT "http://localhost:8000/reminders/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pay rent - UPDATED",
    "amount": 1600
  }'
```

**Expected Result:**
- ✅ Status: 200 OK
- ✅ Only specified fields updated
- ✅ `updated_at` timestamp changed

---

#### ✅ Test 7: Delete Reminder

**Endpoint:** `DELETE /reminders/{id}`

**Test Case 7.1: Delete Reminder**
```bash
curl -X DELETE "http://localhost:8000/reminders/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Result:**
- ✅ Status: 204 No Content
- ✅ Reminder removed from database
- ✅ Linked expense (if any) remains intact

---

### Mobile App Testing

#### ✅ Test 8: Calendar Screen Access

**Steps:**
1. Open mobile app
2. Login with credentials
3. Navigate to "Calendar" tab

**Expected Result:**
- ✅ Calendar screen loads
- ✅ Current month displayed
- ✅ Month navigation buttons visible
- ✅ "Add Reminder" button visible

---

#### ✅ Test 9: Calendar Grid Display

**Steps:**
1. View calendar grid
2. Check day headers (Sun-Sat)
3. Check current day indicator
4. Check reminder dots on days with reminders

**Expected Result:**
- ✅ 7 columns (Sun-Sat)
- ✅ 6 rows (42 days)
- ✅ Today highlighted with blue circle
- ✅ Colored dots appear on days with reminders
- ✅ Previous/next month days shown in gray

---

#### ✅ Test 10: Month Navigation

**Test Case 10.1: Navigate Forward**
**Steps:**
1. Tap "Next Month" button
2. Repeat 3 times

**Expected Result:**
- ✅ Month changes each time
- ✅ After 3 months, button becomes disabled
- ✅ Cannot navigate beyond 3 months

**Test Case 10.2: Navigate Backward**
**Steps:**
1. From future month, tap "Previous Month"

**Expected Result:**
- ✅ Returns to previous month
- ✅ Cannot go before current month

---

#### ✅ Test 11: Create Reminder

**Steps:**
1. Tap "Add Reminder" button
2. Fill in form:
   - Title: "Test Reminder"
   - Amount: 100
   - Category: Select any
   - Date: Tomorrow
   - Time: 10:00 AM
   - Note: "Test note"
3. Tap "Add Reminder"

**Expected Result:**
- ✅ Modal opens with form
- ✅ All fields editable
- ✅ Category picker shows expense categories
- ✅ Date picker limits to 3 months
- ✅ Success message appears
- ✅ Modal closes
- ✅ Reminder appears in calendar
- ✅ Reminder appears in upcoming list

---

#### ✅ Test 12: Local Notifications

**Steps:**
1. Create reminder for 2 minutes from now
2. Wait for notification time
3. Check device notifications

**Expected Result:**
- ✅ Notification permission requested (first time)
- ✅ Notification scheduled successfully
- ✅ Notification appears at exact time
- ✅ Notification shows title and amount
- ✅ Tapping notification opens app

**Note:** Test on physical device for best results. Simulator notifications may be limited.

---

#### ✅ Test 13: Upcoming Reminders List

**Steps:**
1. Create multiple reminders for next 7 days
2. Scroll to "Upcoming Reminders" section

**Expected Result:**
- ✅ Shows reminders for next 7 days only
- ✅ Sorted by date (earliest first)
- ✅ Each card shows:
  - Category badge (icon + name + color)
  - Title and amount
  - Date and time
  - Note (if present)
  - Action buttons

---

#### ✅ Test 14: Quick Add Expense

**Steps:**
1. Find reminder in upcoming list
2. Tap "Add Expense" button
3. Confirm in dialog

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Expense created successfully
- ✅ Reminder marked as completed
- ✅ Reminder disappears from upcoming list
- ✅ Success message shown
- ✅ Can view expense in Expenses tab

---

#### ✅ Test 15: Mark Reminder Done

**Steps:**
1. Find reminder in upcoming list
2. Tap "Done" button

**Expected Result:**
- ✅ Reminder marked as completed
- ✅ Reminder disappears from upcoming list
- ✅ No expense created
- ✅ Success message shown

---

#### ✅ Test 16: Delete Reminder

**Steps:**
1. Find reminder in upcoming list
2. Tap delete button (🗑️)
3. Confirm deletion

**Expected Result:**
- ✅ Confirmation dialog appears
- ✅ Reminder deleted
- ✅ Reminder disappears from calendar
- ✅ Reminder disappears from upcoming list

---

#### ✅ Test 17: Category Integration

**Steps:**
1. Create reminder with category
2. View in calendar and upcoming list

**Expected Result:**
- ✅ Category icon displayed
- ✅ Category name displayed
- ✅ Category color used for:
  - Reminder dot in calendar
  - Badge background in card
  - Text color in card

---

#### ✅ Test 18: Empty States

**Test Case 18.1: No Upcoming Reminders**
**Steps:**
1. Delete all upcoming reminders
2. View upcoming section

**Expected Result:**
- ✅ Shows empty state message
- ✅ Suggests creating a reminder

**Test Case 18.2: No Reminders in Month**
**Steps:**
1. Navigate to future month with no reminders

**Expected Result:**
- ✅ Calendar shows no dots
- ✅ No errors displayed

---

#### ✅ Test 19: Form Validation

**Test Case 19.1: Empty Title**
**Steps:**
1. Open add reminder modal
2. Leave title empty
3. Try to submit

**Expected Result:**
- ❌ Error message: "Please enter a title"
- ❌ Form not submitted

**Test Case 19.2: Invalid Amount**
**Steps:**
1. Enter negative amount
2. Try to submit

**Expected Result:**
- ❌ Error message shown
- ❌ Form not submitted

**Test Case 19.3: Past Date**
**Steps:**
1. Try to select yesterday's date
2. Try to submit

**Expected Result:**
- ❌ Date picker prevents past dates
- ❌ Or error message shown

---

#### ✅ Test 20: Loading States

**Steps:**
1. Open calendar screen
2. Observe loading indicators
3. Create/update/delete reminders

**Expected Result:**
- ✅ Loading spinner shown while fetching data
- ✅ Loading states during API calls
- ✅ Smooth transitions between states

---

## 🔍 Edge Cases to Test

### Edge Case 1: Timezone Handling
- Create reminder in different timezone
- Verify notification triggers at correct local time

### Edge Case 2: Multiple Reminders Same Day
- Create 5+ reminders for same day
- Verify all show in calendar (dots)
- Verify all show in upcoming list

### Edge Case 3: Reminder at Midnight
- Create reminder for 00:00
- Verify displays correctly

### Edge Case 4: Long Text
- Create reminder with very long title (200 chars)
- Create reminder with very long note
- Verify text truncation/wrapping

### Edge Case 5: No Internet Connection
- Turn off internet
- Try to create reminder
- Verify error handling

### Edge Case 6: Expired Reminders
- Create reminder for past (via API)
- Verify doesn't show in upcoming
- Verify shows in calendar

---

## 📊 Performance Testing

### Performance Test 1: Large Dataset
**Steps:**
1. Create 100+ reminders via API
2. Open calendar screen
3. Navigate between months

**Expected Result:**
- ✅ Calendar loads in < 2 seconds
- ✅ Month navigation is smooth
- ✅ No lag or freezing

### Performance Test 2: Notification Scheduling
**Steps:**
1. Create 50 reminders
2. Check notification scheduling time

**Expected Result:**
- ✅ All notifications scheduled successfully
- ✅ No performance degradation

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **3-Month Limit**: Cannot plan beyond 3 months (by design)
2. **Local Notifications Only**: No server-side push notifications
3. **Single Reminder per Time**: No conflict detection
4. **No Recurring Reminders**: Each reminder is one-time only

### Platform-Specific:
- **iOS**: Notification permissions must be granted in Settings
- **Android**: Notification channels may need configuration
- **Web**: Limited notification support in browsers

---

## 🎯 Success Criteria

Mission 6 is considered successful if:

- ✅ All 20 test cases pass
- ✅ Calendar displays correctly on all screen sizes
- ✅ Notifications work on physical devices
- ✅ No crashes or errors during normal use
- ✅ API responds within acceptable time (<500ms)
- ✅ UI is responsive and smooth
- ✅ Data persists correctly
- ✅ User can complete full workflow (create → notify → add expense)

---

## 🚀 Next Steps

After verifying Mission 6:

1. **Mission 7**: Motivation (Streaks, Goals, Challenges)
2. **Mission 8**: Settings & Language Bar
3. **Mission 9**: Reports Polish & Performance
4. **Mission 10**: Japanese Theme (Final Pass)

---

## 📞 Support

If you encounter issues:

1. Check API logs: Terminal running uvicorn
2. Check mobile logs: Expo terminal
3. Check browser console: For web testing
4. Review documentation: MISSION_6_OVERVIEW.md

---

## 🎉 Congratulations!

Mission 6 is fully implemented and ready for testing. The calendar and reminders system provides a solid foundation for expense planning and user engagement.

**Happy Testing! 🧪**