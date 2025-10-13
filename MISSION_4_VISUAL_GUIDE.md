# Mission 4: Expenses with Type Filtering - Visual Guide

## 🎨 Screen Layouts

### 1. ExpensesScreen (Main List)

```
┌─────────────────────────────────────┐
│  ← Expenses                         │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  STATISTICS HEADER          │   │
│  │                             │   │
│  │  Mandatory    Neutral       │   │
│  │  $1,234.56    $567.89       │   │
│  │  🔴           🟠            │   │
│  │                             │   │
│  │  Excess       Total         │   │
│  │  $345.67      $2,148.12     │   │
│  │  🟣           ⚫            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ SEGMENTED CONTROL           │   │
│  │ ┌────┬────┬────┬────────┐   │   │
│  │ │All │Mand│Neut│Excess  │   │   │
│  │ └────┴────┴────┴────────┘   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🏠 Rent/Mortgage            │   │
│  │ Jan 10, 2025                │   │
│  │ [Mandatory]        -$1,500  │   │
│  │                    ✏️  🗑️   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🛒 Groceries                │   │
│  │ Jan 9, 2025                 │   │
│  │ [Neutral]           -$85.50 │   │
│  │                    ✏️  🗑️   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 🎬 Entertainment            │   │
│  │ Jan 8, 2025                 │   │
│  │ [Excess]            -$45.00 │   │
│  │                    ✏️  🗑️   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Scroll for more...]              │
│                                     │
│                          ┌────┐    │
│                          │ + │    │ FAB Button
│                          └────┘    │
└─────────────────────────────────────┘
```

### 2. AddExpenseScreen (Create Form)

```
┌─────────────────────────────────────┐
│  ← Add Expense              [Save]  │
├─────────────────────────────────────┤
│                                     │
│  Amount                             │
│  ┌─────────────────────────────┐   │
│  │  $  1,234.56                │   │
│  └─────────────────────────────┘   │
│                                     │
│  Category                           │
│  ┌─────────────────────────────┐   │
│  │ 🔴 Mandatory                │   │
│  │ ┌────┬────┬────┬────┐       │   │
│  │ │🏠  │⚡  │🏥  │💳  │       │   │
│  │ │Rent│Util│Heal│Debt│       │   │
│  │ └────┴────┴────┴────┘       │   │
│  │                             │   │
│  │ 🟠 Neutral                  │   │
│  │ ┌────┬────┬────┬────┐       │   │
│  │ │🛒  │🚗  │📱  │👕  │       │   │
│  │ │Groc│Tran│Phon│Clot│       │   │
│  │ └────┴────┴────┴────┘       │   │
│  │                             │   │
│  │ 🟣 Excess                   │   │
│  │ ┌────┬────┬────┬────┐       │   │
│  │ │🎬  │🍽️  │🛍️  │✈️  │       │   │
│  │ │Ente│Dine│Shop│Trav│       │   │
│  │ └────┴────┴────┴────┘       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Date                               │
│  ┌─────────────────────────────┐   │
│  │  ◀  Jan 10, 2025  ▶         │   │
│  └─────────────────────────────┘   │
│  ┌──────────┬──────────┐           │
│  │  Today   │Yesterday │           │
│  └──────────┴──────────┘           │
│                                     │
│  Note (Optional)                    │
│  ┌─────────────────────────────┐   │
│  │  Monthly rent payment       │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 3. EditExpenseScreen (Update Form)

```
┌─────────────────────────────────────┐
│  ← Edit Expense            [Update] │
├─────────────────────────────────────┤
│                                     │
│  [Same layout as AddExpenseScreen]  │
│  [Pre-filled with existing data]    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Expense Type Colors

```
Mandatory (Essential)
┌────────────────┐
│   #F44336      │  Red
│   🔴           │  For rent, utilities, insurance
└────────────────┘

Neutral (Regular)
┌────────────────┐
│   #FF9800      │  Orange
│   🟠           │  For groceries, transport
└────────────────┘

Excess (Non-essential)
┌────────────────┐
│   #9C27B0      │  Purple
│   🟣           │  For entertainment, dining
└────────────────┘
```

