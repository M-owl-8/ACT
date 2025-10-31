import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../store/settings';
import { SAMURAI_COLORS } from '../theme/SAMURAI_COLORS';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

interface CurrencySelectionScreenProps {
  onComplete?: () => void;
}

export default function CurrencySelectionScreen({ onComplete }: CurrencySelectionScreenProps) {
  const { t } = useTranslation();
  const { currency, setCurrency } = useSettingsStore();
  const [selectedCurrency, setSelectedCurrency] = useState(currency || 'USD');
  const [loading, setLoading] = useState(false);

  const handleSelectCurrency = async (code: string) => {
    setSelectedCurrency(code);
    setLoading(true);
    
    try {
      await setCurrency(code);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 300);
    } catch (error) {
      console.error('Failed to set currency:', error);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('selectCurrency') || 'Select Currency'}</Text>
        <Text style={styles.subtitle}>
          {t('currencySelectionMessage') || 'Please choose your currency. You can\'t change it later.'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {CURRENCIES.map((curr) => (
          <TouchableOpacity
            key={curr.code}
            style={[
              styles.currencyButton,
              selectedCurrency === curr.code && styles.currencyButtonSelected,
            ]}
            onPress={() => handleSelectCurrency(curr.code)}
            disabled={loading}
          >
            <View style={styles.currencyInfo}>
              <Text style={styles.currencySymbol}>{curr.symbol}</Text>
              <View style={styles.currencyDetails}>
                <Text style={styles.currencyCode}>{curr.code}</Text>
                <Text style={styles.currencyName}>{curr.name}</Text>
              </View>
            </View>
            
            {selectedCurrency === curr.code && (
              <View style={styles.checkmark}>
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currencyButtonSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginRight: 16,
    width: 40,
    textAlign: 'center',
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 13,
    fontWeight: '400',
    color: '#999',
  },
  checkmark: {
    marginLeft: 12,
  },
});