import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SAMURAI_COLORS } from '../theme/SAMURAI_COLORS';

interface RecurringReminder {
  id: number;
  title: string;
  description?: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  is_enabled: boolean;
  type: 'recurring';
  notificationId?: string; // For tracking scheduled notifications
  isDefault?: boolean; // True for mock reminders that can't be deleted
}

interface ExpenseReminder {
  id: number;
  title: string;
  amount: number;
  notes: string;
  date: Date;
  is_enabled: boolean;
  type: 'expense';
  dateString?: string; // For storage/retrieval
  notificationId?: string; // For tracking scheduled notifications
}

type Reminder = RecurringReminder | ExpenseReminder;

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function ReminderScreen() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedReminderForTime, setSelectedReminderForTime] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [languageChangeKey, setLanguageChangeKey] = useState(0);

  useEffect(() => {
    requestNotificationPermissions();
    loadReminders();
  }, []);
  
  // Listen for language changes to force re-render
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      console.log(`🌐 ReminderScreen detected language change to: ${lng}`);
      setLanguageChangeKey(prev => prev + 1);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  const parseTimeString = (timeStr: string): { hours: number; minutes: number } => {
    // Parse "09:00 AM" or "6:00 PM" format
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return { hours: 9, minutes: 0 };

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  };

  const scheduleRecurringNotification = async (reminder: RecurringReminder): Promise<string | null> => {
    try {
      const { hours, minutes } = parseTimeString(reminder.time);
      let trigger: any = {};

      // Create trigger based on frequency
      if (reminder.frequency === 'daily') {
        trigger = {
          hour: hours,
          minute: minutes,
          repeats: true,
        };
      } else if (reminder.frequency === 'weekly') {
        // Schedule for next week, same day and time
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        nextWeek.setHours(hours, minutes, 0, 0);
        trigger = {
          date: nextWeek,
          repeats: true,
        };
      } else if (reminder.frequency === 'monthly') {
        // Schedule for next month, same date and time
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        nextMonth.setHours(hours, minutes, 0, 0);
        trigger = {
          date: nextMonth,
          repeats: true,
        };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💰 ' + reminder.title,
          body: reminder.description || 'Time to manage your finances',
          sound: 'default',
          badge: 1,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling recurring notification:', error);
      return null;
    }
  };

  const scheduleExpenseNotification = async (reminder: ExpenseReminder): Promise<string | null> => {
    try {
      // Schedule notification for the date of the expense
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Upcoming Expense Reminder',
          body: `${reminder.notes} - $${reminder.amount.toFixed(2)}`,
          sound: 'default',
          badge: 1,
        },
        trigger: {
          date: reminder.date,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling expense notification:', error);
      return null;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  const loadReminders = async () => {
    try {
      setLoading(true);
      // Mock reminders for now
      let mockReminders: Reminder[] = [
        {
          id: 1,
          title: 'Log Daily Expenses',
          description: 'Remember to track your daily expenses',
          time: '09:00 AM',
          frequency: 'daily',
          is_enabled: true,
          type: 'recurring',
          isDefault: true,
        },
        {
          id: 2,
          title: 'Weekly Budget Review',
          description: 'Check your spending against budget',
          time: '06:00 PM',
          frequency: 'weekly',
          is_enabled: true,
          type: 'recurring',
          isDefault: true,
        },
        {
          id: 3,
          title: 'Monthly Financial Report',
          description: 'Review your monthly finances',
          time: '08:00 AM',
          frequency: 'monthly',
          is_enabled: false,
          type: 'recurring',
          isDefault: true,
        },
      ];

      // Load stored recurring reminder states
      const storedRecurringStatesJson = await AsyncStorage.getItem('recurringReminderStates');
      const storedRecurringStates: { [key: number]: boolean } = storedRecurringStatesJson ? JSON.parse(storedRecurringStatesJson) : {};
      
      // Load stored reminder times
      const storedReminderTimesJson = await AsyncStorage.getItem('reminderTimes');
      const storedReminderTimes: { [key: number]: string } = storedReminderTimesJson ? JSON.parse(storedReminderTimesJson) : {};
      
      // Apply saved states and times to default reminders
      mockReminders = mockReminders.map(r => {
        if (storedRecurringStates.hasOwnProperty(r.id)) {
          r.is_enabled = storedRecurringStates[r.id];
        }
        if (storedReminderTimes.hasOwnProperty(r.id)) {
          r.time = storedReminderTimes[r.id];
        }
        return r;
      });

      // Load added expense reminders from storage
      const storedRemindersJson = await AsyncStorage.getItem('expenseReminders');
      const storedReminders: ExpenseReminder[] = storedRemindersJson ? JSON.parse(storedRemindersJson) : [];
      
      // Convert stored dateString back to Date objects
      const deserializedReminders = storedReminders.map(r => ({
        ...r,
        date: new Date(r.dateString || r.date),
      }));

      // Combine mock reminders with stored expense reminders
      const allReminders = [...mockReminders, ...deserializedReminders];
      
      // Schedule notifications for enabled reminders
      for (const reminder of allReminders) {
        if (reminder.is_enabled && !reminder.notificationId) {
          if (reminder.type === 'recurring') {
            const notificationId = await scheduleRecurringNotification(reminder as RecurringReminder);
            reminder.notificationId = notificationId || undefined;
          } else if (reminder.type === 'expense') {
            const notificationId = await scheduleExpenseNotification(reminder as ExpenseReminder);
            reminder.notificationId = notificationId || undefined;
          }
        }
      }

      setReminders(allReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
      Alert.alert('Error', 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpenseReminder = async () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (selectedDate <= new Date()) {
      Alert.alert('Invalid Date', 'Please select a future date');
      return;
    }

    const newReminder: ExpenseReminder = {
      id: Math.max(...reminders.map(r => r.id), 0) + 1,
      title: `Trip to Segovia`,
      amount: amountNum,
      notes: notes.trim() || 'No notes',
      date: selectedDate,
      dateString: selectedDate.toISOString(),
      is_enabled: true,
      type: 'expense',
    };

    try {
      // Schedule notification for the new reminder
      const notificationId = await scheduleExpenseNotification(newReminder);
      newReminder.notificationId = notificationId || undefined;

      // Add to state
      const updatedReminders = [...reminders, newReminder];
      setReminders(updatedReminders);

      // Save only expense reminders to storage
      const expenseReminders = updatedReminders.filter(r => r.type === 'expense') as ExpenseReminder[];
      await AsyncStorage.setItem('expenseReminders', JSON.stringify(expenseReminders));

      Alert.alert('Success', 'Expense reminder added');
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'Failed to save reminder');
    }
  };

  const resetForm = () => {
    setAmount('');
    setNotes('');
    setSelectedDate(new Date());
  };

  const handleToggleReminder = async (id: number) => {
    try {
      const reminderToToggle = reminders.find(r => r.id === id);
      if (!reminderToToggle) return;

      const updatedReminders = reminders.map(r => {
        if (r.id === id) {
          const isNowEnabled = !r.is_enabled;
          
          if (isNowEnabled) {
            // Schedule notification when enabling
            if (r.type === 'recurring') {
              scheduleRecurringNotification(r as RecurringReminder).then(notificationId => {
                r.notificationId = notificationId || undefined;
              });
            } else if (r.type === 'expense') {
              scheduleExpenseNotification(r as ExpenseReminder).then(notificationId => {
                r.notificationId = notificationId || undefined;
              });
            }
          } else {
            // Cancel notification when disabling
            if (r.notificationId) {
              cancelNotification(r.notificationId);
              r.notificationId = undefined;
            }
          }

          return { ...r, is_enabled: isNowEnabled };
        }
        return r;
      });

      setReminders(updatedReminders);

      // Update storage with updated expense reminders
      const expenseReminders = updatedReminders.filter(r => r.type === 'expense') as ExpenseReminder[];
      await AsyncStorage.setItem('expenseReminders', JSON.stringify(expenseReminders));

      // Save recurring reminder states
      const recurringReminders = updatedReminders.filter(r => r.type === 'recurring') as RecurringReminder[];
      const recurringStates: { [key: number]: boolean } = {};
      recurringReminders.forEach(r => {
        recurringStates[r.id] = r.is_enabled;
      });
      await AsyncStorage.setItem('recurringReminderStates', JSON.stringify(recurringStates));
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleDeleteReminder = (id: number) => {
    const reminderToDelete = reminders.find(r => r.id === id);
    
    // Prevent deletion of default reminders
    if (reminderToDelete && (reminderToDelete as any).isDefault) {
      Alert.alert('Cannot Delete', 'This is a default reminder and cannot be deleted. You can turn it off instead.');
      return;
    }

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
              // Find reminder to get notification ID
              const reminderToDelete = reminders.find(r => r.id === id);
              if (reminderToDelete?.notificationId) {
                await cancelNotification(reminderToDelete.notificationId);
              }

              const updatedReminders = reminders.filter(r => r.id !== id);
              setReminders(updatedReminders);

              // Update storage with remaining expense reminders
              const expenseReminders = updatedReminders.filter(r => r.type === 'expense') as ExpenseReminder[];
              await AsyncStorage.setItem('expenseReminders', JSON.stringify(expenseReminders));

              Alert.alert('Success', 'Reminder deleted');
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'Failed to delete reminder');
            }
          },
        },
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateOrTime: Date | string): string => {
    if (typeof dateOrTime === 'string') {
      return dateOrTime; // Already formatted
    }
    return dateOrTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const dateToTimeString = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    const displayHours = date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() === 0 ? 12 : date.getHours());
    return `${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const openTimePickerForReminder = (reminderId: number) => {
    const reminder = reminders.find(r => r.id === reminderId) as RecurringReminder;
    if (reminder) {
      // Parse existing time to set initial time picker value
      const match = reminder.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const period = match[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        const tempDate = new Date();
        tempDate.setHours(hours, minutes, 0, 0);
        setSelectedTime(tempDate);
      }
    }
    setSelectedReminderForTime(reminderId);
    setShowTimePickerModal(true);
  };

  const handleTimeConfirm = async () => {
    try {
      if (selectedReminderForTime === null) {
        console.log('No reminder selected');
        return;
      }

      // Save reminder ID before clearing it
      const reminderId = selectedReminderForTime;
      const timeString = dateToTimeString(selectedTime);
      console.log('Time String:', timeString);
      
      // CLOSE MODAL FIRST - before any other updates
      setShowTimePickerModal(false);
      setSelectedReminderForTime(null);
      
      // Small delay to ensure modal state is processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update reminder in state
      const updatedReminders = reminders.map(r => {
        if (r.id === reminderId && r.type === 'recurring') {
          return { ...r, time: timeString };
        }
        return r;
      });

      setReminders(updatedReminders);

      // Save to AsyncStorage
      const storedReminderTimesJson = await AsyncStorage.getItem('reminderTimes');
      const storedReminderTimes: { [key: number]: string } = storedReminderTimesJson ? JSON.parse(storedReminderTimesJson) : {};
      storedReminderTimes[reminderId] = timeString;
      await AsyncStorage.setItem('reminderTimes', JSON.stringify(storedReminderTimes));
      console.log('Time saved to storage:', storedReminderTimes);

      // If reminder is enabled, reschedule notification with new time
      const reminder = updatedReminders.find(r => r.id === reminderId);
      if (reminder && reminder.is_enabled && reminder.type === 'recurring') {
        if (reminder.notificationId) {
          await cancelNotification(reminder.notificationId);
        }
        const notificationId = await scheduleRecurringNotification(reminder as RecurringReminder);
        
        const rescheduledReminders = updatedReminders.map(r => {
          if (r.id === reminderId) {
            return { ...r, notificationId: notificationId || undefined };
          }
          return r;
        });
        setReminders(rescheduledReminders);
      }

      console.log('Modal closed and time saved');
    } catch (error) {
      console.error('Error in handleTimeConfirm:', error);
      Alert.alert('Error', 'Failed to save time. Please try again.');
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setSelectedTime(selectedDate);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: { [key: string]: string } = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyIcon = (frequency: string) => {
    const icons: { [key: string]: string } = {
      daily: 'repeat',
      weekly: 'calendar',
      monthly: 'calendar-outline',
    };
    return icons[frequency] || 'alert-circle';
  };

  const recurringReminders = reminders.filter(r => r.type === 'recurring') as RecurringReminder[];
  const expenseReminders = reminders.filter(r => r.type === 'expense') as ExpenseReminder[];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading reminders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reminders</Text>
          <Text style={styles.headerSubtitle}>Stay on top of your finances</Text>
        </View>

        {/* Add Expense Reminder Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Expense Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* Expense Reminders Section */}
        {expenseReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Future Expenses</Text>
            {expenseReminders.map(reminder => (
              <View key={reminder.id} style={styles.expenseReminderCard}>
                <View style={styles.expenseContent}>
                  <View style={styles.expenseHeader}>
                    <View style={styles.dateBox}>
                      <Text style={styles.dateBoxDate}>
                        {reminder.date.getDate()}
                      </Text>
                      <Text style={styles.dateBoxMonth}>
                        {reminder.date.toLocaleString('en-US', { month: 'short' })}
                      </Text>
                    </View>
                    <View style={styles.expenseInfo}>
                      <Text style={styles.reminderTitle}>{reminder.notes}</Text>
                      <Text style={styles.expenseAmount}>${reminder.amount.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => handleToggleReminder(reminder.id)}
                  >
                    <Ionicons
                      name={
                        reminder.is_enabled
                          ? 'checkmark-circle'
                          : 'checkmark-circle-outline'
                      }
                      size={28}
                      color={
                        reminder.is_enabled ? '#000' : '#999'
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#000" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recurring Reminders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Recurring Reminders</Text>
          {recurringReminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color="#BDBDBD" />
              <Text style={styles.emptyStateText}>No reminders set</Text>
              <Text style={styles.emptyStateSubtext}>
                Add reminders to help you stay on track
              </Text>
            </View>
          ) : (
            recurringReminders.map(reminder => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderContent}>
                  <View style={styles.reminderHeader}>
                    <Ionicons
                      name={getFrequencyIcon(reminder.frequency)}
                      size={24}
                      color={reminder.is_enabled ? '#000' : '#999'}
                    />
                    <View style={styles.reminderInfo}>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      {reminder.description && (
                        <Text style={styles.reminderDescription}>
                          {reminder.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.reminderMeta}>
                    <TouchableOpacity
                      style={styles.metaItem}
                      onPress={() => openTimePickerForReminder(reminder.id)}
                    >
                      <Ionicons name="time-outline" size={16} color="#000" />
                      <Text style={[styles.metaText, { color: '#000', fontWeight: '500' }]}>{reminder.time}</Text>
                    </TouchableOpacity>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaText}>
                        {getFrequencyLabel(reminder.frequency)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reminderActions}>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => handleToggleReminder(reminder.id)}
                  >
                    <Ionicons
                      name={
                        reminder.is_enabled
                          ? 'checkmark-circle'
                          : 'checkmark-circle-outline'
                      }
                      size={28}
                      color={
                        reminder.is_enabled ? '#000' : '#999'
                      }
                    />
                  </TouchableOpacity>
                  {!reminder.isDefault && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteReminder(reminder.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Expense Reminder Modal */}
      <Modal visible={showAddModal} transparent={true} animationType="fade">
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.modalContent}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                >
                  <Ionicons name="close" size={28} color="#000" />
                </TouchableOpacity>

                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>📅 Add Expense Reminder</Text>
                </View>

                {/* Date Picker */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Select Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar" size={20} color="#2196F3" />
                    <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onDateChange}
                      minimumDate={new Date()}
                    />
                  )}
                </View>

                {/* Amount Input */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Amount ($)</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="500"
                      placeholderTextColor="#999"
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Notes Input */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Notes</Text>
                  <TextInput
                    style={[styles.notesInput, { minHeight: 80 }]}
                    placeholder="e.g., Trip to Segovia"
                    placeholderTextColor="#999"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddExpenseReminder}
                >
                  <Text style={styles.submitButtonText}>Add Reminder</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Time Picker Modal - Simple Clean Interface */}
      <Modal visible={showTimePickerModal} transparent={true} animationType="fade">
        <View style={styles.timePickerSimpleOverlay}>
          <View style={styles.timePickerSimpleContent}>
            {/* Time Picker Only */}
            <View style={styles.timePickerWrapper}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display="spinner"
                onChange={onTimeChange}
                is24Hour={false}
                textColor="#000"
              />
            </View>

            {/* OK Button Only */}
            <TouchableOpacity
              style={styles.timePickerSimpleButton}
              onPress={handleTimeConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.timePickerSimpleButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseReminderCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderContent: {
    flex: 1,
    marginRight: 12,
  },
  expenseContent: {
    flex: 1,
    marginRight: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBox: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  dateBoxDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  dateBoxMonth: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  reminderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reminderDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 4,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  reminderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  // Modal Styles
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    minHeight: 'auto',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 10,
  },
  modalHeader: {
    marginBottom: 24,
    marginTop: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  datePickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#999',
  },
  datePickerText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#999',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#999',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Time Picker Modal Styles
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '85%',
    maxWidth: 350,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  timePickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timePickerButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerConfirmButton: {
    backgroundColor: '#000',
  },
  timePickerCancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#999',
  },
  timePickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Simple Time Picker Modal Styles
  timePickerSimpleOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerSimpleContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: '90%',
    maxWidth: 320,
    alignItems: 'center',
  },
  timePickerWrapper: {
    marginVertical: 10,
    height: 250,
    justifyContent: 'center',
  },
  timePickerSimpleButton: {
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 60,
    marginTop: 30,
  },
  timePickerSimpleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});