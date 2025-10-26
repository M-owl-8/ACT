import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { ExpenseTypeColors } from '../constants/colors';

const { width } = Dimensions.get('window');

type ReportRange = 'day' | 'week' | '15d' | 'month' | 'last3m';

interface ReportData {
  range: string;
  start_date: string;
  end_date: string;
  income_total: number;
  expense_total: number;
  net: number;
  expense_by_type: {
    mandatory: number;
    neutral: number;
    excess: number;
  };
  top_categories: Array<{
    category_id: number;
    category_name: string;
    category_icon: string | null;
    category_color: string | null;
    expense_type: string | null;
    total: number;
    count: number;
  }>;
  excess_alert: {
    excess_over_threshold: boolean;
    excess_total: number;
    mandatory_total: number;
    threshold_value: number;
    message: string | null;
  };
}

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const [languageChangeKey, setLanguageChangeKey] = useState(0);
  
  const TABS: Array<{ key: ReportRange; label: string }> = [
    { key: 'day', label: t('daily') || 'Daily' },
    { key: 'week', label: t('week') },
    { key: '15d', label: t('fifteenDays') || '15 Days' },
    { key: 'month', label: t('month') },
    { key: 'last3m', label: t('last3Months') || 'Last 3m' },
  ];
  const [activeTab, setActiveTab] = useState<ReportRange>('month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  // Listen for language changes and force re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageChangeKey(prev => prev + 1);
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      console.log(`Fetching report for range: ${activeTab}`);
      const response = await api.get(`/reports/summary?range=${activeTab}`);
      console.log('Report data received:', response.data);
      
      if (response.data) {
        setReportData(response.data);
      } else {
        console.warn('Report data is empty');
        setReportData(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch report:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = t('failedToLoadReportData') || 'Failed to load report data. ';
      
      if (error.response) {
        errorMessage += error.response.data?.detail || 
                       error.response.data?.message || 
                       `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += t('networkErrorMessage');
      } else {
        errorMessage += error.message || t('unknownError') || 'Unknown error occurred';
      }
      
      Alert.alert(
        t('errorLoadingReport') || 'Error Loading Report',
        errorMessage,
        [
          {
            text: t('retry') || 'Retry',
            onPress: () => fetchReport(),
          },
          {
            text: t('cancel'),
            style: 'cancel',
          },
        ]
      );
      
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderExcessAlert = () => {
    if (!reportData?.excess_alert.excess_over_threshold) return null;

    return (
      <View style={styles.alertBanner}>
        <Ionicons name="warning" size={24} color="#333" />
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>⚠️ Excess Spending Alert</Text>
          <Text style={styles.alertMessage}>
            Your excess spending ({formatCurrency(reportData.excess_alert.excess_total)}) 
            exceeds 50% of mandatory expenses ({formatCurrency(reportData.excess_alert.mandatory_total)})
          </Text>
        </View>
      </View>
    );
  };

  const renderSummaryCards = () => {
    if (!reportData) return null;

    return (
      <View style={styles.summaryContainer}>
        {/* Income Card */}
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Ionicons name="arrow-down-circle" size={32} color="#666" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(reportData.income_total)}</Text>
        </View>

        {/* Expense Card */}
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="arrow-up-circle" size={32} color="#333" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(reportData.expense_total)}</Text>
        </View>

        {/* Net Balance Card */}
        <View style={[styles.summaryCard, styles.netCard]}>
          <Ionicons 
            name={reportData.net >= 0 ? "trending-up" : "trending-down"} 
            size={32} 
            color={reportData.net >= 0 ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.summaryLabel}>Net Balance</Text>
          <Text style={[
            styles.summaryAmount,
            reportData.net >= 0 ? styles.positiveAmount : styles.negativeAmount
          ]}>
            {formatCurrency(reportData.net)}
          </Text>
        </View>
      </View>
    );
  };

  const renderExpenseBreakdown = () => {
    if (!reportData) return null;

    const { mandatory, neutral, excess } = reportData.expense_by_type;
    const total = mandatory + neutral + excess;

    const getPercentage = (value: number) => {
      if (total === 0) return 0;
      return (value / total) * 100;
    };

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        
        {/* Visual Bar Chart */}
        <View style={styles.barChartContainer}>
          <View style={styles.barChart}>
            {mandatory > 0 && (
              <View 
                style={[
                  styles.barSegment, 
                  styles.mandatoryBar,
                  { width: `${getPercentage(mandatory)}%` }
                ]} 
              />
            )}
            {neutral > 0 && (
              <View 
                style={[
                  styles.barSegment, 
                  styles.neutralBar,
                  { width: `${getPercentage(neutral)}%` }
                ]} 
              />
            )}
            {excess > 0 && (
              <View 
                style={[
                  styles.barSegment, 
                  styles.excessBar,
                  { width: `${getPercentage(excess)}%` }
                ]} 
              />
            )}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.MANDATORY }]} />
            <Text style={styles.legendText}>Mandatory</Text>
            <Text style={styles.legendAmount}>{formatCurrency(mandatory)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.NEUTRAL }]} />
            <Text style={styles.legendText}>Neutral</Text>
            <Text style={styles.legendAmount}>{formatCurrency(neutral)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.EXCESS }]} />
            <Text style={styles.legendText}>Excess</Text>
            <Text style={styles.legendAmount}>{formatCurrency(excess)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTopCategories = () => {
    if (!reportData || reportData.top_categories.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <Text style={styles.emptyText}>No spending data available</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Spending Categories</Text>
        {reportData.top_categories.map((category, index) => (
          <View key={category.category_id} style={styles.categoryItem}>
            <View style={styles.categoryRank}>
              <Text style={styles.rankText}>{index + 1}</Text>
            </View>
            <View style={styles.categoryInfo}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.category_icon || '📦'}</Text>
                <Text style={styles.categoryName}>{category.category_name}</Text>
              </View>
              <Text style={styles.categoryCount}>{category.count} transactions</Text>
            </View>
            <Text style={styles.categoryAmount}>{formatCurrency(category.total)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderDateRange = () => {
    if (!reportData) return null;

    return (
      <View style={styles.dateRangeContainer}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.dateRangeText}>
          {formatDate(reportData.start_date)} - {formatDate(reportData.end_date)}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView key={languageChangeKey} style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity onPress={fetchReport}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {renderTabs()}
      {renderDateRange()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      ) : !reportData ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyMessage}>
            Start tracking your income and expenses to see reports here.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReport}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderExcessAlert()}
          {renderSummaryCards()}
          {renderExpenseBreakdown()}
          {renderTopCategories()}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    gap: 6,
  },
  dateRangeText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderLeftWidth: 4,
    borderLeftColor: '#333',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    gap: 12,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incomeCard: {
    borderTopWidth: 3,
    borderTopColor: '#333',
  },
  expenseCard: {
    borderTopWidth: 3,
    borderTopColor: '#000',
  },
  netCard: {
    width: '100%',
    borderTopWidth: 3,
    borderTopColor: '#555',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  positiveAmount: {
    color: '#4CAF50',
  },
  negativeAmount: {
    color: '#F44336',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  barChartContainer: {
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  mandatoryBar: {
    backgroundColor: ExpenseTypeColors.MANDATORY,
  },
  neutralBar: {
    backgroundColor: ExpenseTypeColors.NEUTRAL,
  },
  excessBar: {
    backgroundColor: ExpenseTypeColors.EXCESS,
  },
  legendContainer: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 12,
  },
  categoryRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});