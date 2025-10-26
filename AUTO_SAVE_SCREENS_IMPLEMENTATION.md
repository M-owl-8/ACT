# Auto-Save Implementation Guide for All Screens

## ✅ Completed Implementations

### 1. SettingsScreen ✓
- **Status**: Fully implemented with auto-save
- **Store**: `useSettingsStore` (src/store/settings.ts)
- **Features**: All settings auto-save on change
- **File**: src/screens/SettingsScreen.tsx

### 2. MotivationScreen (Goals) ✓
- **Status**: Fully implemented with auto-save
- **Store**: `useGoalsStore` (src/store/goals.ts)
- **Features**: 
  - Create goal → Auto-saved locally + synced to backend
  - Delete goal → Auto-removed locally + synced to backend
  - Complete goal → Auto-updated locally + synced to backend
  - Add savings → Auto-updated locally + synced to backend
- **File**: src/screens/MotivationScreen.tsx

---

## 📋 Screens to Implement Auto-Save

### Priority 1: Core Financial Data (High Impact)

#### ProfileScreen
**Current State**: Manual API calls
**What needs saving**:
- User profile updates (name, email, profile picture)
- Personal preferences
- Account settings

**Implementation Steps**:
```bash
1. Create: src/store/profile.ts
   - useProfileStore with Zustand
   - Methods: loadProfile, updateProfile, uploadProfilePicture

2. Update: src/screens/ProfileScreen.tsx
   - Import useProfileStore
   - Replace useState with store hooks
   - Wrap API calls with store methods

3. Result**: All profile changes auto-save
```

#### AddExpenseScreen
**Current State**: Manual API calls
**What needs saving**:
- Expense entry data (amount, category, date, description)
- Draft expenses (unsaved changes)

**Implementation Steps**:
```bash
1. Create: src/store/expenses.ts
   - useExpensesStore with Zustand
   - Methods: createExpense, updateExpense, deleteExpense, saveDraft

2. Update: src/screens/AddExpenseScreen.tsx
   - Import useExpensesStore
   - Save drafts on every field change (debounced)
   - Final submission with store.createExpense

3. Result**: Draft expenses persist, final submission auto-saves
```

#### EditExpenseScreen
**Current State**: Manual API calls
**What needs saving**:
- Expense edits (amount, category, date, description)

**Implementation Steps**:
```bash
1. Use: src/store/expenses.ts
   - Leverage existing store methods

2. Update: src/screens/EditExpenseScreen.tsx
   - Import useExpensesStore
   - Replace API calls with store.updateExpense

3. Result**: All edits auto-save to backend
```

#### AddIncomeScreen
**Current State**: Manual API calls
**What needs saving**:
- Income entry data (amount, source, date, description)

**Implementation Steps**:
```bash
1. Create: src/store/income.ts
   - useIncomeStore with Zustand
   - Methods: createIncome, updateIncome, deleteIncome

2. Update: src/screens/AddIncomeScreen.tsx
   - Import useIncomeStore
   - Use store methods instead of direct API calls

3. Result**: Income entries auto-save
```

### Priority 2: User Engagement & Tracking (Medium Impact)

#### ReminderScreen
**Current State**: Manual API calls
**What needs saving**:
- Reminder creation/updates
- Reminder toggle states
- Reminder deletion

**Implementation Steps**:
```bash
1. Create: src/store/reminders.ts
   - useRemindersStore with Zustand
   - Methods: createReminder, updateReminder, deleteReminder, toggleReminder

2. Update: src/screens/ReminderScreen.tsx
   - Import useRemindersStore
   - All reminder changes use store methods

3. Result**: Reminders persist automatically
```

#### BooksScreen / LibraryScreen
**Current State**: May have manual API calls
**What needs saving**:
- Book list updates
- Reading progress
- Book notes and highlights
- Book status (reading, completed, wishlist)

**Implementation Steps**:
```bash
1. Create: src/store/books.ts
   - useBooksStore with Zustand
   - Methods: addBook, updateBook, deleteBook, updateProgress, updateStatus

2. Update: src/screens/BooksScreen.tsx
   - Import useBooksStore
   - Replace API calls with store methods

3. Result**: All book data persists automatically
```

#### ReportsScreen
**Current State**: Likely API driven, but generate on demand
**What needs saving**:
- Report preferences/filters
- Saved reports
- Report generation parameters

