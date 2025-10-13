# Mission 6: Calendar with Planned Expenses and Local Reminders

## 🎯 Mission Goal
Enable users to plan expenses up to 3 months ahead and receive device-based local notifications to nudge timely action on planned expenses.

## 📋 Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [User Workflows](#user-workflows)
5. [Technical Implementation](#technical-implementation)
6. [API Endpoints](#api-endpoints)
7. [Mobile UI Components](#mobile-ui-components)
8. [Notification System](#notification-system)
9. [Data Model](#data-model)
10. [Integration Points](#integration-points)

---

## Overview

**Mission 6** introduces a comprehensive calendar-based expense planning system that allows users to:
- **Plan ahead**: Create reminders for future expenses up to 3 months in advance
- **Stay organized**: View all planned expenses in a visual calendar grid
- **Get notified**: Receive local device notifications when expenses are due
- **Quick action**: Convert reminders directly into actual expense entries with one tap
- **Track completion**: Mark reminders as done without creating expenses

### Why This Matters
Financial planning requires foresight. Users often know about upcoming expenses (rent, bills, subscriptions) but forget to record them. This feature bridges the gap between planning and execution.

---

## Key Features

### ✅ Implemented Features

#### 1. **Calendar View (3-Month Horizon)**
- Visual month grid showing current month + up to 3 months ahead
- Day-by-day reminder indicators (colored dots)
- Month navigation with forward limit enforcement
- Today indicator for easy orientation
- Responsive grid layout adapting to screen size

#### 2. **Reminder Creation**
- **Required fields**: Title, Date & Time
- **Optional fields**: Amount, Category, Notes
- Category picker with icons and colors
- Time selection with hour/minute precision
- Automatic local notification scheduling
- Validation for 3-month limit

#### 3. **Upcoming Reminders List**
- Shows next 7 days of reminders
- Detailed cards with all reminder information
- Category integration (icon, name, color)
- Quick action buttons on each card
- Empty state when no upcoming reminders

#### 4. **Local Notifications**
- Device-based notifications (no server required)
- Automatic scheduling when reminder is created
- Permission request handling
- Notification triggers at exact reminder time
- Works even when app is closed (device-level)

#### 5. **Quick Actions**
- **Add Expense**: Convert reminder to actual expense entry
  - Pre-fills all fields from reminder
  - Links expense to reminder (entry_id)
  - Marks reminder as completed
  - Seamless one-tap flow
- **Mark Done**: Complete reminder without creating expense
- **Delete**: Remove reminder and cancel notification

#### 6. **Full CRUD Operations**
- Create new reminders
- View reminder details
- Update existing reminders
- Delete reminders
- List with filtering (completed/pending, date range)
- Calendar view grouped by date

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (React Native)                │
├─────────────────────────────────────────────────────────────┤
│  CalendarScreen.tsx                                          │
│  ├─ Calendar Grid (Month View)                              │
│  ├─ Month Navigation                                         │
│  ├─ Upcoming Reminders List                                 │
│  ├─ Add Reminder Modal                                      │
│  └─ Local Notification Manager (expo-notifications)         │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                     │
├─────────────────────────────────────────────────────────────┤
│  /reminders Router                                           │
│  ├─ CRUD Endpoints                                          │
│  ├─ Calendar View Endpoint                                  │
│  ├─ Complete/Create-Expense Actions                         │
│  └─ Validation & Business Logic                            │
└─────────────────────────────────────────────────────────────┘
                            ↕ ORM
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  reminders table                                             │
│  ├─ id, user_id, title, amount, currency                   │
│  ├─ reminder_date, note                                     │
│  ├─ category_id (FK → categories)                          │
│  ├─ entry_id (FK → entries, nullable)                      │
│  ├─ is_completed, completed_at                             │
│  └─ created_at, updated_at                                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### Creating a Reminder
```
User fills form → Mobile validates → POST /reminders → Backend validates
→ Save to DB → Return reminder → Schedule local notification → Show in calendar
```

#### Converting Reminder to Expense
```
User taps "Add Expense" → POST /reminders/{id}/create-expense → Backend creates entry
→ Links entry_id → Marks completed → Returns expense → Mobile navigates to Expenses
```

---

## User Workflows

### Workflow 1: Planning a Future Expense

```
1. User opens Calendar tab
2. Taps "Add Reminder" button
3. Fills in reminder details:
   - Title: "Pay rent"
   - Amount: 1500
   - Category: Housing
   - Date: Next month, 1st day
   - Time: 09:00 AM
   - Note: "Monthly rent payment"
4. Taps "Add Reminder"
5. System:
   - Saves reminder to database
   - Schedules local notification for specified date/time
   - Shows reminder in calendar grid (dot on day 1)
   - Adds to upcoming reminders list
6. User sees confirmation and reminder appears in calendar
```

### Workflow 2: Receiving Notification and Adding Expense

```
1. Notification triggers at scheduled time
2. User receives device notification: "Pay rent - $1500"
3. User taps notification → Opens app to Calendar screen
4. User sees reminder card in upcoming list
5. User taps "Add Expense" button
6. System:
   - Creates actual expense entry with reminder details
   - Links expense to reminder
   - Marks reminder as completed
   - Navigates to Expenses screen
7. User sees new expense in Expenses list
8. Reminder disappears from upcoming list (completed)
```

### Workflow 3: Marking Reminder as Done (Without Expense)

```
1. User opens Calendar tab
2. Sees reminder: "Call insurance company"
3. User completes the task (no expense needed)
4. User taps "Done" button
5. System marks reminder as completed
6. Reminder disappears from upcoming list
7. User continues planning other expenses
```

---

## Technical Implementation

### Backend Implementation

#### Database Model (`models.py`)

```python
class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=True)
    currency = Column(String, default="USD")
    reminder_date = Column(DateTime, nullable=False)
    note = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    entry_id = Column(Integer, ForeignKey("entries.id"), nullable=True)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="reminders")
    category = relationship("Category")
    entry = relationship("Entry")
```

#### Key Validations

1. **3-Month Limit**: `reminder_date` must be ≤ 3 months from today
2. **Category Ownership**: If category provided, must belong to user
3. **Amount Validation**: If provided, must be positive
4. **Date Validation**: Cannot create reminders in the past

---

## API Endpoints

### Complete API Reference

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/reminders` | Create new reminder | ✅ |
| GET | `/reminders` | List reminders (with filters) | ✅ |
| GET | `/reminders/{id}` | Get specific reminder | ✅ |
| PUT | `/reminders/{id}` | Update reminder | ✅ |
| DELETE | `/reminders/{id}` | Delete reminder | ✅ |
| POST | `/reminders/{id}/complete` | Mark as done (no expense) | ✅ |
| POST | `/reminders/{id}/create-expense` | Convert to expense entry | ✅ |
| GET | `/reminders/calendar/{year}/{month}` | Get calendar view | ✅ |

### Detailed Endpoint Documentation

#### 1. Create Reminder
```http
POST /reminders
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Pay rent",
  "amount": 1500,
  "currency": "USD",
  "reminder_date": "2024-02-01T09:00:00Z",
  "note": "Monthly rent payment",
  "category_id": 5
}

Response 200:
{
  "id": 123,
  "user_id": 1,
  "title": "Pay rent",
  "amount": 1500,
  "currency": "USD",
  "reminder_date": "2024-02-01T09:00:00Z",
  "note": "Monthly rent payment",
  "category_id": 5,
  "category": {
    "id": 5,
    "name": "Housing",
    "icon": "home",
    "color": "#FF6B6B"
  },
  "entry_id": null,
  "is_completed": false,
  "completed_at": null,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### 2. List Reminders (with Filters)
```http
GET /reminders?completed=false&start_date=2024-01-01&end_date=2024-03-31
Authorization: Bearer {token}

Response 200:
[
  {
    "id": 123,
    "title": "Pay rent",
    "amount": 1500,
    "reminder_date": "2024-02-01T09:00:00Z",
    "category": {...},
    "is_completed": false,
    ...
  },
  ...
]
```

#### 3. Convert to Expense
```http
POST /reminders/123/create-expense
Authorization: Bearer {token}

Response 200:
{
  "reminder": {
    "id": 123,
    "is_completed": true,
    "completed_at": "2024-02-01T09:15:00Z",
    "entry_id": 456,
    ...
  },
  "entry": {
    "id": 456,
    "amount": 1500,
    "type": "expense",
    "description": "Pay rent",
    "category_id": 5,
    ...
  }
}
```

#### 4. Calendar View
```http
GET /reminders/calendar/2024/2
Authorization: Bearer {token}

Response 200:
{
  "2024-02-01": [
    {
      "id": 123,
      "title": "Pay rent",
      "amount": 1500,
      "reminder_date": "2024-02-01T09:00:00Z",
      "category": {...}
    }
  ],
  "2024-02-15": [
    {
      "id": 124,
      "title": "Credit card payment",
      "amount": 500,
      ...
    }
  ]
}
```

---

## Mobile UI Components

### Screen Structure

```
CalendarScreen
├─ Header
│  ├─ Title: "Calendar"
│  └─ Add Reminder Button
├─ Month Navigation
│  ├─ Previous Month Button
│  ├─ Current Month Label
│  └─ Next Month Button (disabled after +3 months)
├─ Calendar Grid
│  ├─ Day Headers (Sun-Sat)
│  └─ Day Cells (6 weeks)
│     ├─ Day Number
│     ├─ Today Indicator (blue circle)
│     └─ Reminder Dots (colored)
├─ Upcoming Reminders Section
│  ├─ Section Title: "Upcoming (Next 7 Days)"
│  └─ Reminder Cards
│     ├─ Category Icon & Color
│     ├─ Title & Amount
│     ├─ Date & Time
│     ├─ Note (if present)
│     └─ Action Buttons
│        ├─ Add Expense
│        ├─ Done
│        └─ Delete
└─ Add Reminder Modal
   ├─ Title Input
   ├─ Amount Input
   ├─ Category Picker
   ├─ Date Picker
   ├─ Time Picker
   ├─ Note Input
   └─ Submit Button
```

### Key UI Elements

#### Calendar Grid
- **Layout**: 7 columns (days) × 6 rows (weeks)
- **Cell Size**: Responsive, adapts to screen width
- **Today Indicator**: Blue circle background
- **Reminder Dots**: Small colored circles below day number
- **Inactive Days**: Grayed out for previous/next month days

#### Reminder Card
```
┌─────────────────────────────────────────────────┐
│ 🏠 Housing                                      │
│ Pay rent                                  $1500 │
│ Feb 1, 2024 at 9:00 AM                         │
│ Monthly rent payment                            │
│                                                 │
│ [Add Expense] [Done] [🗑️]                      │
└─────────────────────────────────────────────────┘
```

### Color Scheme

| Element | Color | Usage |
|---------|-------|-------|
| Primary Blue | `#007AFF` | Today indicator, buttons |
| Success Green | `#34C759` | "Done" button |
| Danger Red | `#FF3B30` | Delete button |
| Gray Text | `#8E8E93` | Secondary text, inactive days |
| Category Colors | Dynamic | From category.color field |

---

## Notification System

### Implementation: expo-notifications

#### Setup
```typescript
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

#### Scheduling Notification
```typescript
const scheduleNotification = async (reminder: Reminder) => {
  const trigger = new Date(reminder.reminder_date);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.amount 
        ? `${reminder.currency} ${reminder.amount}` 
        : reminder.note || '',
      data: { reminderId: reminder.id },
    },
    trigger,
  });
};
```

#### Notification Behavior
- **Trigger Time**: Exact date/time specified in reminder
- **Persistence**: Survives app restarts (device-level)
- **Limitations**: 
  - Cleared if app is uninstalled
  - May not work if device is off
  - Subject to OS battery optimization

### Best Practices
1. **Always request permissions** before scheduling
2. **Handle permission denial** gracefully
3. **Cancel notifications** when reminder is deleted
4. **Update notifications** when reminder is modified
5. **Test on real devices** (simulators have limitations)

---

## Data Model

### Reminder Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Integer | Auto | Primary key |
| user_id | Integer | ✅ | Owner of reminder |
| title | String | ✅ | Reminder title |
| amount | Float | ❌ | Optional expense amount |
| currency | String | ❌ | Default: "USD" |
| reminder_date | DateTime | ✅ | When to trigger |
| note | String | ❌ | Additional details |
| category_id | Integer | ❌ | Link to category |
| entry_id | Integer | ❌ | Link to created expense |
| is_completed | Boolean | Auto | Completion status |
| completed_at | DateTime | Auto | When completed |
| created_at | DateTime | Auto | Creation timestamp |
| updated_at | DateTime | Auto | Last update timestamp |

### Relationships

```
User (1) ──────< (N) Reminder
Category (1) ──────< (N) Reminder
Entry (1) ──────< (1) Reminder (optional)
```

### State Transitions

```
Created (is_completed=false, entry_id=null)
    ↓
    ├─→ Completed without expense (is_completed=true, entry_id=null)
    └─→ Converted to expense (is_completed=true, entry_id=set)
```

---

## Integration Points

### 1. Categories System
- Reminders can be tagged with expense categories
- Category details (icon, color, name) included in responses
- Category picker in reminder creation modal
- Visual category indicators in reminder cards

### 2. Entries System
- "Add Expense" action creates Entry record
- Entry linked back to reminder via `entry_id`
- All reminder details pre-fill expense form
- Seamless navigation to Expenses screen

### 3. Navigation System
- New Calendar tab in bottom navigation
- Positioned between Expenses and Reports
- Icon: Calendar (filled when active, outline when inactive)
- Total 5 tabs: Income, Expenses, Calendar, Reports, Profile

### 4. Authentication
- All endpoints require JWT authentication
- User can only access their own reminders
- Category ownership validated on creation

---

## Success Metrics

### User Engagement
- Number of reminders created per user
- Conversion rate: reminders → actual expenses
- Time between reminder creation and completion
- Notification open rate

### Feature Adoption
- % of users who create at least 1 reminder
- Average reminders per active user
- Most common reminder categories
- Peak reminder creation times

### Business Impact
- Improved expense tracking accuracy
- Reduced forgotten expenses
- Better financial planning behavior
- Increased app retention (planning creates habit)

---

## Future Enhancements

### Phase 2 Features
1. **Recurring Reminders**: Weekly, monthly, yearly patterns
2. **Reminder Templates**: Save common reminders for reuse
3. **Snooze Functionality**: Postpone reminder by X hours/days
4. **Bulk Operations**: Create multiple reminders at once
5. **Smart Suggestions**: AI-powered reminder recommendations

### Phase 3 Features
1. **Server-Side Push Notifications**: More reliable delivery
2. **Shared Reminders**: Family/household expense planning
3. **Budget Integration**: Warn if reminder exceeds budget
4. **Calendar Sync**: Import from Google Calendar, iCal
5. **Reminder Analytics**: Insights on planning vs. actual spending

---

## Troubleshooting

### Common Issues

#### Notifications Not Appearing
- **Check permissions**: Ensure user granted notification permissions
- **Verify trigger time**: Must be in the future
- **Test on real device**: Simulators have limited notification support
- **Check OS settings**: User may have disabled app notifications

#### Calendar Not Loading
- **Check API connection**: Verify backend is running
- **Inspect network errors**: Look for 401/403 (auth issues)
- **Validate date range**: Ensure within 3-month limit
- **Check user authentication**: Token may be expired

#### Reminder Creation Fails
- **Validate date**: Must be within 3 months
- **Check category**: Must belong to user
- **Verify amount**: Must be positive if provided
- **Inspect validation errors**: Backend returns detailed messages

---

## Documentation Index

This is **Document 1 of 10** in the Mission 6 documentation suite:

1. **MISSION_6_OVERVIEW.md** ← You are here
2. MISSION_6_API_REFERENCE.md - Detailed API documentation
3. MISSION_6_MOBILE_GUIDE.md - Mobile implementation guide
4. MISSION_6_NOTIFICATIONS.md - Notification system deep dive
5. MISSION_6_USER_GUIDE.md - End-user documentation
6. MISSION_6_TESTING.md - Test scenarios and checklist
7. MISSION_6_DEPLOYMENT.md - Production deployment guide
8. MISSION_6_TROUBLESHOOTING.md - Common issues and solutions
9. MISSION_6_QUICK_REFERENCE.md - One-page cheat sheet
10. MISSION_6_INDEX.md - Documentation hub

---

## Quick Links

- [API Swagger Docs](http://localhost:8000/docs#/reminders)
- [Backend Code](./apps/api/routers/reminders.py)
- [Mobile Code](./apps/mobile/src/screens/CalendarScreen.tsx)
- [Database Models](./apps/api/models.py)

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Complete and Production-Ready