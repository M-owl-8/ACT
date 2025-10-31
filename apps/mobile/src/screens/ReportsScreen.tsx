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
import { ExpenseTypeColors } from '../constants/colors';
import { useSettingsStore } from '../store/settings';
import { formatCurrency as formatCurrencyUtil } from '../utils/currencyFormatter';
import { getEntryTotals, getEntries } from '../services/database';

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
  const { currency } = useSettingsStore();
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
      console.log(`Generating report for range: ${activeTab}`);
      
      // Get date range based on active tab
      const now = new Date();
      let startDate = new Date();
      
      switch (activeTab) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case '15d':
          startDate.setDate(now.getDate() - 15);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'last3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      // Get all entries in the date range
      const entries = await getEntries();
      const filteredEntries = (entries || []).filter(e => {
        const entryDate = new Date(e.booked_at);
        return entryDate >= startDate && entryDate <= now;
      });
      
      // Calculate totals
      let incomeTotal = 0;
      let expenseTotal = 0;
      const categoryTotals: Record<number, { name: string; icon: string; type: string; total: number; count: number }> = {};
      const expenseByType = { mandatory: 0, neutral: 0, excess: 0 };
      
      filteredEntries.forEach(entry => {
        if (entry.type === 'income') {
          incomeTotal += entry.amount || 0;
        } else {
          expenseTotal += entry.amount || 0;
          const typeKey = entry.expense_type as keyof typeof expenseByType;
          if (typeKey && expenseByType.hasOwnProperty(typeKey)) {
            expenseByType[typeKey] += entry.amount || 0;
          }
          
          if (entry.category_id) {
            if (!categoryTotals[entry.category_id]) {
              categoryTotals[entry.category_id] = {
                name: entry.category_name || 'Other',
                icon: entry.category_icon || '📦',
                type: entry.expense_type || 'neutral',
                total: 0,
                count: 0,
              };
            }
            categoryTotals[entry.category_id].total += entry.amount || 0;
            categoryTotals[entry.category_id].count += 1;
          }
        }
      });
      
      const topCategories = Object.entries(categoryTotals)
        .map(([id, data]) => ({
          category_id: parseInt(id),
          category_name: data.name,
          category_icon: data.icon,
          category_color: null,
          expense_type: data.type,
          total: data.total,
          count: data.count,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      
      const reportData: ReportData = {
        range: activeTab,
        start_date: startDate.toISOString().split('T')[0],
        end_date: now.toISOString().split('T')[0],
        income_total: incomeTotal,
        expense_total: expenseTotal,
        net: incomeTotal - expenseTotal,
        expense_by_type: expenseByType,
        top_categories: topCategories,
        excess_alert: {
          excess_over_threshold: expenseByType.excess > (incomeTotal * 0.3),
          excess_total: expenseByType.excess,
          mandatory_total: expenseByType.mandatory,
          threshold_value: incomeTotal * 0.3,
          message: null,
        },
      };
      
      setReportData(reportData);
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency || 'USD', 2);
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
          <Text style={styles.alertTitle}>{t('excessSpendingAlert')}</Text>
          <Text style={styles.alertMessage}>
            {t('yourExcessSpending')} ({formatCurrency(reportData.excess_alert.excess_total)}) 
            {t('exceedsThreshold')} ({formatCurrency(reportData.excess_alert.mandatory_total)})
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
          <Text style={styles.summaryLabel}>{t('income')}</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(reportData.income_total)}</Text>
        </View>

        {/* Expense Card */}
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="arrow-up-circle" size={32} color="#333" />
          <Text style={styles.summaryLabel}>{t('expenses')}</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(reportData.expense_total)}</Text>
        </View>

        {/* Net Balance Card */}
        <View style={[styles.summaryCard, styles.netCard]}>
          <Ionicons 
            name={reportData.net >= 0 ? "trending-up" : "trending-down"} 
            size={32} 
            color={reportData.net >= 0 ? "#4CAF50" : "#F44336"} 
          />
          <Text style={styles.summaryLabel}>{t('netBalance')}</Text>
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
        <Text style={styles.sectionTitle}>{t('expenseBreakdown')}</Text>
        
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
            <Text style={styles.legendText}>{t('mandatory')}</Text>
            <Text style={styles.legendAmount}>{formatCurrency(mandatory)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.NEUTRAL }]} />
            <Text style={styles.legendText}>{t('neutral')}</Text>
            <Text style={styles.legendAmount}>{formatCurrency(neutral)}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: ExpenseTypeColors.EXCESS }]} />
            <Text style={styles.legendText}>{t('excess')}</Text>
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
          <Text style={styles.sectionTitle}>{t('topCategories')}</Text>
          <Text style={styles.emptyText}>{t('noSpendingData')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('topSpendingCategories')}</Text>
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
              <Text style={styles.categoryCount}>{category.count} {t('transactions')}</Text>
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
        <Text style={styles.headerTitle}>{t('reports')}</Text>
        <TouchableOpacity onPress={fetchReport}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {renderTabs()}
      {renderDateRange()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>{t('loadingReport')}</Text>
        </View>
      ) : !reportData ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>{t('noDataAvailable')}</Text>
          <Text style={styles.emptyMessage}>
            {t('startTrackingMessage')}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReport}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
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