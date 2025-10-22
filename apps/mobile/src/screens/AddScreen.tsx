import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<any>;

export default function AddScreen() {
  const navigation = useNavigation<NavigationProp>();

  const openAddIncome = () => {
    navigation.navigate('AddIncome');
  };

  const openAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Entry</Text>
          <Ionicons name="add-circle" size={32} color="#000" />
        </View>

        {/* Add Options */}
        <View style={styles.optionsContainer}>
          {/* Add Income Card */}
          <TouchableOpacity
            style={[styles.optionCard, styles.incomeCard]}
            onPress={openAddIncome}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="arrow-up-circle" size={48} color="#4caf50" />
              <Text style={styles.cardTitle}>Add Income</Text>
            </View>
            <Text style={styles.cardDescription}>Record a new income source</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardSubtext}>Quick and easy</Text>
              <Ionicons name="arrow-forward" size={20} color="#4caf50" />
            </View>
          </TouchableOpacity>

          {/* Add Expense Card */}
          <TouchableOpacity
            style={[styles.optionCard, styles.expenseCard]}
            onPress={openAddExpense}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="arrow-down-circle" size={48} color="#f44336" />
              <Text style={styles.cardTitle}>Add Expense</Text>
            </View>
            <Text style={styles.cardDescription}>Log a new expense</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardSubtext}>Track your spending</Text>
              <Ionicons name="arrow-forward" size={20} color="#f44336" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Quick Actions</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity style={styles.statCard}>
              <Ionicons name="calendar" size={28} color="#2196f3" />
              <Text style={styles.statLabel}>View Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Ionicons name="document-text" size={28} color="#ff9800" />
              <Text style={styles.statLabel}>Reports</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  optionsContainer: {
    marginBottom: 32,
    gap: 12,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#999',
  },
  statsContainer: {
    marginTop: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});