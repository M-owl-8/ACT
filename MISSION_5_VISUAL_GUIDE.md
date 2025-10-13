# 🎨 Mission 5: Reports - Visual Guide

## 📱 Screen Layout

```
┌─────────────────────────────────────┐
│  Reports                    ↻       │  ← Header with refresh
├─────────────────────────────────────┤
│ Daily Weekly 15d Monthly Last3m     │  ← Tab navigation
│              ────────               │  ← Active tab underline
├─────────────────────────────────────┤
│  📅 Jan 15 - Feb 15                 │  ← Date range
├─────────────────────────────────────┤
│                                     │
│  ⚠️ Excess Spending Alert           │  ← Alert banner (conditional)
│  Your excess spending ($1,200)      │
│  exceeds 50% of mandatory ($2,000)  │
│                                     │
├─────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐      │
│  │ ↓ 💚      │  │ ↑ ❤️      │      │  ← Summary cards
│  │ Income    │  │ Expenses  │      │
│  │ $5,000.00 │  │ $3,500.00 │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ ↗ 💙                        │   │
│  │ Net Balance                 │   │
│  │ $1,500.00                   │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  Expense Breakdown                  │
│                                     │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░   │  ← Bar chart
│  🔵 Mandatory      $2,000.00        │  ← Legend
│  🟡 Neutral        $800.00          │
│  🔴 Excess         $700.00          │
│                                     │
├─────────────────────────────────────┤
│  Top Spending Categories            │
│                                     │
│  ① 🏠 Rent                          │
│     1 transaction        $1,200.00  │
│                                     │
│  ② 🛒 Groceries                     │
│     5 transactions       $400.00    │
│                                     │
│  ③ 🎬 Entertainment                 │
│     3 transactions       $300.00    │
│                                     │
│  ④ 🚗 Transport                     │
│     4 transactions       $200.00    │
│                                     │
│  ⑤ ⚡ Utilities                     │
│     2 transactions       $150.00    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Summary Cards
- **Income Card**: 
  - Border: Green (#4CAF50)
  - Icon: Green down arrow (money coming in)
  - Amount: Black text

- **Expense Card**:
  - Border: Red (#FF6B6B)
  - Icon: Red up arrow (money going out)
  - Amount: Black text

- **Net Balance Card**:
  - Border: Blue (#2196F3)
  - Icon: Green ↗ (positive) or Red ↘ (negative)
  - Amount: Green (positive) or Red (negative)

### Expense Types
- **Mandatory**: Blue (#2196F3) 🔵
- **Neutral**: Yellow (#FFC107) 🟡
- **Excess**: Red (#FF6B6B) 🔴

### Alert Banner
- **Background**: Light yellow (#FFF3CD)
- **Border**: Red left border (#FF6B6B)
- **Text**: Dark yellow (#856404)
- **Icon**: Red warning icon

---

## 📊 Component Breakdown

### 1. Header
```
┌─────────────────────────────────────┐
│  Reports                    ↻       │
└─────────────────────────────────────┘
```
- **Left**: "Reports" title (bold, 24px)
- **Right**: Refresh icon (↻)
- **Background**: White
- **Border**: Bottom border (light gray)

### 2. Tab Navigation
```
┌─────────────────────────────────────┐
│ Daily Weekly 15d Monthly Last3m     │
│              ────────               │
└─────────────────────────────────────┘
```
- **Tabs**: Horizontal scrollable
- **Active**: Green underline (3px)
- **Inactive**: Gray text
- **Active**: Green bold text
- **Background**: White

### 3. Date Range
```
┌─────────────────────────────────────┐
│  📅 Jan 15 - Feb 15                 │
└─────────────────────────────────────┘
```
- **Icon**: Calendar icon
- **Text**: Date range (small, gray)
- **Centered**: Horizontally centered
- **Background**: White

### 4. Alert Banner (Conditional)
```
┌─────────────────────────────────────┐
│  ⚠️ Excess Spending Alert           │
│  Your excess spending ($1,200.00)   │
│  exceeds 50% of mandatory ($2,000)  │
└─────────────────────────────────────┘
```
- **Visibility**: Only when excess > 50% mandatory
- **Background**: Light yellow (#FFF3CD)
- **Border**: Red left border (4px)
- **Icon**: Warning icon (⚠️)
- **Title**: Bold, dark yellow
- **Message**: Regular, dark yellow
- **Padding**: 16px
- **Margin**: 16px

### 5. Summary Cards
```
┌───────────┐  ┌───────────┐
│ ↓ 💚      │  │ ↑ ❤️      │
│ Income    │  │ Expenses  │
│ $5,000.00 │  │ $3,500.00 │
└───────────┘  └───────────┘

