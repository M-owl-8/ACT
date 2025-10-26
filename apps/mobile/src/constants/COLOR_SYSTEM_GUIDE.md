# Color System Implementation Guide

## Overview
This app implements a **three-tier expense type color system** that is used consistently across all screens showing breakdowns, statistics, and progress tracking.

## Color Scheme

### Expense Type Colors (Global Standard)
These colors are used whenever showing expense breakdowns, spending categories, or financial progress:

```
🔵 MANDATORY (Blue)   = #2196F3  - Required/Essential spending
🟡 NEUTRAL (Gold)     = #FFC107  - Normal/Acceptable spending
🔴 EXCESS (Red)       = #FF6B6B  - Overspending/Warning
```

## Implementation Examples

### 1. Reports Screen (Expense Breakdown)
Location: `src/screens/ReportsScreen.tsx`

Shows a stacked bar chart with all three categories:
- Mandatory expenses (Blue)
- Neutral expenses (Gold)
- Excess expenses (Red)

Visual representation matches legend colors exactly.

### 2. Books Screen (Reading Progress Breakdown)
Location: `src/screens/BooksScreen.tsx`

Uses the same color system for reading progress:
- **Completed Books** (Blue = Mandatory/Required reading)
- **In Progress Books** (Gold = Normal reading pace)
- **Not Started Books** (Red = Falling behind/Excess backlog)

Stacked bar chart with legend showing counts and status.

### 3. Using Colors in Your Components

#### Import the Constants:
```typescript
import { ExpenseTypeColors } from '../constants/colors';
```

#### In StyleSheet:
```typescript
const styles = StyleSheet.create({
  mandatoryBar: {
    backgroundColor: ExpenseTypeColors.MANDATORY,
  },
  neutralBar: {
    backgroundColor: ExpenseTypeColors.NEUTRAL,
  },
  excessBar: {
    backgroundColor: ExpenseTypeColors.EXCESS,
  },
});
```

#### Inline Styles:
```jsx
<View style={{ backgroundColor: ExpenseTypeColors.MANDATORY }} />
```

#### Legend Dots:
```jsx
<View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.EXCESS }]} />
```

## Available Color Constants

### `src/constants/colors.ts`

```typescript
export const ExpenseTypeColors = {
  MANDATORY: '#2196F3',  // Blue
  NEUTRAL: '#FFC107',    // Gold
  EXCESS: '#FF6B6B',     // Red
};

export const StatusColors = {
  SUCCESS: '#4CAF50',    // Green
  WARNING: '#FF9800',    // Orange
  ERROR: '#F44336',      // Red
};

export const BookStatusColors = {
  COMPLETED: '#000',     // Black
  IN_PROGRESS: '#000',   // Black
  NOT_STARTED: '#999',   // Gray
};

export const BackgroundColors = {
  PRIMARY: '#f8f8f8',    // Light gray
  CARD: '#fff',          // White
  BORDER: '#ddd',        // Light gray borders
};

export const TextColors = {
  PRIMARY: '#000',       // Black
  SECONDARY: '#666',     // Dark gray
  MUTED: '#999',         // Light gray
};
```

## Screens Currently Using This System

✅ **ReportsScreen.tsx** - Expense breakdown with stacked bars  
✅ **BooksScreen.tsx** - Reading progress breakdown with stacked bars

## Where to Add This System

Future implementations should apply this color system to:
- Dashboard progress charts
- Category breakdowns
- Budget vs actual spending
- Goal tracking visualizations
- Any multi-tier categorical display

## Design Pattern: Stacked Bar Charts

When showing multiple categories in a single bar:

1. **Order**: Mandatory → Neutral → Excess (left to right)
2. **Height**: 32-40px for touch-friendly interaction
3. **Radius**: 8px border radius for modern appearance
4. **Legend**: Include below bar with color dots and values
5. **Responsive**: Use percentage width for each segment

### Example Implementation:
```jsx
<View style={styles.stackedBar}>
  {/* Mandatory segment */}
  <View style={{
    width: `${(mandatory / total) * 100}%`,
    backgroundColor: ExpenseTypeColors.MANDATORY,
  }} />
  
  {/* Neutral segment */}
  <View style={{
    width: `${(neutral / total) * 100}%`,
    backgroundColor: ExpenseTypeColors.NEUTRAL,
  }} />
  
  {/* Excess segment */}
  <View style={{
    width: `${(excess / total) * 100}%`,
    backgroundColor: ExpenseTypeColors.EXCESS,
  }} />
</View>
```

## Color Accessibility

- All colors meet WCAG AA contrast requirements
- Blue and Red are distinguishable for colorblind users
- Gold provides clear visual separation
- Avoid relying solely on color; use icons/labels

## Future Updates

If colors need adjustment:
1. Update `src/constants/colors.ts`
2. All importing screens automatically get new colors
3. No manual updates needed in individual screens

---
**Last Updated**: 2024  
**Implemented In**: ReportsScreen, BooksScreen  
**Status**: Ready for expansion to other screens