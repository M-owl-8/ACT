# Mission 6: Mobile Implementation Guide

## 📱 Complete Guide to Calendar Screen and Reminders UI

This document provides comprehensive guidance for understanding and working with the mobile implementation of the Calendar and Reminders feature.

---

## Table of Contents

1. [Overview](#overview)
2. [Screen Architecture](#screen-architecture)
3. [Component Breakdown](#component-breakdown)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Notification System](#notification-system)
7. [UI/UX Patterns](#uiux-patterns)
8. [Styling Guide](#styling-guide)
9. [Performance Optimization](#performance-optimization)
10. [Testing Guide](#testing-guide)

---

## Overview

### File Location
```
apps/mobile/src/screens/CalendarScreen.tsx
```

### Dependencies
```json
{
  "react": "^18.x",
  "react-native": "^0.72.x",
  "expo-notifications": "~0.30.3",
  "@react-navigation/native": "^6.x"
}
```

### Screen Purpose
The CalendarScreen provides a comprehensive interface for:
- Viewing planned expenses in a calendar grid
- Creating new reminders for future expenses
- Managing upcoming reminders (next 7 days)
- Converting reminders to actual expense entries
- Receiving local device notifications

---

## Screen Architecture

### Component Hierarchy

```
CalendarScreen
├─ SafeAreaView (Container)
│  ├─ ScrollView (Main Content)
│  │  ├─ Header Section
│  │  │  ├─ Title Text
│  │  │  └─ Add Reminder Button
│  │  ├─ Month Navigation
│  │  │  ├─ Previous Month Button
│  │  │  ├─ Current Month Label
│  │  │  └─ Next Month Button
│  │  ├─ Calendar Grid
│  │  │  ├─ Day Headers Row
│  │  │  └─ Week Rows (6 weeks)
│  │  │     └─ Day Cells
│  │  │        ├─ Day Number
│  │  │        ├─ Today Indicator
│  │  │        └─ Reminder Dots
│  │  └─ Upcoming Reminders Section
│  │     ├─ Section Title
│  │     └─ Reminder Cards
│  │        ├─ Category Badge
│  │        ├─ Title & Amount
│  │        ├─ Date & Time
│  │        ├─ Note
│  │        └─ Action Buttons
│  └─ Add Reminder Modal
│     ├─ Modal Header
│     ├─ Form Fields
│     │  ├─ Title Input
│     │  ├─ Amount Input
│     │  ├─ Category Picker
│     │  ├─ Date Picker
│     │  ├─ Time Picker
│     │  └─ Note Input
│     └─ Submit Button
```

### Data Flow

```
User Action → State Update → API Call → Response → State Update → UI Re-render
                                ↓
                         Schedule Notification
```

---

## Component Breakdown

### 1. Header Section

**Purpose**: Display screen title and primary action button

**Code**:
```tsx
<View style={styles.header}>
  <Text style={styles.title}>Calendar</Text>
  <TouchableOpacity
    style={styles.addButton}
    onPress={() => setModalVisible(true)}
  >
    <Text style={styles.addButtonText}>+ Add Reminder</Text>
  </TouchableOpacity>
</View>
```

**Styling**:
```tsx
header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 16,
  backgroundColor: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: '#E5E5EA',
}
```

---

### 2. Month Navigation

**Purpose**: Allow users to navigate between months (limited to +3 months)

**Code**:
```tsx
<View style={styles.monthNavigation}>
  <TouchableOpacity
    onPress={goToPreviousMonth}
    style={styles.navButton}
  >
    <Text style={styles.navButtonText}>←</Text>
  </TouchableOpacity>
  
  <Text style={styles.monthLabel}>
    {currentMonth.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })}
  </Text>
  
  <TouchableOpacity
    onPress={goToNextMonth}
    style={[
      styles.navButton,
      isNextMonthDisabled && styles.navButtonDisabled
    ]}
    disabled={isNextMonthDisabled}
  >
    <Text style={[
      styles.navButtonText,
      isNextMonthDisabled && styles.navButtonTextDisabled
    ]}>→</Text>
  </TouchableOpacity>
</View>
```

**Logic**:
```tsx
const goToNextMonth = () => {
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  // Check 3-month limit
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  
  if (nextMonth <= threeMonthsFromNow) {
    setCurrentMonth(nextMonth);
  }
};

const isNextMonthDisabled = () => {
  const nextMonth = new Date(currentMonth);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  return nextMonth > threeMonthsFromNow;
};
```

---

### 3. Calendar Grid

**Purpose**: Display month view with reminder indicators

**Structure**:
```tsx
// Day headers
<View style={styles.dayHeaders}>
  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
    <Text key={day} style={styles.dayHeader}>{day}</Text>
  ))}
</View>

// Calendar grid (6 weeks)
<View style={styles.calendarGrid}>
  {calendarDays.map((day, index) => (
    <View key={index} style={styles.dayCell}>
      <View style={[
        styles.dayNumber,
        day.isToday && styles.todayCircle,
        !day.isCurrentMonth && styles.inactiveDay
      ]}>
        <Text style={[
          styles.dayText,
          day.isToday && styles.todayText,
          !day.isCurrentMonth && styles.inactiveDayText
        ]}>
          {day.date.getDate()}
        </Text>
      </View>
      
      {/* Reminder dots */}
      {day.reminders.length > 0 && (
        <View style={styles.reminderDots}>
          {day.reminders.slice(0, 3).map((reminder, i) => (
            <View
              key={i}
              style={[
                styles.reminderDot,
                { backgroundColor: reminder.category?.color || '#007AFF' }
              ]}
            />
          ))}
        </View>
      )}
    </View>
  ))}
</View>
```

**Calendar Generation Logic**:
```tsx
const generateCalendarDays = (month: Date) => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  
  // First day of month
  const firstDay = new Date(year, monthIndex, 1);
  const startingDayOfWeek = firstDay.getDay();
  
  // Last day of month
  const lastDay = new Date(year, monthIndex + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Previous month days
  const prevMonthLastDay = new Date(year, monthIndex, 0);
  const prevMonthDays = prevMonthLastDay.getDate();
  
  const days = [];
  
  // Add previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, monthIndex - 1, prevMonthDays - i),
      isCurrentMonth: false,
      isToday: false,
      reminders: []
    });
  }
  
  // Add current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, monthIndex, i);
    const dateString = date.toISOString().split('T')[0];
    const isToday = dateString === new Date().toISOString().split('T')[0];
    
    days.push({
      date,
      isCurrentMonth: true,
      isToday,
      reminders: calendarData[dateString] || []
    });
  }
  
  // Add next month days to complete 6 weeks (42 days)
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, monthIndex + 1, i),
      isCurrentMonth: false,
      isToday: false,
      reminders: []
    });
  }
  
  return days;
};
```

---

### 4. Reminder Cards

**Purpose**: Display upcoming reminders with action buttons

**Code**:
```tsx
const ReminderCard = ({ reminder }) => (
  <View style={styles.reminderCard}>
    {/* Category badge */}
    {reminder.category && (
      <View style={[
        styles.categoryBadge,
        { backgroundColor: reminder.category.color + '20' }
      ]}>
        <Text style={styles.categoryIcon}>{reminder.category.icon}</Text>
        <Text style={[
          styles.categoryName,
          { color: reminder.category.color }
        ]}>
          {reminder.category.name}
        </Text>
      </View>
    )}
    
    {/* Title and amount */}
    <View style={styles.reminderHeader}>
      <Text style={styles.reminderTitle}>{reminder.title}</Text>
      {reminder.amount && (
        <Text style={styles.reminderAmount}>
          {reminder.currency} {reminder.amount.toFixed(2)}
        </Text>
      )}
    </View>
    
    {/* Date and time */}
    <Text style={styles.reminderDate}>
      {new Date(reminder.reminder_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })} at {new Date(reminder.reminder_date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })}
    </Text>
    
    {/* Note */}
    {reminder.note && (
      <Text style={styles.reminderNote}>{reminder.note}</Text>
    )}
    
    {/* Action buttons */}
    <View style={styles.reminderActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleCreateExpense(reminder.id)}
      >
        <Text style={styles.actionButtonText}>Add Expense</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, styles.doneButton]}
        onPress={() => handleMarkDone(reminder.id)}
      >
        <Text style={styles.actionButtonText}>Done</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(reminder.id)}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  </View>
);
```

---

### 5. Add Reminder Modal

**Purpose**: Form for creating new reminders

**Code**:
```tsx
<Modal
  visible={modalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setModalVisible(false)}
>
  <SafeAreaView style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Text style={styles.cancelButton}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.modalTitle}>New Reminder</Text>
      <TouchableOpacity onPress={handleSubmit}>
        <Text style={styles.saveButton}>Save</Text>
      </TouchableOpacity>
    </View>
    
    <ScrollView style={styles.modalContent}>
      {/* Title input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="e.g., Pay rent"
        />
      </View>
      
      {/* Amount input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          value={formData.amount}
          onChangeText={(text) => setFormData({...formData, amount: text})}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>
      
      {/* Category picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setCategoryPickerVisible(true)}
        >
          <Text style={styles.pickerText}>
            {selectedCategory?.name || 'Select category'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Date picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setDatePickerVisible(true)}
        >
          <Text style={styles.pickerText}>
            {formData.date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Time picker */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Time *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setTimePickerVisible(true)}
        >
          <Text style={styles.pickerText}>
            {formData.date.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Note input */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.note}
          onChangeText={(text) => setFormData({...formData, note: text})}
          placeholder="Additional details..."
          multiline
          numberOfLines={4}
        />
      </View>
    </ScrollView>
  </SafeAreaView>
</Modal>
```

---

## State Management

### State Variables

```tsx
const [currentMonth, setCurrentMonth] = useState(new Date());
const [calendarData, setCalendarData] = useState<Record<string, Reminder[]>>({});
const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
const [modalVisible, setModalVisible] = useState(false);
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
  title: '',
  amount: '',
  currency: 'USD',
  date: new Date(),
  note: '',
  category_id: null
});
```

### State Update Patterns

```tsx
// Fetch calendar data
const fetchCalendarData = async () => {
  setLoading(true);
  try {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const response = await fetch(
      `${API_URL}/reminders/calendar/${year}/${month}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    setCalendarData(data);
  } catch (error) {
    console.error('Error fetching calendar:', error);
  } finally {
    setLoading(false);
  }
};

// Fetch upcoming reminders
const fetchUpcomingReminders = async () => {
  try {
    const today = new Date().toISOString();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    
    const response = await fetch(
      `${API_URL}/reminders?completed=false&start_date=${today}&end_date=${sevenDaysLater.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    setUpcomingReminders(data);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
  }
};
```

---

## API Integration

### API Service Functions

```tsx
// Create reminder
const createReminder = async (reminderData: ReminderCreate) => {
  const response = await fetch(`${API_URL}/reminders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reminderData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  return await response.json();
};

// Convert to expense
const createExpenseFromReminder = async (reminderId: number) => {
  const response = await fetch(
    `${API_URL}/reminders/${reminderId}/create-expense`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  return await response.json();
};

// Mark as done
const markReminderDone = async (reminderId: number) => {
  const response = await fetch(
    `${API_URL}/reminders/${reminderId}/complete`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  return await response.json();
};

// Delete reminder
const deleteReminder = async (reminderId: number) => {
  const response = await fetch(
    `${API_URL}/reminders/${reminderId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }
  
  return await response.json();
};
```

### Error Handling

```tsx
const handleCreateReminder = async () => {
  try {
    setLoading(true);
    
    // Validate form
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    // Create reminder
    const reminder = await createReminder({
      title: formData.title,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      currency: formData.currency,
      reminder_date: formData.date.toISOString(),
      note: formData.note,
      category_id: formData.category_id
    });
    
    // Schedule notification
    await scheduleNotification(reminder);
    
    // Refresh data
    await fetchCalendarData();
    await fetchUpcomingReminders();
    
    // Close modal
    setModalVisible(false);
    
    // Show success message
    Alert.alert('Success', 'Reminder created successfully');
    
  } catch (error) {
    console.error('Error creating reminder:', error);
    Alert.alert('Error', error.message || 'Failed to create reminder');
  } finally {
    setLoading(false);
  }
};
```

---

## Notification System

### Setup and Permissions

```tsx
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions
const requestNotificationPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permissions Required',
      'Please enable notifications to receive reminders'
    );
    return false;
  }
  return true;
};

// Call on screen mount
useEffect(() => {
  requestNotificationPermissions();
}, []);
```

### Scheduling Notifications

```tsx
const scheduleNotification = async (reminder: Reminder) => {
  try {
    const trigger = new Date(reminder.reminder_date);
    
    // Ensure trigger is in the future
    if (trigger <= new Date()) {
      console.warn('Cannot schedule notification for past date');
      return;
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.amount 
          ? `${reminder.currency} ${reminder.amount.toFixed(2)}`
          : reminder.note || 'Reminder',
        data: { 
          reminderId: reminder.id,
          type: 'reminder'
        },
        sound: true,
      },
      trigger,
    });
    
    console.log('Notification scheduled:', notificationId);
    return notificationId;
    
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};
```

### Handling Notification Taps

```tsx
useEffect(() => {
  // Handle notification tap when app is in foreground
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const reminderId = response.notification.request.content.data.reminderId;
      if (reminderId) {
        // Navigate to reminder or show details
        console.log('Notification tapped for reminder:', reminderId);
      }
    }
  );
  
  return () => subscription.remove();
}, []);
```

### Cancelling Notifications

```tsx
const cancelNotification = async (notificationId: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
};

// Cancel all notifications for a reminder
const cancelReminderNotifications = async (reminderId: number) => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const reminderNotifications = scheduled.filter(
      n => n.content.data.reminderId === reminderId
    );
    
    for (const notification of reminderNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error cancelling reminder notifications:', error);
  }
};
```

---

## UI/UX Patterns

### Loading States

```tsx
{loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
) : (
  // Content
)}
```

### Empty States

```tsx
{upcomingReminders.length === 0 ? (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateIcon}>📅</Text>
    <Text style={styles.emptyStateTitle}>No Upcoming Reminders</Text>
    <Text style={styles.emptyStateText}>
      Tap "Add Reminder" to plan your future expenses
    </Text>
  </View>
) : (
  // Reminder cards
)}
```

### Confirmation Dialogs

```tsx
const confirmDelete = (reminderId: number) => {
  Alert.alert(
    'Delete Reminder',
    'Are you sure you want to delete this reminder?',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => handleDelete(reminderId)
      }
    ]
  );
};
```

### Success Feedback

```tsx
const showSuccessToast = (message: string) => {
  // Using a toast library or custom component
  Toast.show({
    type: 'success',
    text1: 'Success',
    text2: message,
    position: 'bottom'
  });
};
```

---

## Styling Guide

### Color Palette

```tsx
const colors = {
  primary: '#007AFF',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  gray: {
    50: '#F9F9F9',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#3A3A3C',
  },
  white: '#FFFFFF',
  black: '#000000',
};
```

### Typography

```tsx
const typography = {
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[900],
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[600],
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.gray[500],
  },
};
```

### Spacing

```tsx
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

### Border Radius

```tsx
const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
```

---

## Performance Optimization

### Memoization

```tsx
import { useMemo, useCallback } from 'react';

// Memoize calendar days calculation
const calendarDays = useMemo(() => {
  return generateCalendarDays(currentMonth);
}, [currentMonth, calendarData]);

// Memoize callbacks
const handleCreateExpense = useCallback(async (reminderId: number) => {
  // Implementation
}, [token, navigation]);
```

### Lazy Loading

```tsx
// Load categories only when picker is opened
const [categories, setCategories] = useState([]);
const [categoriesLoaded, setCategoriesLoaded] = useState(false);

const loadCategories = async () => {
  if (categoriesLoaded) return;
  
  try {
    const response = await fetch(`${API_URL}/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setCategories(data);
    setCategoriesLoaded(true);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};
```

### Debouncing

```tsx
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

useEffect(() => {
  if (debouncedSearchTerm) {
    searchReminders(debouncedSearchTerm);
  }
}, [debouncedSearchTerm]);
```

---

## Testing Guide

### Unit Tests

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CalendarScreen from './CalendarScreen';

describe('CalendarScreen', () => {
  it('renders calendar grid', () => {
    const { getByText } = render(<CalendarScreen />);
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
  });
  
  it('opens add reminder modal', () => {
    const { getByText } = render(<CalendarScreen />);
    const addButton = getByText('+ Add Reminder');
    fireEvent.press(addButton);
    expect(getByText('New Reminder')).toBeTruthy();
  });
  
  it('validates required fields', async () => {
    const { getByText, getByPlaceholderText } = render(<CalendarScreen />);
    
    // Open modal
    fireEvent.press(getByText('+ Add Reminder'));
    
    // Try to save without title
    fireEvent.press(getByText('Save'));
    
    await waitFor(() => {
      expect(getByText('Title is required')).toBeTruthy();
    });
  });
});
```

### Integration Tests

```tsx
describe('Reminder Creation Flow', () => {
  it('creates reminder and schedules notification', async () => {
    const { getByText, getByPlaceholderText } = render(<CalendarScreen />);
    
    // Open modal
    fireEvent.press(getByText('+ Add Reminder'));
    
    // Fill form
    fireEvent.changeText(getByPlaceholderText('e.g., Pay rent'), 'Test Reminder');
    fireEvent.changeText(getByPlaceholderText('0.00'), '100');
    
    // Save
    fireEvent.press(getByText('Save'));
    
    // Wait for API call and notification scheduling
    await waitFor(() => {
      expect(mockScheduleNotification).toHaveBeenCalled();
      expect(getByText('Test Reminder')).toBeTruthy();
    });
  });
});
```

---

**Document**: 3 of 10 in Mission 6 Documentation Suite  
**Last Updated**: January 2024  
**Version**: 1.0.0