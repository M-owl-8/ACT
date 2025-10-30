import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../api/client';
import { useAuthStore } from '../store/auth';
import { formatCurrency } from '../utils/currencyFormatter';

const { width, height } = Dimensions.get('window');

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  day: number;
}

interface Transaction {
  id: number;
  type: 'income' | 'expense';
  category_name: string;
  category_icon: string;
  amount: number;
  date: string;
}

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateCalendar();
    loadTransactions();
  }, [currentDate]);

  useEffect(() => {
    if (selectedDate) {
      loadTransactionsByDate(selectedDate);
    }
  }, [selectedDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days: CalendarDay[] = [];

    // Previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        day: prevMonthLastDay - i,
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
        day,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        day,
      });
    }

    setCalendarDays(days);
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entries');
      // API returns array directly, not wrapped in object
      setTransactions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionsByDate = async (date: Date) => {
    // Filter transactions by selected date
    // This is client-side filtering for demo; can be extended to backend
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getTransactionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return transactions.filter(t => t.date && typeof t.date === 'string' && t.date.startsWith(dateStr));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
          <Ionicons name="calendar" size={28} color="#000" />
        </View>

        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <Text style={styles.monthText}>{monthName}</Text>
            <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
              <MaterialCommunityIcons name="calendar-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {weekDays.map((day, index) => (
              <View key={`weekday-${index}`} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
            <View key={`week-${weekIndex}`} style={styles.calendarRow}>
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day) => {
                const dayTransactions = getTransactionsForDate(day.date);
                const hasTransactions = dayTransactions.length > 0;
                const dayKey = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;

                return (
                  <TouchableOpacity
                    key={dayKey}
                    style={[
                      styles.dayCell,
                      !day.isCurrentMonth && styles.otherMonthDay,
                      isToday(day.date) && styles.todayDay,
                      isSelected(day.date) && styles.selectedDay,
                    ]}
                    onPress={() => setSelectedDate(day.date)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !day.isCurrentMonth && styles.otherMonthText,
                        isToday(day.date) && styles.todayText,
                        isSelected(day.date) && styles.selectedText,
                      ]}
                    >
                      {day.day}
                    </Text>
                    {hasTransactions && (
                      <View style={styles.transactionIndicator}>
                        <View style={styles.dot} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Navigation Arrows */}
          <View style={styles.navigationRow}>
            <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Date Transactions */}
        {selectedDate && (
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>
              {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#000" style={styles.loader} />
            ) : getTransactionsForDate(selectedDate).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No transactions on this date</Text>
              </View>
            ) : (
              getTransactionsForDate(selectedDate).map(transaction => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <View style={[
                      styles.categoryIcon,
                      transaction.type === 'income' ? styles.incomeIcon : styles.expenseIcon
                    ]}>
                      <Text style={styles.iconText}>{transaction.category_icon || '•'}</Text>
                    </View>
                    <View>
                      <Text style={styles.categoryName}>{transaction.category_name}</Text>
                      <Text style={styles.date}>
                        {new Date(transaction.date).toLocaleTimeString('default', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.amount,
                    transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, user?.currency || 'USD', 2)}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  calendarCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    letterSpacing: 0.5,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  otherMonthDay: {
    backgroundColor: 'transparent',
  },
  todayDay: {
    backgroundColor: '#f0f0f0',
  },
  selectedDay: {
    backgroundColor: '#000',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  otherMonthText: {
    color: '#ddd',
  },
  todayText: {
    color: '#000',
  },
  selectedText: {
    color: '#fff',
  },
  transactionIndicator: {
    position: 'absolute',
    bottom: 4,
    width: '100%',
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navButton: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrow: {
    fontSize: 28,
    fontWeight: '300',
    color: '#000',
  },
  transactionsSection: {
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#e8f5e9',
  },
  expenseIcon: {
    backgroundColor: '#ffe8e8',
  },
  iconText: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#4caf50',
  },
  expenseAmount: {
    color: '#f44336',
  },
});