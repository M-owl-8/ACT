import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<any>;

export default function AddScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [languageChangeKey, setLanguageChangeKey] = React.useState(0);

  // Listen for language changes and force re-render
  React.useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const openAddIncome = () => {
    navigation.navigate('AddIncome');
  };

  const openAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  return (
    <SafeAreaView key={languageChangeKey} style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('add')}</Text>
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
              <Text style={styles.cardTitle}>{t('addIncome')}</Text>
            </View>
            <Text style={styles.cardDescription}>{t('recordNewIncomeSource') || 'Record a new income source'}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardSubtext}>{t('quickAndEasy') || 'Quick and easy'}</Text>
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
              <Text style={styles.cardTitle}>{t('addExpense')}</Text>
            </View>
            <Text style={styles.cardDescription}>{t('logNewExpense') || 'Log a new expense'}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardSubtext}>{t('trackYourSpending') || 'Track your spending'}</Text>
              <Ionicons name="arrow-forward" size={20} color="#f44336" />
            </View>
          </TouchableOpacity>
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
});