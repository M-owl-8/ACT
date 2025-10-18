import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../api/client';
import * as Notifications from 'expo-notifications';
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from '../theme/SAMURAI_COLORS';

const { width } = Dimensions.get('window');

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Reminder {
  id: number;
  title: string;
  amount: number | null;
  currency: string;
  note: string | null;
  reminder_date: string;
  is_completed: boolean;
  completed_at: string | null;
  entry_id: number | null;
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  category_color: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  type: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  reminders: Reminder[];
}

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    requestNotificationPermissions();
    loadData();
  }, []);

  useEffect(() => {
    generateCalendar();
  }, [currentDate, reminders]);

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notifications not granted. Reminders will work but without push notifications.');
      }
    } catch (error) {
      // Gracefully handle notification errors in Expo Go
      console.warn('Notifications not available in Expo Go. Use a development build for full notification support.');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await api.get('/categories');
      const expenseCategories = categoriesResponse.data.filter(
        (cat: Category) => cat.type === 'expense'
      );
      setCategories(expenseCategories);
      
      // Load reminders for current month
      await loadMonthReminders();
      
      // Load upcoming reminders
      await loadUpcomingReminders();
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthReminders = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await api.get(`/reminders/calendar/${year}/${month}`);
      
      // Convert calendar response to reminders array
      const remindersList: Reminder[] = [];
      Object.entries(response.data.reminders_by_date).forEach(([date, dayReminders]: [string, any]) => {
        dayReminders.forEach((reminder: any) => {
          remindersList.push({
            ...reminder,
            reminder_date: `${date}T${reminder.time}:00`,
          });
        });
      });
      
      setReminders(remindersList);
    } catch (error) {
      console.error('Error loading month reminders:', error);
    }
  };

  const loadUpcomingReminders = async () => {
    try {
      const response = await api.get('/reminders', {
        params: {
          include_completed: false,
        },
      });
      
      // Filter to show only next 7 days
      const now = new Date();
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const upcoming = response.data.reminders.filter((reminder: Reminder) => {
        const reminderDate = new Date(reminder.reminder_date);
        return reminderDate >= now && reminderDate <= sevenDaysLater;
      });
      
      setUpcomingReminders(upcoming);
    } catch (error) {
      console.error('Error loading upcoming reminders:', error);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();
    
    // Generate calendar days
    const days: CalendarDay[] = [];
    
    // Add previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        reminders: [],
      });
    }
    
    // Add current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Find reminders for this day
      const dayReminders = reminders.filter(reminder => {
        const reminderDateStr = new Date(reminder.reminder_date).toISOString().split('T')[0];
        return reminderDateStr === dateStr;
      });
      
      days.push({
        date,
        isCurrentMonth: true,
        reminders: dayReminders,
      });
    }
    
    // Add next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        reminders: [],
      });
    }
    
    setCalendarDays(days);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    
    // Check if within 3 months range
    const now = new Date();
    if (newDate >= now) {
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    
    // Check if within 3 months range
    const now = new Date();
    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    if (newDate <= maxDate) {
      setCurrentDate(newDate);
    }
  };

  const canGoToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const now = new Date();
    return newDate >= now;
  };

  const canGoToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const now = new Date();
    const maxDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return newDate <= maxDate;
  };

  const handleDayPress = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    // Compare only the date parts (year, month, day) without time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    
    if (selectedDay < today) {
      Alert.alert('Invalid Date', 'Cannot create reminders for past dates');
      return;
    }
    
    setSelectedDate(day.date);
    setShowAddModal(true);
  };

  const scheduleLocalNotification = async (reminder: Reminder) => {
    try {
      const reminderDate = new Date(reminder.reminder_date);
      const now = new Date();
      
      if (reminderDate <= now) {
        return; // Don't schedule notifications for past dates
      }
      
      const trigger = reminderDate;
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 Expense Reminder',
          body: reminder.amount 
            ? `${reminder.title} - $${reminder.amount.toFixed(2)}`
            : reminder.title,
          data: { reminderId: reminder.id },
          sound: true,
        },
        trigger,
      });
      
      console.log('Notification scheduled for:', reminderDate);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const handleCreateReminder = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    
    try {
      // Parse time
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const reminderDate = new Date(selectedDate);
      reminderDate.setHours(hours, minutes, 0, 0);
      
      // Create reminder
      const response = await api.post('/reminders', {
        title: title.trim(),
        amount: amount ? parseFloat(amount) : null,
        category_id: categoryId,
        note: note.trim() || null,
        reminder_date: reminderDate.toISOString(),
      });
      
      const newReminder = response.data;
      
      // Schedule local notification
      await scheduleLocalNotification(newReminder);
      
      // Reset form
      setTitle('');
      setAmount('');
      setCategoryId(null);
      setNote('');
      setReminderTime('09:00');
      setShowAddModal(false);
      setSelectedDate(null);
      
      // Reload data
      await loadData();
      
      Alert.alert('Success', 'Reminder created successfully!');
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create reminder');
    }
  };

  const handleMarkComplete = async (reminderId: number) => {
    try {
      await api.post(`/reminders/${reminderId}/complete`);
      await loadData();
      Alert.alert('Success', 'Reminder marked as complete');
    } catch (error: any) {
      console.error('Error marking complete:', error);
      Alert.alert('Error', 'Failed to mark reminder as complete');
    }
  };

  const handleQuickAddExpense = async (reminder: Reminder) => {
    if (!reminder.category_id) {
      Alert.alert('Error', 'Reminder must have a category to create expense');
      return;
    }
    
    Alert.alert(
      'Create Expense',
      `Create expense for "${reminder.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            try {
              await api.post(`/reminders/${reminder.id}/create-expense`, {
                amount: reminder.amount,
                note: reminder.note,
                booked_at: new Date().toISOString(),
              });
              
              await loadData();
              Alert.alert('Success', 'Expense created successfully!');
            } catch (error: any) {
              console.error('Error creating expense:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Failed to create expense');
            }
          },
        },
      ]
    );
  };

  const handleDeleteReminder = async (reminderId: number) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/reminders/${reminderId}`);
              
              // Cancel notification
              const notifications = await Notifications.getAllScheduledNotificationsAsync();
              const notification = notifications.find(
                n => n.content.data?.reminderId === reminderId
              );
              if (notification) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
              }
              
              await loadData();
              Alert.alert('Success', 'Reminder deleted');
            } catch (error: any) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📅 Calendar</Text>
          <Text style={styles.subtitle}>Plan expenses up to 3 months ahead</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            disabled={!canGoToPreviousMonth()}
            style={[styles.navButton, !canGoToPreviousMonth() && styles.navButtonDisabled]}
          >
            <Ionicons name="chevron-back" size={24} color={canGoToPreviousMonth() ? '#333' : '#ccc'} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>{formatDate(currentDate)}</Text>
          
          <TouchableOpacity
            onPress={goToNextMonth}
            disabled={!canGoToNextMonth()}
            style={[styles.navButton, !canGoToNextMonth() && styles.navButtonDisabled]}
          >
            <Ionicons name="chevron-forward" size={24} color={canGoToNextMonth() ? '#333' : '#ccc'} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day headers */}
          <View style={styles.dayHeadersRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <View key={day} style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  !day.isCurrentMonth && styles.calendarDayInactive,
                  isToday(day.date) && styles.calendarDayToday,
                ]}
                onPress={() => handleDayPress(day)}
                disabled={!day.isCurrentMonth}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    !day.isCurrentMonth && styles.calendarDayTextInactive,
                    isToday(day.date) && styles.calendarDayTextToday,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
                {day.reminders.length > 0 && (
                  <View style={styles.reminderDots}>
                    {day.reminders.slice(0, 3).map((_, i) => (
                      <View key={i} style={styles.reminderDot} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Reminders */}
        <View style={styles.upcomingSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Upcoming (Next 7 Days)</Text>
          </View>

          {upcomingReminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No upcoming reminders</Text>
              <Text style={styles.emptyStateSubtext}>Tap a date to create one</Text>
            </View>
          ) : (
            upcomingReminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    {reminder.category_icon && (
                      <Text style={styles.reminderIcon}>{reminder.category_icon}</Text>
                    )}
                    <View style={styles.reminderDetails}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <Text style={styles.reminderDate}>
                        {formatDateShort(reminder.reminder_date)} at {formatTime(reminder.reminder_date)}
                      </Text>
                      {reminder.category_name && (
                        <Text style={styles.reminderCategory}>{reminder.category_name}</Text>
                      )}
                    </View>
                  </View>
                  {reminder.amount && (
                    <Text style={styles.reminderAmount}>
                      ${reminder.amount.toFixed(2)}
                    </Text>
                  )}
                </View>

                {reminder.note && (
                  <Text style={styles.reminderNote}>{reminder.note}</Text>
                )}

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonPrimary]}
                    onPress={() => handleQuickAddExpense(reminder)}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonTextPrimary}>Add Expense</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSecondary]}
                    onPress={() => handleMarkComplete(reminder.id)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
                    <Text style={styles.actionButtonTextSecondary}>Done</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButtonIcon}
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Reminder</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedDate && (
                <Text style={styles.selectedDateText}>
                  📅 {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              )}

              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Pay electricity bill"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Amount (Optional)</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />

              <Text style={styles.inputLabel}>Category (Optional)</Text>
              <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.categoryButtonText}>
                  {categoryId
                    ? categories.find(c => c.id === categoryId)?.name || 'Select category'
                    : 'Select category'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={styles.categoryPicker}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryOption}
                      onPress={() => {
                        setCategoryId(category.id);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text style={styles.categoryOptionIcon}>{category.icon}</Text>
                      <Text style={styles.categoryOptionText}>{category.name}</Text>
                      {categoryId === category.id && (
                        <Ionicons name="checkmark" size={20} color="#4CAF50" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={reminderTime}
                onChangeText={setReminderTime}
                placeholder="09:00"
                placeholderTextColor="#999"
              />

              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleCreateReminder}
              >
                <Text style={styles.modalButtonTextPrimary}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: SAMURAI_COLORS.text.secondary,
  },
  header: {
    padding: 20,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 2,
    borderBottomColor: SAMURAI_COLORS.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: SAMURAI_COLORS.background.surface,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  navButton: {
    padding: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },
  calendarContainer: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    marginTop: 8,
    padding: 16,
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.secondary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderColor: SAMURAI_COLORS.accent,
  },
  calendarDayText: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.primary,
    fontWeight: '500',
  },
  calendarDayTextInactive: {
    color: SAMURAI_COLORS.text.tertiary,
  },
  calendarDayTextToday: {
    color: SAMURAI_COLORS.accent,
    fontWeight: 'bold',
  },
  reminderDots: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reminderDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: SAMURAI_COLORS.accent,
    marginHorizontal: 1,
  },
  upcomingSection: {
    padding: 16,
    marginTop: 8,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  emptyStateText: {
    fontSize: 16,
    color: SAMURAI_COLORS.text.secondary,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.tertiary,
    marginTop: 4,
  },
  reminderCard: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: SAMURAI_COLORS.accent,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reminderInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  reminderIcon: {
    fontSize: 24,
    marginRight: 12,
    color: SAMURAI_COLORS.accent,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
    marginBottom: 2,
  },
  reminderCategory: {
    fontSize: 12,
    color: SAMURAI_COLORS.accent,
    fontWeight: '500',
  },
  reminderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.semantic.income,
  },
  reminderNote: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonPrimary: {
    backgroundColor: SAMURAI_COLORS.accent,
    flex: 1,
  },
  actionButtonSecondary: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.accent,
    flex: 1,
  },
  actionButtonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: SAMURAI_COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonIcon: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderTopWidth: 3,
    borderTopColor: SAMURAI_COLORS.accent,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
  },
  modalBody: {
    padding: 20,
  },
  selectedDateText: {
    fontSize: 16,
    color: SAMURAI_COLORS.accent,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: SAMURAI_COLORS.text.primary,
    backgroundColor: SAMURAI_COLORS.background.primary,
    ...SAMURAI_PATTERNS.inputField,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    borderRadius: 8,
    padding: 12,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  categoryButtonText: {
    fontSize: 16,
    color: SAMURAI_COLORS.text.primary,
  },
  categoryPicker: {
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  categoryOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  categoryOptionText: {
    fontSize: 16,
    color: SAMURAI_COLORS.text.primary,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: SAMURAI_COLORS.border.primary,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: SAMURAI_COLORS.accent,
  },
  modalButtonSecondary: {
    backgroundColor: SAMURAI_COLORS.background.primary,
    borderWidth: 1,
    borderColor: SAMURAI_COLORS.border.primary,
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: SAMURAI_COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});