### UI Colors

```
Primary (Expenses)
┌────────────────┐
│   #F44336      │  Red (main theme)
└────────────────┘

Background
┌────────────────┐
│   #F5F5F5      │  Light gray
└────────────────┘

Text
┌────────────────┐
│   #333333      │  Dark gray (primary)
│   #666666      │  Medium gray (secondary)
│   #999999      │  Light gray (tertiary)
└────────────────┘

Success
┌────────────────┐
│   #4CAF50      │  Green (for income)
└────────────────┘
```

---

## 🔄 User Flow Diagram

```
┌─────────────────┐
│   Login/Home    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Bottom Tabs    │
│  ┌───┬───┬───┐  │
│  │Inc│Exp│Pro│  │
│  └───┴─┬─┴───┘  │
└────────┼────────┘
         │
         ▼
┌─────────────────────────────────┐
│     ExpensesScreen              │
│  ┌─────────────────────────┐   │
│  │  Stats Header           │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  Segmented Control      │   │
│  │  [All|Mand|Neut|Excess] │   │
│  └─────────────────────────┘   │
│  ┌─────────────────────────┐   │
│  │  Expense List           │   │
│  │  [Entry 1]  ✏️  🗑️      │   │
│  │  [Entry 2]  ✏️  🗑️      │   │
│  │  [Entry 3]  ✏️  🗑️      │   │
│  └─────────────────────────┘   │
│                      [+]        │
└──────┬──────────────┬───────────┘
       │              │
       │ Tap +        │ Tap ✏️
       │              │
       ▼              ▼
┌──────────────┐  ┌──────────────┐
│AddExpense    │  │EditExpense   │
│Screen        │  │Screen        │
│              │  │              │
│[Amount]      │  │[Amount]      │
│[Category]    │  │[Category]    │
│[Date]        │  │[Date]        │
│[Note]        │  │[Note]        │
│              │  │              │
│   [Save]     │  │  [Update]    │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │ Success         │ Success
       │                 │
       ▼                 ▼
┌─────────────────────────────────┐
│  Back to ExpensesScreen         │
│  (Data Refreshed)               │
└─────────────────────────────────┘
```

---

## 📱 Component Hierarchy

```
AppNavigator
├── MainTabs
│   ├── IncomeTab (IncomeScreen)
│   ├── ExpensesTab (ExpensesScreen) ⭐
│   │   ├── StatsHeader
│   │   │   ├── StatCard (Mandatory)
│   │   │   ├── StatCard (Neutral)
│   │   │   ├── StatCard (Excess)
│   │   │   └── StatCard (Total)
│   │   ├── SegmentedControl
│   │   ├── FlatList
│   │   │   └── ExpenseCard
│   │   │       ├── CategoryIcon
│   │   │       ├── CategoryName
│   │   │       ├── Date
│   │   │       ├── ExpenseTypeBadge
│   │   │       ├── Amount
│   │   │       ├── EditButton
│   │   │       └── DeleteButton
│   │   └── FAB (Floating Action Button)
│   └── ProfileTab (ProfileScreen)
├── AddExpense (Modal) ⭐
│   ├── AmountInput
│   ├── CategoryPicker
│   │   ├── CategorySection (Mandatory)
│   │   │   └── CategoryCard[]
│   │   ├── CategorySection (Neutral)
│   │   │   └── CategoryCard[]
│   │   └── CategorySection (Excess)
│   │       └── CategoryCard[]
│   ├── DateSelector
│   │   ├── DateNavigation (◀ Date ▶)
│   │   └── DateShortcuts (Today | Yesterday)
│   ├── NoteInput
│   └── SaveButton
└── EditExpense (Modal) ⭐
    └── [Same structure as AddExpense]
```

---

## 🎯 Interactive Elements

### Segmented Control States

