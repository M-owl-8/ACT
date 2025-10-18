# ⚡ Quick Theme Update Guide for Remaining Screens

## 🎯 One-Minute Setup for Each Screen

This guide helps you quickly update the remaining screens to match the samurai dark theme.

---

## 🔍 Color Replacement Cheat Sheet

Copy and paste these replacements in Find & Replace:

### Find & Replace (All Screens)

| Find | Replace | Context |
|------|---------|---------|
| `#f5f5f5` | `#0B0B0E` | Light background |
| `#FFFFFF` | `#111217` | White card/surface |
| `#fff` | `#111217` | White shorthand |
| `#333` | `#F4F4F5` | Dark text |
| `#666` | `#BDBDBD` | Medium text |
| `#999` | `#757575` | Light text |
| `#ccc` | `#424242` | Border color |
| `#4CAF50` | `#66BB6A` | Green (income) |
| `#F44336` | `#EF5350` | Red (expense) |
| `#007AFF` | `#EF5350` | Blue button → Red button |
| `#FF3B30` | `#EF5350` | iOS red → Samurai red |

---

## 📝 Template for Each Screen

Use this exact template when updating `StyleSheet.create()`:

```typescript
const styles = StyleSheet.create({
  // BACKGROUND
  container: {
    flex: 1,
    backgroundColor: "#0B0B0E",
  },
  
  // HEADER WITH RED BORDER
  header: {
    backgroundColor: "#111217",
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#EF5350",
  },
  
  // HEADER TITLE
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F4F4F5",
    letterSpacing: 1,
  },
  
  // CARD WITH RED LEFT BORDER
  card: {
    backgroundColor: "#111217",
    borderLeftWidth: 3,
    borderLeftColor: "#EF5350",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // TEXT
  text: {
    color: "#F4F4F5",
  },
  textSecondary: {
    color: "#BDBDBD",
  },
  textTertiary: {
    color: "#757575",
  },
  
  // BUTTONS
  button: {
    backgroundColor: "#EF5350",
    borderRadius: 8,
    padding: 12,
  },
  buttonText: {
    color: "#F4F4F5",
    fontWeight: "600",
  },
  
  // FAB (FLOATING ACTION BUTTON)
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EF5350",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
});
```

---

## 🎬 Screen-by-Screen Updates

### **1️⃣ MotivationScreen.tsx**