┌─────────────────────────────┐
│ ↗ 💙                        │
│ Net Balance                 │
│ $1,500.00                   │
└─────────────────────────────┘
```
- **Layout**: 2 cards per row, 3rd card full width
- **Icon**: 32px, centered
- **Label**: 14px, gray, centered
- **Amount**: 24px, bold, centered
- **Background**: White
- **Shadow**: Subtle shadow
- **Border**: Top border (3px, colored)
- **Padding**: 16px
- **Margin**: 12px gap

### 6. Expense Breakdown
```
┌─────────────────────────────────────┐
│  Expense Breakdown                  │
│                                     │
│  ████████░░░░░░░░░░░░░░░░░░░░░░░   │
│  🔵 Mandatory      $2,000.00        │
│  🟡 Neutral        $800.00          │
│  🔴 Excess         $700.00          │
└─────────────────────────────────────┘
```
- **Title**: 18px, bold
- **Bar Chart**: 
  - Height: 40px
  - Segments: Proportional to amounts
  - Colors: Blue, Yellow, Red
  - Rounded corners
- **Legend**:
  - Dot: 12px circle
  - Label: 14px, gray
  - Amount: 14px, bold, right-aligned
  - Gap: 8px between items
- **Background**: White card
- **Padding**: 16px
- **Shadow**: Subtle shadow

### 7. Top Categories
```
┌─────────────────────────────────────┐
│  Top Spending Categories            │
│                                     │
│  ① 🏠 Rent                          │
│     1 transaction        $1,200.00  │
│                                     │
│  ② 🛒 Groceries                     │
│     5 transactions       $400.00    │
└─────────────────────────────────────┘
```
- **Title**: 18px, bold
- **Rank Badge**:
  - Circle: 32px diameter
  - Background: Green (#4CAF50)
  - Number: White, bold, centered
- **Category**:
  - Icon: 20px emoji
  - Name: 16px, bold
  - Count: 12px, gray, below name
- **Amount**: 16px, bold, right-aligned
- **Divider**: Light gray line between items
- **Background**: White card
- **Padding**: 16px
- **Shadow**: Subtle shadow

---

## 🎭 States & Interactions

### Loading State
```
┌─────────────────────────────────────┐
│                                     │
│           ⏳                        │
│      Loading report...              │
│                                     │
└─────────────────────────────────────┘
```
- **Spinner**: Centered, green
- **Text**: "Loading report..." below spinner
- **Background**: Light gray

### Empty State
```
┌─────────────────────────────────────┐
│  Top Spending Categories            │
│                                     │
│  No spending data available         │
│                                     │
└─────────────────────────────────────┘
```
- **Text**: Centered, gray
- **Message**: "No spending data available"

### Error State
```
┌─────────────────────────────────────┐
│  ❌ Failed to load report data      │
│                                     │
│  [Retry Button]                     │
└─────────────────────────────────────┘
```
- **Icon**: Red X
- **Message**: Error description
- **Button**: Retry button

---

## 📐 Dimensions & Spacing

### Screen
- **Width**: Full screen width
- **Background**: Light gray (#F5F5F5)

### Header
- **Height**: 60px
- **Padding**: 20px horizontal, 16px vertical

### Tabs
- **Height**: 48px
- **Padding**: 20px horizontal, 12px vertical per tab
- **Gap**: 4px between tabs

### Cards
- **Min Width**: (screen width - 48px) / 2
- **Border Radius**: 12px
- **Padding**: 16px
- **Gap**: 12px

### Sections
- **Margin**: 16px horizontal, 16px bottom
- **Border Radius**: 12px
- **Padding**: 16px

---

## 🎬 Animations & Transitions

### Tab Switch
- **Duration**: 200ms
- **Easing**: Ease-in-out
- **Effect**: Fade in new data

### Card Appearance
- **Duration**: 300ms
- **Easing**: Spring
- **Effect**: Slide up + fade in

### Bar Chart
- **Duration**: 500ms
- **Easing**: Ease-out
- **Effect**: Width animation from 0 to final

### Alert Banner
- **Duration**: 300ms
- **Easing**: Ease-in-out
- **Effect**: Slide down from top

---

## 📱 Responsive Behavior

### Small Screens (< 375px)
- Summary cards: Stack vertically
- Tabs: Horizontal scroll
- Font sizes: Slightly reduced

### Medium Screens (375px - 768px)
- Summary cards: 2 per row + 1 full width
- Tabs: All visible
- Standard font sizes

### Large Screens (> 768px)
- Summary cards: 3 per row
- Tabs: All visible with extra spacing
- Larger font sizes

---

## 🎨 Typography

### Font Family
- **Primary**: System default (San Francisco on iOS, Roboto on Android)

### Font Sizes
- **Header Title**: 24px, bold
- **Section Title**: 18px, bold
- **Tab Text**: 14px, medium (active: bold)
- **Summary Label**: 14px, regular
- **Summary Amount**: 24px, bold
- **Legend Text**: 14px, regular
- **Legend Amount**: 14px, semi-bold
- **Category Name**: 16px, semi-bold
- **Category Count**: 12px, regular
- **Category Amount**: 16px, bold
- **Date Range**: 12px, regular
- **Alert Title**: 16px, bold
- **Alert Message**: 14px, regular

### Font Colors
- **Primary Text**: #333333
- **Secondary Text**: #666666
- **Tertiary Text**: #999999
- **Success**: #4CAF50
- **Error**: #FF6B6B
- **Warning**: #856404
- **Info**: #2196F3

---

## 🖼️ Example Scenarios

### Scenario 1: Healthy Finances
```
Income:    $5,000.00  💚
Expenses:  $2,500.00  ❤️
Net:       $2,500.00  💙 (green)