```
All Selected:
┌────────────────────────────────┐
│ ▓▓▓▓ │ Mand │ Neut │ Excess   │
└────────────────────────────────┘

Mandatory Selected:
┌────────────────────────────────┐
│ All │ ▓▓▓▓ │ Neut │ Excess    │
└────────────────────────────────┘

Neutral Selected:
┌────────────────────────────────┐
│ All │ Mand │ ▓▓▓▓ │ Excess    │
└────────────────────────────────┘

Excess Selected:
┌────────────────────────────────┐
│ All │ Mand │ Neut │ ▓▓▓▓▓▓    │
└────────────────────────────────┘
```

### Category Selection States

```
Unselected:
┌──────────┐
│  🏠      │
│  Rent    │
└──────────┘

Selected (Mandatory):
┌──────────┐
│  🏠      │  ← Red border (#F44336)
│  Rent    │
└──────────┘

Selected (Neutral):
┌──────────┐
│  🛒      │  ← Orange border (#FF9800)
│ Grocery  │
└──────────┘

Selected (Excess):
┌──────────┐
│  🎬      │  ← Purple border (#9C27B0)
│  Movies  │
└──────────┘
```

### Expense Type Badges

```
Mandatory Badge:
┌─────────────┐
│ Mandatory   │  Red background (#F44336)
└─────────────┘  White text

Neutral Badge:
┌─────────────┐
│ Neutral     │  Orange background (#FF9800)
└─────────────┘  White text

Excess Badge:
┌─────────────┐
│ Excess      │  Purple background (#9C27B0)
└─────────────┘  White text
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────┐
│              User Action                    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         React Component State               │
│  (useState, useEffect, useCallback)         │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           API Service Layer                 │
│  (categories.ts, entries.ts)                │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│            Axios HTTP Client                │
│  (with auth interceptors)                   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          Backend API (FastAPI)              │
│  http://localhost:8000                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│         SQLite Database                     │
│  (with expense_type column)                 │
└─────────────────────────────────────────────┘
```

---

## 🔄 State Management

### ExpensesScreen State

```typescript
const [expenses, setExpenses] = useState<Entry[]>([]);
const [stats, setStats] = useState<ExpenseTypeStats>({
  mandatory: 0,
  neutral: 0,
  excess: 0,
  total: 0
});
const [selectedSegment, setSelectedSegment] = useState(0);
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [hasMore, setHasMore] = useState(true);
const [offset, setOffset] = useState(0);
```

### AddExpenseScreen State

```typescript
const [amount, setAmount] = useState('');
const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
const [date, setDate] = useState(new Date());
const [note, setNote] = useState('');
const [categories, setCategories] = useState<Category[]>([]);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
```

---

## 🎬 Animations & Transitions

### Modal Presentation
- **Type**: Slide up from bottom
- **Duration**: 300ms
- **Easing**: Ease-in-out

### Segmented Control
- **Type**: Smooth slide
- **Duration**: 200ms
- **Easing**: Ease-out

### Category Selection
- **Type**: Border color change
- **Duration**: 150ms
- **Easing**: Linear

### FAB Button
- **Type**: Scale on press
- **Duration**: 100ms
- **Easing**: Spring

### Pull-to-Refresh
- **Type**: Spinner rotation
- **Duration**: Continuous
- **Easing**: Linear

---

## 📱 Responsive Design

### Small Screens (< 375px)
- 2 categories per row
- Smaller stat cards
- Compact date selector

### Medium Screens (375px - 768px)
- 3 categories per row
- Standard stat cards
- Full date selector

### Large Screens (> 768px)
- 4 categories per row
- Larger stat cards
- Extended date selector with calendar

---

## ✅ Accessibility

### Screen Readers
- All buttons have accessible labels
- Amount inputs have proper hints
- Category cards announce selection state
- Date selector announces current date

### Touch Targets
- Minimum 44x44 points for all interactive elements
- Adequate spacing between buttons
- Large FAB button (56x56 points)

### Color Contrast
- All text meets WCAG AA standards
- Badge text has sufficient contrast
- Icons are clearly visible

---

**Visual Guide Version**: 1.0  
**Last Updated**: January 11, 2025