**Key Changes**:
1. Background: `#0B0B0E`
2. Streak cards: Dark with light text
3. Goal cards: Dark surfaces
4. Flame emoji: Orange (#FF9800) for visual accent
5. Trophy: Yellow/Gold (#FFD700)
6. Activity indicator: `color="#EF5350"`

**Quick Edits**:
```typescript
// Find these
const lightColors = {
  background: "#FFFBF7",
  surface: "#FFFFFF",
  textPrimary: "#0B0B0B",
  sumi: "#1B1B1B",
  accent: "#B71C1C",
};

// Replace with
const darkColors = {
  background: "#0B0B0E",
  surface: "#111217",
  textPrimary: "#F4F4F5",
  sumi: "#ECECEC",
  accent: "#EF5350",
};
```

---

### **2️⃣ ReportsScreen.tsx**

**Key Changes**:
1. Background: `#0B0B0E`
2. Header: `#111217` with red bottom border
3. Stat cards: Dark with colored left borders
   - Income green: `#66BB6A`
   - Expenses red: `#EF5350`
   - Balance: `#2196F3` (blue)
4. Charts: Light text (#F4F4F5)
5. Export button: Red (#EF5350)

**Chart Colors**:
```typescript
// Update these in chart components
const chartColors = {
  income: "#66BB6A",      // Green line
  expense: "#EF5350",     // Red line
  balance: "#2196F3",     // Blue line
  text: "#F4F4F5",        // Light text
};
```

---

### **3️⃣ CalendarScreen.tsx**

**Key Changes**:
1. Background: `#0B0B0E`
2. Header: `#111217` with red bottom border
3. Calendar grid: Dark cells
4. Today date: Red highlight (#EF5350)
5. Selected dates: Red background
6. Reminder cards: Dark surfaces with red accents
7. No upcoming reminders: Gray text (#757575)

**Calendar Styling**:
```typescript
// Replace color constants
todayIndicatorColor: "#EF5350",
selectedDateBgColor: "rgba(239, 83, 80, 0.2)",
selectedDateBorderColor: "#EF5350",
cellTextColor: "#F4F4F5",
headerTextColor: "#BDBDBD",
```

---

### **4️⃣ SettingsScreen.tsx**

**Key Changes**:
1. Background: `#0B0B0E`
2. Header: `#111217` with red bottom border
3. Section backgrounds: `#111217`
4. Selector items: Dark with red active state
5. Toggle ON color: `#66BB6A` (green)
6. Toggle OFF color: `#424242` (gray)
7. Dropdown backgrounds: Dark
8. Labels: Light text (#F4F4F5)

**Settings Patterns**:
```typescript
// Currency/Language selector
selector: {
  backgroundColor: "#111217",
  borderRadius: 8,
  padding: 12,
},
selectorActive: {
  backgroundColor: "rgba(239, 83, 80, 0.15)",
  borderLeftColor: "#EF5350",
  borderLeftWidth: 3,
},

// Toggle switch
toggleOn: "#66BB6A",
toggleOff: "#424242",
```

---

### **5️⃣ Additional Dialogs & Modals**

**Add/Edit Income Modal**:
```typescript
// Update these
modalBackground: "rgba(0, 0, 0, 0.8)",
modalContent: "#111217",
inputField: "#0B0B0E",
saveButton: "#66BB6A",
cancelButton: "#EF5350",
```

**Add/Edit Expense Modal**:
```typescript
modalBackground: "rgba(0, 0, 0, 0.8)",
modalContent: "#111217",
inputField: "#0B0B0E",
saveButton: "#EF5350",
cancelButton: "#757575",
```

---

## 🔧 Implementation Steps (Per File)

### Step 1: Open the file in VSCode

### Step 2: Use Find & Replace (Ctrl+H)

Use the cheat sheet above to replace colors

### Step 3: Update StyleSheet.create()

Copy the template and adapt for your screen

### Step 4: Test on Device/Simulator

```bash
npm start
# Select iOS or Android
```

### Step 5: Verify Contrast

- Text on background should be readable
- Buttons should stand out
- Borders should be visible

---

## 🎨 Color Decision Tree

When styling a new element, ask:

```
Is this a BACKGROUND?
  ├─ Main screen bg?    → #0B0B0E
  ├─ Card/surface?      → #111217
  └─ Overlay?           → rgba(0,0,0,0.7)

Is this TEXT?
  ├─ Heading/primary?   → #F4F4F5
  ├─ Description?       → #BDBDBD
  └─ Disabled/subtle?   → #757575

Is this a BUTTON?
  ├─ Primary action?    → #EF5350
  ├─ Success/income?    → #66BB6A
  └─ Secondary?         → #757575

Is this a BORDER?
  ├─ Left/accent?       → #EF5350
  ├─ Bottom/header?     → #EF5350
  └─ Regular border?    → #1A1A1F

Is this an INDICATOR?
  ├─ Loading spinner?   → #EF5350
  ├─ Success?           → #66BB6A
  └─ Activity?          → #EF5350
```

---

## ✅ Checklist for Each Screen

- [ ] All light backgrounds → `#0B0B0E`
- [ ] All white surfaces → `#111217`
- [ ] All dark text → `#F4F4F5`
- [ ] All medium text → `#BDBDBD`
- [ ] All green → `#66BB6A`
- [ ] All bright red → `#EF5350`
- [ ] Header has red bottom border
- [ ] Cards have red left border
- [ ] FAB is red with shadow
- [ ] Activity indicators are red
- [ ] Text has good contrast
- [ ] Shadows are visible
- [ ] Tested on device
- [ ] No light theme remnants

---

## 🚀 Priority Order

1. **MotivationScreen** (Simplest - mostly text)
2. **SettingsScreen** (Toggle/selector colors)
3. **CalendarScreen** (Calendar grid styling)
4. **ReportsScreen** (Chart colors)
5. **Dialogs & Modals** (Modal styling)

---

## 💡 Pro Tips

### Tip 1: Search for Old Colors
```bash
Search: #fff|#FFF|#FFFFFF|#ffffff|white
Search: #333|#333333|#0B0B0B|black
```

### Tip 2: Test with Print Styles
Use VSCode theme or DevTools to verify contrast

### Tip 3: Use Color Constants
```typescript
const COLORS = {
  background: "#0B0B0E",
  surface: "#111217",
  text: "#F4F4F5",
  accent: "#EF5350",
};

// Then use
backgroundColor: COLORS.background
```

### Tip 4: Keep Shadows
Dark backgrounds need shadows to show depth!

### Tip 5: Test Accessibility
- Use WCAG AA contrast checker
- Target ratio: 4.5:1 for text

---

## 📊 Color Density Guide

```
BACKGROUNDS (Darkest)
├─ #0B0B0E ████ (Primary bg)
├─ #111217 ████ (Card bg)
├─ #1A1A1F ████ (Border)
├─ #424242 ███
├─ #757575 ██
└─ #BDBDBD █ (Lightest text)

ACCENTS
├─ #EF5350 ███ (Red primary)
├─ #66BB6A ███ (Green income)
├─ #FF9800 ███ (Orange neutral)
└─ #2196F3 ███ (Blue info)
```

---

## 🎯 Expected Result

After updating all screens, your app should:
- ✨ Have consistent dark theme everywhere
- ✨ Show red accents on headers and borders
- ✨ Display light text on dark backgrounds
- ✨ Have colored cards (red/green) for different data types
- ✨ Look professional and premium
- ✨ Match your web app design

---

## 📞 Questions?

Refer to:
- **SAMURAI_COLORS.ts** - Complete color palette
- **IncomeScreen.tsx** - Reference implementation
- **ProfileScreen.tsx** - Settings screen reference
- **SAMURAI_THEME_UPDATE.md** - Detailed guide

---

**Keep this file handy while updating screens!** 🚀