Breakdown:
🔵 Mandatory: $1,500 (60%)
🟡 Neutral:   $700 (28%)
🔴 Excess:    $300 (12%)

Alert: ❌ No alert (excess < 50% mandatory)
```

### Scenario 2: Overspending
```
Income:    $3,000.00  💚
Expenses:  $3,500.00  ❤️
Net:       -$500.00   💙 (red)

Breakdown:
🔵 Mandatory: $1,500 (43%)
🟡 Neutral:   $800 (23%)
🔴 Excess:    $1,200 (34%)

Alert: ⚠️ ALERT! (excess > 50% mandatory)
```

### Scenario 3: No Data
```
Income:    $0.00  💚
Expenses:  $0.00  ❤️
Net:       $0.00  💙

Breakdown:
🔵 Mandatory: $0.00
🟡 Neutral:   $0.00
🔴 Excess:    $0.00

Top Categories: "No spending data available"
```

---

## ✨ Polish & Details

### Shadows
- **Cards**: 
  - Color: rgba(0, 0, 0, 0.1)
  - Offset: 0px 2px
  - Blur: 4px
  - Elevation: 3 (Android)

### Borders
- **Card Top Border**: 3px solid
- **Alert Left Border**: 4px solid
- **Section Dividers**: 1px solid #E0E0E0

### Icons
- **Size**: 24px (header), 32px (cards), 20px (categories)
- **Color**: Contextual (green, red, blue, gray)
- **Library**: Ionicons

### Touch Targets
- **Minimum**: 44px × 44px
- **Tabs**: Full height (48px)
- **Refresh Button**: 44px × 44px

---

## 🎯 Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Minimum contrast ratio: 4.5:1

### Touch Targets
- All interactive elements ≥ 44px
- Adequate spacing between targets

### Screen Readers
- Meaningful labels for all elements
- Proper heading hierarchy
- Descriptive button labels

### Visual Feedback
- Active states for tabs
- Loading indicators
- Error messages

---

## 🎉 Final Result

A beautiful, intuitive, and informative Reports screen that helps users:
- ✅ Understand their financial situation at a glance
- ✅ Track spending across different time periods
- ✅ Identify areas for improvement
- ✅ Get alerted to overspending
- ✅ Make informed financial decisions

**Mission 5 Visual Design: Complete! 🎨**