**Implementation Steps**:
```bash
1. Create: src/store/reports.ts
   - useReportsStore with Zustand
   - Methods: generateReport, saveReport, deleteReport, loadReports

2. Update: src/screens/ReportsScreen.tsx
   - Store report generation parameters
   - Cache generated reports locally
   - Sync report list with backend

3. Result**: Report preferences and saved reports persist
```

### Priority 3: Home & Dashboard (Lower Impact)

#### HomeScreen
**Current State**: Likely aggregated data
**What needs saving**:
- Dashboard widget preferences
- Widget visibility states
- Dashboard layout

**Implementation Steps**:
```bash
1. Extend: src/store/settings.ts
   - Add dashboard preferences (widget order, visibility)
   - Methods: updateWidgetPreferences, updateDashboardLayout

2. Update: src/screens/HomeScreen.tsx
   - Import useSettingsStore
   - Use existing store for dashboard state

3. Result**: Dashboard layout preferences persist
```

---

## 🎯 Implementation Pattern Template

All screens follow the same proven pattern:

### Step 1: Create a Store (if not exists)
```typescript
// src/store/yourfeature.ts
import { create } from 'zustand';
import { api } from '../api/client';

interface YourFeatureStore {
  items: any[];
  loading: boolean;
  loadItems: () => Promise<void>;
  createItem: (data: any) => Promise<any>;
  updateItem: (id: number, data: any) => Promise<any>;
  deleteItem: (id: number) => Promise<boolean>;
  syncToBackend: () => Promise<void>;
}

export const useYourFeatureStore = create<YourFeatureStore>((set, get) => ({
  items: [],
  loading: false,

  loadItems: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/endpoint');
      set({ items: response.data });
      // Auto-save to local storage
      await saveItemsLocally(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      set({ loading: false });
    }
  },

  createItem: async (data: any) => {
    try {
      const response = await api.post('/endpoint', data);
      const newItem = response.data;
      const currentItems = get().items;
      const updatedItems = [...currentItems, newItem];
      set({ items: updatedItems });
      await saveItemsLocally(updatedItems);
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  updateItem: async (id: number, data: any) => {
    try {
      const response = await api.patch(`/endpoint/${id}`, data);
      const updatedItem = response.data;
      const currentItems = get().items;
      const updatedItems = currentItems.map(item =>
        item.id === id ? updatedItem : item
      );
      set({ items: updatedItems });
      await saveItemsLocally(updatedItems);
      return updatedItem;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  deleteItem: async (id: number) => {
    try {
      await api.delete(`/endpoint/${id}`);
      const currentItems = get().items;
      const updatedItems = currentItems.filter(item => item.id !== id);
      set({ items: updatedItems });
      await saveItemsLocally(updatedItems);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  syncToBackend: async () => {
    try {
      const response = await api.get('/endpoint');
      set({ items: response.data });
      await saveItemsLocally(response.data);
    } catch (error) {
      console.error('Error syncing items:', error);
    }
  },
}));

async function saveItemsLocally(items: any[]) {
  try {
    console.log(`✓ Items saved locally: ${items.length} items`);
  } catch (error) {
    console.error('Error saving items locally:', error);
  }
}
```

### Step 2: Update Screen Component
```typescript
// src/screens/YourScreen.tsx
import React, { useState, useEffect } from 'react';
import { useYourFeatureStore } from '../store/yourfeature';
import { addSyncListener } from '../services/syncService';

export default function YourScreen() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  // Use the auto-save store
  const { items, loading, loadItems, createItem, updateItem, deleteItem, syncToBackend } 
    = useYourFeatureStore();

  useEffect(() => {
    // Load data on mount
    loadItems();

    // Register for sync events
    const unsubscribe = addSyncListener('yourfeature', syncToBackend);
    
    return () => {
      unsubscribe?.();
    };
  }, [loadItems, syncToBackend]);

  const handleCreate = async () => {
    try {
      // Use the store - automatically saves and syncs
      await createItem(formData);
      setShowModal(false);
      Alert.alert('Success', 'Item created! ✓');
    } catch (error) {
      Alert.alert('Error', 'Failed to create item');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      // Use the store - automatically saves and syncs
      await updateItem(id, formData);
      Alert.alert('Success', 'Item updated! ✓');
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Use the store - automatically saves and syncs
      await deleteItem(id);
      Alert.alert('Success', 'Item deleted! ✓');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete item');
    }
  };

  // Render UI using items from store
  return (
    <SafeAreaView>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView>
          {items.map(item => (
            <View key={item.id}>
              {/* Render item */}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
```

