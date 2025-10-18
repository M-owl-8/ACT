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
import { api } from '../api/client';
import { SAMURAI_COLORS, SAMURAI_PATTERNS } from '../theme/SAMURAI_COLORS';

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

const TABS: Array<{ key: ReportRange; label: string }> = [
  { key: 'day', label: 'Daily' },
  { key: 'week', label: 'Weekly' },
  { key: '15d', label: '15 Days' },
  { key: 'month', label: 'Monthly' },
  { key: 'last3m', label: 'Last 3m' },
];

export default function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<ReportRange>('month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

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
      
      let errorMessage = 'Failed to load report data. ';
      
      if (error.response) {
        errorMessage += error.response.data?.detail || 
                       error.response.data?.message || 
                       `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Please check your internet connection.';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }
      
      Alert.alert(
        'Error Loading Report',
        errorMessage,
        [
          {
            text: 'Retry',
            onPress: () => fetchReport(),
          },
          {
            text: 'Cancel',
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
        <Ionicons name="warning" size={24} color="#FF6B6B" />
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
          <Ionicons name="arrow-down-circle" size={32} color="#4CAF50" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(reportData.income_total)}</Text>
        </View>

        {/* Expense Card */}
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="arrow-up-circle" size={32} color="#FF6B6B" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(reportData.expense_total)}</Text>
        </View>

        {/* Net Balance Card */}
        <View style={[styles.summaryCard, styles.netCard]}>
          <Ionicons 
            name={reportData.net >= 0 ? "trending-up" : "trending-down"} 
            size={32} 
            color={reportData.net >= 0 ? "#4CAF50" : "#FF6B6B"} 
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
            <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>Mandatory</Text>
            <Text style={styles.legendAmount}>{formatCurrency(mandatory)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>Neutral</Text>
            <Text style={styles.legendAmount}>{formatCurrency(neutral)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity onPress={fetchReport}>
          <Ionicons name="refresh" size={24} color={SAMURAI_COLORS.accent.red} />
        </TouchableOpacity>
      </View>

      {renderTabs()}
      {renderDateRange()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={SAMURAI_COLORS.accent.red} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      ) : !reportData ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={80} color={SAMURAI_COLORS.text.tertiary} />
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptyMessage}>
            Start tracking your income and expenses to see reports here.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReport}
          >
            <Ionicons name="refresh" size={20} color={SAMURAI_COLORS.text.primary} />
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
    backgroundColor: SAMURAI_COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 2,
    borderBottomColor: SAMURAI_COLORS.accent.red,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
  },
  tabsContainer: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: SAMURAI_COLORS.accent.red,
  },
  tabText: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: SAMURAI_COLORS.accent.red,
    fontWeight: 'bold',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: SAMURAI_COLORS.background.surface,
    gap: 6,
  },
  dateRangeText: {
    fontSize: 12,
    color: SAMURAI_COLORS.text.secondary,
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
    color: SAMURAI_COLORS.text.secondary,
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
    color: SAMURAI_COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SAMURAI_COLORS.accent.red,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: SAMURAI_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: SAMURAI_COLORS.opacity.redSubtle,
    borderLeftWidth: 4,
    borderLeftColor: SAMURAI_COLORS.accent.red,
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
    color: SAMURAI_COLORS.accent.red,
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: SAMURAI_COLORS.accent.red,
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
    backgroundColor: SAMURAI_COLORS.background.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  incomeCard: {
    borderTopWidth: 3,
    borderTopColor: SAMURAI_COLORS.semantic.income,
  },
  expenseCard: {
    borderTopWidth: 3,
    borderTopColor: SAMURAI_COLORS.accent.red,
  },
  netCard: {
    width: '100%',
    borderTopWidth: 3,
    borderTopColor: SAMURAI_COLORS.semantic.info,
  },
  summaryLabel: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.secondary,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
  },
  positiveAmount: {
    color: SAMURAI_COLORS.semantic.income,
  },
  negativeAmount: {
    color: SAMURAI_COLORS.accent.red,
  },
  section: {
    backgroundColor: SAMURAI_COLORS.background.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    ...SAMURAI_PATTERNS.shadowSmall,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
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
    backgroundColor: SAMURAI_COLORS.semantic.info,
  },
  neutralBar: {
    backgroundColor: SAMURAI_COLORS.semantic.neutral,
  },
  excessBar: {
    backgroundColor: SAMURAI_COLORS.accent.red,
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
    color: SAMURAI_COLORS.text.secondary,
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: SAMURAI_COLORS.text.primary,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: SAMURAI_COLORS.border.primary,
    gap: 12,
  },
  categoryRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: SAMURAI_COLORS.accent.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.text.primary,
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
    color: SAMURAI_COLORS.text.primary,
  },
  categoryCount: {
    fontSize: 12,
    color: SAMURAI_COLORS.text.tertiary,
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SAMURAI_COLORS.accent.red,
  },
  emptyText: {
    fontSize: 14,
    color: SAMURAI_COLORS.text.tertiary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});