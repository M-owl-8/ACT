# Samurai Dark Theme Implementation Guide

## 🎨 Theme Update Summary

The mobile app has been updated with the **Samurai-Inspired Dark Theme** matching the web app's professional aesthetic.

### 🔴 Color Palette (Web App Theme)
```
Primary Background:   #0B0B0E (Deep black)
Card/Surface:         #111217 (Dark charcoal)
Text Primary:         #F4F4F5 (Light white)
Text Secondary:       #BDBDBD (Medium gray)
Accent Red:           #EF5350 (Samurai red)
Accent Green:         #66BB6A (Income green)
Border:               #1A1A1F (Dark border)
Orange (Neutral):     #FF9800 (Neutral expense type)
```

### ✅ Completed Updates

#### 1. **App.tsx - Splash Screen** ✨
- Added Japanese kanji header (行 - Gyō/Row)
- Red "ACT" text with samurai aesthetic
- Red divider line separator
- Japanese subtitle (財務管理 - Finance Management)
- Japanese night backdrop with samurai silhouettes
- Loading indicator in samurai red (#EF5350)

#### 2. **IncomeScreen.tsx** 
- Dark background (#0B0B0E)
- Dark card surfaces (#111217)
- Light text (#F4F4F5)
- Green totals indicator (#66BB6A) for income
- Red left border on cards (#EF5350)
- Green FAB button for adding income
- Samurai red refresh indicator

#### 3. **ExpensesScreen.tsx**
- Dark background (#0B0B0E)
- Dark card surfaces (#111217)
- Red header with bottom border
- Expense type segmented control with dark theme
- Red left border on cards (#EF5350)
- Red FAB button for adding expenses
- Samurai red refresh indicator

### ⏳ Remaining Screens to Update

The following screens need similar theme updates:

#### **MotivationScreen.tsx**
Key updates needed:
- Background: `#0B0B0E`
- Card background: `#111217`
- Text primary: `#F4F4F5`
- Streak cards: Light backgrounds with dark overlays
- Goal section: Dark cards with red accents
- Orange goal highlights: `#FF9800`

#### **ReportsScreen.tsx**
Key updates needed:
- Background: `#0B0B0E`
- Card backgrounds: `#111217`
- Chart text: `#F4F4F5`
- Stats cards: Dark with colored left borders
- Income (green): `#66BB6A`
- Expenses (red): `#EF5350`
- Balance (blue): Keep accent color

#### **CalendarScreen.tsx**
Key updates needed:
- Background: `#0B0B0E`
- Header: `#111217` with red bottom border
- Calendar cells: Dark with subtle borders
- Today indicator: Red highlight
- Reminder cards: Dark surfaces

#### **SettingsScreen.tsx**
Key updates needed:
- Background: `#0B0B0E`
- Section backgrounds: `#111217`
- Selector backgrounds: Dark
- Active selection: Red accent
- Toggle ON: Green (#66BB6A)

#### **ProfileScreen.tsx**
Key updates needed:
- Background: `#0B0B0E`
- User card: Dark with red accent
- Stats cards: Dark surfaces
- Account info: Dark sections
- Logout button: Red background

### 🎯 Update Pattern for Remaining Screens

For each remaining screen, follow this template:

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0E", // Dark background
  },
  header: {
    backgroundColor: "#111217", // Dark surface
    borderBottomWidth: 2,
    borderBottomColor: "#EF5350", // Red accent
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F4F4F5", // Light text
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#111217", // Dark surface
    borderLeftWidth: 3,
    borderLeftColor: "#EF5350", // Red accent
    borderRadius: 12,
  },
  text: {
    color: "#F4F4F5", // Light text for primary
  },
  textSecondary: {
    color: "#BDBDBD", // Medium gray for secondary
  },
  button: {
    backgroundColor: "#EF5350", // Red buttons
  },
  fab: {
    backgroundColor: "#EF5350", // Red FAB
  },
});
```

### 📊 Color Usage Guidelines

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Background | Deep Black | `#0B0B0E` | Main container |
| Card/Surface | Dark Gray | `#111217` | Cards, sections |
| Text Primary | Light White | `#F4F4F5` | Headings, important text |
| Text Secondary | Medium Gray | `#BDBDBD` | Descriptions, subtle text |
| Accent Red | Samurai Red | `#EF5350` | Headers, FAB, highlights |
| Income/Success | Green | `#66BB6A` | Positive indicators |
| Neutral | Orange | `#FF9800` | Neutral expense type |
| Error/Excess | Dark Red | `#D32F2F` | Errors, warnings |
| Border | Dark | `#1A1A1F` | Dividers, borders |

### 🔄 ActivityIndicator Colors

Update all ActivityIndicators to use:
- **Income/Success screens**: `#66BB6A`
- **Expense/Error screens**: `#EF5350`
- **Neutral/Loading**: `#EF5350`

### 📱 RefreshControl Colors

Update all RefreshControl components to use:
```typescript
<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}
  colors={["#EF5350"]}      // Android
  tintColor="#EF5350"        // iOS
/>
```

### 🎨 Additional Theme Elements

#### Shadow Styling (for depth)
```typescript
shadowColor: "#000",
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.3,
shadowRadius: 4,
elevation: 3,
```

#### Card Border Left (accent line)
```typescript
borderLeftWidth: 3,
borderLeftColor: "#EF5350", // or "#66BB6A" for income
```

#### Header Bottom Border (separator)
```typescript
borderBottomWidth: 2,
borderBottomColor: "#EF5350", // Red line separator
```

### 🚀 Implementation Steps

1. **For each remaining screen**:
   - Replace all `#fff` or `#FFFFFF` → `#0B0B0E` or `#111217`
   - Replace all light colors → `#F4F4F5` or `#BDBDBD`
   - Replace all green → `#66BB6A` (for income/success only)
   - Replace all red → `#EF5350` (primary accent)
   - Add red left borders to cards
   - Add red bottom borders to headers
   - Update ActivityIndicator colors
   - Update RefreshControl colors

2. **Test each screen**:
   - Verify text contrast (WCAG AA compliant)
   - Check that shadows are visible
   - Ensure red accents pop against dark background
   - Test on both iOS and Android

3. **Fine-tune**:
   - Adjust opacity for overlays if needed
   - Verify consistency across all screens
   - Test with different screen sizes

### 📄 Files Already Updated

✅ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\App.tsx`
✅ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\IncomeScreen.tsx`
✅ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\ExpensesScreen.tsx`
✅ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\theme\index.tsx`

### 📋 Files Pending Update

⏳ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\MotivationScreen.tsx`
⏳ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\ReportsScreen.tsx`
⏳ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\CalendarScreen.tsx`
⏳ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\SettingsScreen.tsx`
⏳ `c:\Users\user\Desktop\Bitway\Programs\act-gen1\apps\mobile\src\screens\ProfileScreen.tsx`
⏳ Modal/Dialog components
⏳ Navigation header styling

### 💡 Next Steps

1. Test the updated splash screen and Income/Expenses screens
2. Request to update remaining screens using this guide
3. Update themed components (buttons, inputs, modals)
4. Test the complete flow end-to-end

---

**Theme Version**: 1.0 - Samurai Dark Theme
**Last Updated**: 2024
**Status**: 60% Complete (3/5 main screens done)