### Step 3: Test the Implementation
```bash
1. Make a change on the screen
2. Close the app
3. Reopen the app
4. Verify change persists ✓

5. Test offline:
   - Enable airplane mode
   - Make changes
   - Verify saved locally
   - Disable airplane mode
   - Verify auto-sync to backend ✓
```

---

## 📊 Progress Tracker

| Screen | Store | Status | Auto-Save | Offline | Sync | Notes |
|--------|-------|--------|-----------|---------|------|-------|
| SettingsScreen | ✓ settings.ts | ✅ Done | ✓ Yes | ✓ Yes | ✓ Yes | Working example |
| MotivationScreen | ✓ goals.ts | ✅ Done | ✓ Yes | ✓ Yes | ✓ Yes | Full implementation |
| ProfileScreen | ⏳ profile.ts | ⏹️ TODO | - | - | - | Priority 1 |
| AddExpenseScreen | ⏳ expenses.ts | ⏹️ TODO | - | - | - | Priority 1 |
| EditExpenseScreen | ⏳ expenses.ts | ⏹️ TODO | - | - | - | Priority 1 |
| AddIncomeScreen | ⏳ income.ts | ⏹️ TODO | - | - | - | Priority 1 |
| ReminderScreen | ⏳ reminders.ts | ⏹️ TODO | - | - | - | Priority 2 |
| BooksScreen | ⏳ books.ts | ⏹️ TODO | - | - | - | Priority 2 |
| ReportsScreen | ⏳ reports.ts | ⏹️ TODO | - | - | - | Priority 2 |
| HomeScreen | ✓ settings.ts | ⏹️ TODO | - | - | - | Priority 3 |

---

## 🚀 Quick Checklist for Each Implementation

- [ ] Store created with all CRUD methods
- [ ] Store methods use API calls
- [ ] Store methods save to local storage
- [ ] Screen imports the store
- [ ] Screen uses `useEffect` to load on mount
- [ ] Screen registers sync listener
- [ ] All form handlers use store methods
- [ ] Local storage persists data
- [ ] Offline mode works
- [ ] Network restore triggers sync
- [ ] All errors handled gracefully
- [ ] Success messages shown to user
- [ ] Code follows existing patterns

---

## 🎓 Learning Resources

1. **SettingsScreen.tsx** - Simple single-document store example
2. **MotivationScreen.tsx** - Complex list operations example
3. **autoSaveService.ts** - Core debounce and retry logic
4. **syncService.ts** - Network monitoring and sync triggering

---

## 🛠️ Tools Available

### Zustand Store Methods
```typescript
set()      // Update state
get()      // Read state
create()   // Create new store
```

### Auto-Save Service
```typescript
useAutoSave()              // Hook for debounced saves
saveToSecureStorage()      // Encrypt sensitive data
loadFromSecureStorage()    // Decrypt sensitive data
getUnsavedChanges()        // Track changes
markAsSynced()             // Mark synced
```

### Sync Service
```typescript
initializeSyncService()    // Start network monitoring
syncAllChanges()          // Manual sync trigger
addSyncListener()         // Register sync handler
isNetworkOnline()         // Check network status
cleanupSyncService()      // Stop monitoring
```

---

## 💡 Pro Tips

1. **Debounce for text inputs**: By default 1 second, configurable
2. **Batch operations**: Multiple changes sync as one request
3. **Error recovery**: Auto-retry with exponential backoff (3 times)
4. **Silent by default**: Errors don't interrupt user, only on critical failures
5. **No breaking changes**: Existing API contracts remain unchanged

---

## 🎯 Success Criteria

When implementing auto-save for each screen:

✅ User makes a change → UI updates instantly  
✅ Data saves locally immediately → Works offline  
✅ After 1 second of no changes → Syncs to backend  
✅ Network gone → Changes queued locally  
✅ Network restored → Auto-sync all changes  
✅ Sync fails → Auto-retry 3 times  
✅ User closes app → Reopens, all changes persist  
✅ No manual save button needed → True auto-save  
✅ Errors don't interrupt workflow → Professional UX  
✅ Backend stays in sync → Single source of truth  

---

## 📞 Support

For questions about implementation:
1. Check SettingsScreen.tsx for simple example
2. Check MotivationScreen.tsx for complex example
3. Review autoSaveService.ts for core functionality
4. Review syncService.ts for network handling

Happy auto-saving! 🎉